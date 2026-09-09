from __future__ import annotations

import codecs
import csv
import hashlib
import os
from collections import OrderedDict
from pathlib import Path

from database import db, utc_now
from analytics import rebuild_dashboard_cache

REQUIRED_HEADERS = [
    'FECHA_CORTE','ID','DIA_SOLICITACITA','DIA_CITA','ESPECIALIDAD','SEXO','EDAD','SEGURO',
    'PRESENCIAL_REMOTO','ATENDIDO','MONTO','DEPARTAMENTO','PROVINCIA','DISTRITO','UBIGEO'
]


def detect_encoding(file_path: Path) -> str:
    decoder = codecs.getincrementaldecoder('utf-8')('strict')
    try:
        with file_path.open('rb') as f:
            while True:
                chunk = f.read(1024 * 1024)
                if not chunk:
                    break
                decoder.decode(chunk)
            decoder.decode(b'', final=True)
        return 'utf-8-sig'
    except UnicodeDecodeError:
        return 'cp1252'


def file_sha256(file_path: Path) -> str:
    h = hashlib.sha256()
    with file_path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def date8(value: str | None) -> str | None:
    text = str(value or '').strip()
    if len(text) != 8 or not text.isdigit():
        return None
    year, month, day = text[:4], text[4:6], text[6:8]
    try:
        import datetime as _dt
        _dt.date(int(year), int(month), int(day))
    except ValueError:
        return None
    return f'{year}-{month}-{day}'


def yes_no(value: str | None) -> int | None:
    text = str(value or '').strip().upper()
    if text in {'SI', 'SÍ'}:
        return 1
    if text == 'NO':
        return 0
    return None


def number(value, integer=False):
    text = str(value or '').strip().replace(',', '.')
    if not text:
        return None
    try:
        n = float(text)
        return int(n) if integer else n
    except ValueError:
        return None


def normalize_row(row: dict) -> tuple | None:
    patient_id = number(row.get('ID'), integer=True)
    if patient_id is None:
        return None
    return (
        patient_id,
        date8(row.get('FECHA_CORTE')),
        date8(row.get('DIA_SOLICITACITA')),
        date8(row.get('DIA_CITA')),
        str(row.get('ESPECIALIDAD') or '').strip() or 'SIN DATO',
        str(row.get('SEXO') or '').strip() or None,
        number(row.get('EDAD'), integer=True),
        yes_no(row.get('SEGURO')),
        str(row.get('PRESENCIAL_REMOTO') or '').strip() or None,
        yes_no(row.get('ATENDIDO')),
        number(row.get('MONTO')) or 0.0,
        str(row.get('DEPARTAMENTO') or '').strip() or None,
        str(row.get('PROVINCIA') or '').strip() or None,
        str(row.get('DISTRITO') or '').strip() or None,
        str(row.get('UBIGEO') or '').strip() or None,
    )


APPOINTMENT_SQL = '''
INSERT INTO appointments (
 dataset_id, patient_id, fecha_corte, fecha_solicitud, fecha_cita, especialidad,
 sexo, edad, seguro, modalidad, atendido, monto, departamento, provincia, distrito, ubigeo
) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
'''

APPOINTMENT_COLUMNS = (
    'dataset_id','patient_id','fecha_corte','fecha_solicitud','fecha_cita','especialidad',
    'sexo','edad','seguro','modalidad','atendido','monto','departamento','provincia','distrito','ubigeo'
)

PATIENT_COLUMNS = (
    'patient_id','sexo','edad','seguro','departamento','provincia','distrito','ubigeo',
    'first_seen','last_seen','updated_at'
)

PATIENT_SQL = '''
INSERT INTO patients (
 patient_id, sexo, edad, seguro, departamento, provincia, distrito, ubigeo, first_seen, last_seen, updated_at
) VALUES (?,?,?,?,?,?,?,?,?,?,?)
ON CONFLICT(patient_id) DO UPDATE SET
 sexo=excluded.sexo,
 edad=excluded.edad,
 seguro=excluded.seguro,
 departamento=excluded.departamento,
 provincia=excluded.provincia,
 distrito=excluded.distrito,
 ubigeo=excluded.ubigeo,
 first_seen=CASE
   WHEN patients.first_seen IS NULL THEN excluded.first_seen
   WHEN excluded.first_seen IS NULL THEN patients.first_seen
   WHEN excluded.first_seen < patients.first_seen THEN excluded.first_seen
   ELSE patients.first_seen END,
 last_seen=CASE
   WHEN patients.last_seen IS NULL THEN excluded.last_seen
   WHEN excluded.last_seen IS NULL THEN patients.last_seen
   WHEN excluded.last_seen > patients.last_seen THEN excluded.last_seen
   ELSE patients.last_seen END,
 updated_at=excluded.updated_at
'''


def _patient_from_row(row: tuple, now: str) -> tuple:
    patient_id, _cutoff, _request, appointment, _specialty, sex, age, insured, _modality, _attended, _amount, department, province, district, ubigeo = row
    return (patient_id, sex, age, insured, department, province, district, ubigeo, appointment, appointment, now)


def import_hospital_csv(file_path: str | Path, original_name: str, uploaded_by: int) -> dict:
    path = Path(file_path)
    sha = file_sha256(path)

    with db() as conn:
        previous = conn.execute(
            "SELECT id, rows_imported FROM datasets WHERE file_hash=? AND status='procesado' ORDER BY id DESC LIMIT 1",
            (sha,),
        ).fetchone()
        if previous:
            return {
                'datasetId': previous['id'],
                'rowsImported': previous['rows_imported'],
                'alreadyImported': True,
            }
        cur = conn.execute(
            "INSERT INTO datasets(filename,original_name,file_hash,status,uploaded_by,uploaded_at) VALUES (?,?,?,?,?,?) RETURNING id",
            (path.name, original_name, sha, 'procesando', uploaded_by, utc_now()),
        )
        dataset_id = cur.fetchone()['id']
        conn.commit()

    rows_imported = 0
    min_date = None
    max_date = None
    cutoff_date = None
    encoding = detect_encoding(path)

    try:
        with db() as conn:
            conn.execute('CREATE TEMP TABLE patient_import_batch (LIKE patients INCLUDING DEFAULTS) ON COMMIT DROP')
            with path.open('r', encoding=encoding, newline='') as f:
                reader = csv.DictReader(f, delimiter=';')
                if reader.fieldnames is None:
                    raise ValueError('El archivo CSV no contiene cabecera.')
                headers = [str(h or '').lstrip('\ufeff').strip() for h in reader.fieldnames]
                missing = [h for h in REQUIRED_HEADERS if h not in headers]
                if missing:
                    raise ValueError('Faltan columnas requeridas: ' + ', '.join(missing))
                reader.fieldnames = headers

                appointment_batch: list[tuple] = []
                patient_batch: OrderedDict[int, tuple] = OrderedDict()
                now = utc_now()

                def flush():
                    nonlocal appointment_batch, patient_batch
                    if appointment_batch:
                        conn.copy_rows('appointments', APPOINTMENT_COLUMNS, appointment_batch)
                        appointment_batch = []
                    if patient_batch:
                        conn.copy_rows('patient_import_batch', PATIENT_COLUMNS, list(patient_batch.values()))
                        conn.execute('''
                            INSERT INTO patients (patient_id,sexo,edad,seguro,departamento,provincia,distrito,ubigeo,first_seen,last_seen,updated_at)
                            SELECT patient_id,sexo,edad,seguro,departamento,provincia,distrito,ubigeo,first_seen,last_seen,updated_at
                            FROM patient_import_batch
                            ON CONFLICT(patient_id) DO UPDATE SET
                              sexo=EXCLUDED.sexo, edad=EXCLUDED.edad, seguro=EXCLUDED.seguro,
                              departamento=EXCLUDED.departamento, provincia=EXCLUDED.provincia,
                              distrito=EXCLUDED.distrito, ubigeo=EXCLUDED.ubigeo,
                              first_seen=LEAST(patients.first_seen,EXCLUDED.first_seen),
                              last_seen=GREATEST(patients.last_seen,EXCLUDED.last_seen),
                              updated_at=EXCLUDED.updated_at
                        ''')
                        conn.execute('TRUNCATE patient_import_batch')
                        patient_batch = OrderedDict()

                for raw in reader:
                    row = normalize_row(raw)
                    if row is None:
                        continue
                    patient_id = row[0]
                    fecha_cita = row[3]
                    fecha_corte = row[1]
                    if fecha_cita:
                        min_date = fecha_cita if min_date is None or fecha_cita < min_date else min_date
                        max_date = fecha_cita if max_date is None or fecha_cita > max_date else max_date
                    if fecha_corte:
                        cutoff_date = fecha_corte if cutoff_date is None or fecha_corte > cutoff_date else cutoff_date

                    appointment_batch.append((dataset_id, *row))
                    p = _patient_from_row(row, now)
                    old = patient_batch.get(patient_id)
                    if old:
                        first_seen = old[8]
                        last_seen = old[9]
                        if p[8] and (first_seen is None or p[8] < first_seen):
                            first_seen = p[8]
                        if p[9] and (last_seen is None or p[9] > last_seen):
                            last_seen = p[9]
                        p = (*p[:8], first_seen, last_seen, now)
                    patient_batch[patient_id] = p
                    rows_imported += 1

                    if len(appointment_batch) >= 5000:
                        flush()

                flush()
            conn.commit()

        with db() as conn:
            conn.execute(
                '''UPDATE datasets SET status='procesado', rows_imported=?, processed_at=?,
                   min_appointment_date=?, max_appointment_date=?, cutoff_date=? WHERE id=?''',
                (rows_imported, utc_now(), min_date, max_date, cutoff_date, dataset_id),
            )
            conn.commit()

        rebuild_dashboard_cache(dataset_id)

        return {'datasetId': dataset_id, 'rowsImported': rows_imported, 'alreadyImported': False}
    except Exception as exc:
        with db() as conn:
            conn.execute('DELETE FROM appointments WHERE dataset_id=?', (dataset_id,))
            conn.execute(
                "UPDATE datasets SET status='error', error_message=?, processed_at=? WHERE id=?",
                (str(exc)[:1000], utc_now(), dataset_id),
            )
            conn.commit()
        raise
