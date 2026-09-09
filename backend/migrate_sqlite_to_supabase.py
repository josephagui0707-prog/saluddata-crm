"""Migra una base SaludData existente de SQLite a Supabase PostgreSQL.

Uso (desde la carpeta backend):
  python migrate_sqlite_to_supabase.py data/saluddata.db
"""
from __future__ import annotations

import sqlite3
import sys
import gzip
import shutil
import tempfile
import os
from pathlib import Path

from database import db, init_db
from analytics import rebuild_dashboard_cache

TABLES = ('users', 'login_codes', 'datasets', 'appointments', 'patients')
BATCH_SIZE = 5000


def migrate(source_path: Path) -> None:
    if not source_path.exists():
        raise SystemExit(f'No existe la base SQLite: {source_path}')
    temporary_path = None
    if source_path.suffix == '.gz':
        handle, name = tempfile.mkstemp(suffix='.db')
        os.close(handle)
        Path(name).unlink(missing_ok=True)
        temporary_path = Path(name)
        with gzip.open(source_path, 'rb') as compressed, temporary_path.open('wb') as output:
            shutil.copyfileobj(compressed, output, length=1024 * 1024)
        source_path = temporary_path
    init_db()
    source = sqlite3.connect(source_path)
    source.row_factory = sqlite3.Row

    with db() as target:
        for table in TABLES:
            columns = [row['name'] for row in source.execute(f'PRAGMA table_info({table})')]
            if not columns:
                continue
            column_list = ','.join(columns)
            placeholders = ','.join('?' for _ in columns)
            update_columns = [column for column in columns if column != ('patient_id' if table == 'patients' else 'id')]
            conflict_key = 'patient_id' if table == 'patients' else 'id'
            updates = ','.join(f'{column}=EXCLUDED.{column}' for column in update_columns)
            sql = (
                f'INSERT INTO {table} ({column_list}) VALUES ({placeholders}) '
                f'ON CONFLICT ({conflict_key}) DO UPDATE SET {updates}'
            )
            cursor = source.execute(f'SELECT {column_list} FROM {table}')
            total = 0
            fast_copy = table == 'appointments' and target.execute('SELECT COUNT(*) total FROM appointments').fetchone()['total'] == 0
            while True:
                rows = cursor.fetchmany(BATCH_SIZE)
                if not rows:
                    break
                values = [tuple(row[column] for column in columns) for row in rows]
                if fast_copy:
                    target.copy_rows(table, columns, values)
                else:
                    target.executemany(sql, values)
                total += len(rows)
                print(f'{table}: {total} registros')
            target.commit()

        for table in ('users', 'login_codes', 'datasets', 'appointments'):
            target.execute(
                f"SELECT setval(pg_get_serial_sequence('{table}','id'), "
                f"COALESCE((SELECT MAX(id) FROM {table}),1), true)"
            )
        target.commit()
    source.close()
    if temporary_path:
        temporary_path.unlink(missing_ok=True)
    with db() as target:
        dataset_ids = [row['id'] for row in target.execute("SELECT id FROM datasets WHERE status='procesado'").fetchall()]
    for dataset_id in dataset_ids:
        print(f'Generando resumen optimizado del dataset {dataset_id}...')
        rebuild_dashboard_cache(dataset_id)
    print('Migración terminada correctamente.')


if __name__ == '__main__':
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('../cloud_seed/saluddata.db.gz')
    migrate(path)
