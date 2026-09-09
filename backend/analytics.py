from __future__ import annotations

import json

from database import db, utc_now


def _dicts(rows):
    return [dict(row) for row in rows]


def rebuild_dashboard_cache(dataset_id: int) -> dict:
    """Calcula una vez los indicadores de un dataset y guarda el resultado."""
    with db() as conn:
        summary = conn.execute(
            '''SELECT COUNT(*) total_records,
                      COALESCE(SUM(CASE WHEN atendido=1 THEN 1 ELSE 0 END),0) attended,
                      COALESCE(SUM(CASE WHEN atendido=0 THEN 1 ELSE 0 END),0) not_attended,
                      COALESCE(SUM(monto),0) total_amount,
                      COALESCE(AVG(monto),0) avg_amount,
                      COUNT(DISTINCT patient_id) patients,
                      COUNT(DISTINCT especialidad) specialties,
                      COALESCE(AVG(CASE WHEN fecha_solicitud IS NOT NULL AND fecha_cita IS NOT NULL
                        THEN fecha_cita::date-fecha_solicitud::date END),0) avg_wait_days
               FROM appointments WHERE dataset_id=?''', (dataset_id,)
        ).fetchone()
        dataset = conn.execute(
            'SELECT original_name,cutoff_date,min_appointment_date,max_appointment_date FROM datasets WHERE id=?',
            (dataset_id,),
        ).fetchone()
        specialties = _dicts(conn.execute(
            'SELECT especialidad label,COUNT(*) value FROM appointments WHERE dataset_id=? GROUP BY especialidad ORDER BY value DESC LIMIT 10',
            (dataset_id,),
        ).fetchall())
        specialty_report = _dicts(conn.execute(
            '''SELECT especialidad,COUNT(*) total,
                      SUM(CASE WHEN atendido=1 THEN 1 ELSE 0 END) atendidos,
                      SUM(CASE WHEN atendido=0 THEN 1 ELSE 0 END) no_atendidos,
                      ROUND(AVG(monto)::numeric,2) monto_promedio
               FROM appointments WHERE dataset_id=? GROUP BY especialidad ORDER BY total DESC''',
            (dataset_id,),
        ).fetchall())
        modality = _dicts(conn.execute(
            "SELECT COALESCE(modalidad,'SIN DATO') label,COUNT(*) value FROM appointments WHERE dataset_id=? GROUP BY modalidad ORDER BY value DESC",
            (dataset_id,),
        ).fetchall())
        attendance = _dicts(conn.execute(
            "SELECT CASE WHEN atendido=1 THEN 'Atendidos' ELSE 'No atendidos' END label,COUNT(*) value FROM appointments WHERE dataset_id=? GROUP BY atendido ORDER BY atendido DESC",
            (dataset_id,),
        ).fetchall())
        gender = _dicts(conn.execute(
            "SELECT COALESCE(sexo,'SIN DATO') label,COUNT(*) value FROM appointments WHERE dataset_id=? GROUP BY sexo ORDER BY value DESC",
            (dataset_id,),
        ).fetchall())
        districts = _dicts(conn.execute(
            "SELECT COALESCE(distrito,'SIN DATO') label,COUNT(*) value FROM appointments WHERE dataset_id=? GROUP BY distrito ORDER BY value DESC LIMIT 10",
            (dataset_id,),
        ).fetchall())
        ages = _dicts(conn.execute(
            '''SELECT CASE WHEN edad BETWEEN 0 AND 17 THEN '0-17 años'
                          WHEN edad BETWEEN 18 AND 35 THEN '18-35 años'
                          WHEN edad BETWEEN 36 AND 59 THEN '36-59 años'
                          WHEN edad >= 60 THEN '60+ años' ELSE 'Sin dato' END label,
                      COUNT(*) value
               FROM appointments WHERE dataset_id=? GROUP BY label
               ORDER BY CASE label WHEN '0-17 años' THEN 1 WHEN '18-35 años' THEN 2
                                   WHEN '36-59 años' THEN 3 WHEN '60+ años' THEN 4 ELSE 5 END''',
            (dataset_id,),
        ).fetchall())
        monthly = _dicts(conn.execute(
            '''SELECT substr(fecha_cita,1,7) month,COUNT(*) total,
                      SUM(CASE WHEN atendido=1 THEN 1 ELSE 0 END) attended
               FROM appointments WHERE dataset_id=? AND fecha_cita IS NOT NULL
               GROUP BY month ORDER BY month''', (dataset_id,)
        ).fetchall())
        top = conn.execute(
            '''SELECT
                (SELECT modalidad FROM appointments WHERE dataset_id=? GROUP BY modalidad ORDER BY COUNT(*) DESC LIMIT 1) main_modality,
                (SELECT departamento FROM appointments WHERE dataset_id=? GROUP BY departamento ORDER BY COUNT(*) DESC LIMIT 1) department,
                (SELECT distrito FROM appointments WHERE dataset_id=? GROUP BY distrito ORDER BY COUNT(*) DESC LIMIT 1) district''',
            (dataset_id, dataset_id, dataset_id),
        ).fetchone()

        payload = {
            'datasetId': dataset_id,
            'summary': {
                'datasetId': dataset_id,
                'totalRecords': int(summary['total_records'] or 0),
                'attended': int(summary['attended'] or 0),
                'notAttended': int(summary['not_attended'] or 0),
                'totalAmount': float(summary['total_amount'] or 0),
                'avgAmount': float(summary['avg_amount'] or 0),
                'patients': int(summary['patients'] or 0),
                'specialties': int(summary['specialties'] or 0),
                'avgWaitDays': round(float(summary['avg_wait_days'] or 0), 1),
                'fileName': dataset['original_name'] if dataset else '',
                'cutoffDate': dataset['cutoff_date'] if dataset else None,
                'minAppointmentDate': dataset['min_appointment_date'] if dataset else None,
                'maxAppointmentDate': dataset['max_appointment_date'] if dataset else None,
                'mainModality': top['main_modality'] or '',
                'department': top['department'] or '',
                'district': top['district'] or '',
            },
            'specialties': specialties,
            'specialtyReport': specialty_report,
            'modality': modality,
            'attendance': attendance,
            'gender': gender,
            'districts': districts,
            'ages': ages,
            'monthly': monthly,
        }
        conn.execute(
            '''INSERT INTO dataset_analytics(dataset_id,payload,generated_at) VALUES (?,?,?)
               ON CONFLICT(dataset_id) DO UPDATE SET payload=EXCLUDED.payload,generated_at=EXCLUDED.generated_at''',
            (dataset_id, json.dumps(payload, ensure_ascii=False), utc_now()),
        )
        conn.commit()
        return payload


def get_dashboard_cache(dataset_id: int) -> dict:
    with db() as conn:
        row = conn.execute('SELECT payload FROM dataset_analytics WHERE dataset_id=?', (dataset_id,)).fetchone()
    if not row:
        return rebuild_dashboard_cache(dataset_id)
    payload = row['payload']
    return json.loads(payload) if isinstance(payload, str) else payload
