from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime, timezone
import re

import psycopg
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from config import DATABASE_URL, ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD, ADMIN_USERNAME
from security import hash_password

SCHEMA = r'''
CREATE TABLE IF NOT EXISTS users (
 id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, username TEXT NOT NULL, email TEXT NOT NULL,
 password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'Analista' CHECK (role IN ('Administrador','Analista')),
 active SMALLINT NOT NULL DEFAULT 1 CHECK (active IN (0,1)), created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_username_ci ON users (lower(username));
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_ci ON users (lower(email));
CREATE TABLE IF NOT EXISTS login_codes (
 id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 code_hash TEXT NOT NULL, expires_at TEXT NOT NULL, used_at TEXT, attempts INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_login_codes_user ON login_codes(user_id,id DESC) INCLUDE (code_hash,expires_at,attempts,used_at);
CREATE TABLE IF NOT EXISTS datasets (
 id BIGSERIAL PRIMARY KEY, filename TEXT NOT NULL, original_name TEXT NOT NULL, file_hash TEXT,
 status TEXT NOT NULL DEFAULT 'procesando' CHECK (status IN ('procesando','procesado','error')),
 rows_imported INTEGER NOT NULL DEFAULT 0, error_message TEXT, uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
 uploaded_at TEXT NOT NULL, processed_at TEXT, min_appointment_date TEXT, max_appointment_date TEXT, cutoff_date TEXT);
CREATE INDEX IF NOT EXISTS idx_datasets_status_date ON datasets(status,processed_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS idx_datasets_hash ON datasets(file_hash) WHERE status='procesado';
CREATE TABLE IF NOT EXISTS appointments (
 id BIGSERIAL PRIMARY KEY, dataset_id BIGINT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE, patient_id BIGINT NOT NULL,
 fecha_corte TEXT, fecha_solicitud TEXT, fecha_cita TEXT, especialidad TEXT NOT NULL, sexo TEXT, edad INTEGER,
 seguro SMALLINT CHECK (seguro IN (0,1) OR seguro IS NULL), modalidad TEXT,
 atendido SMALLINT CHECK (atendido IN (0,1) OR atendido IS NULL), monto DOUBLE PRECISION NOT NULL DEFAULT 0,
 departamento TEXT, provincia TEXT, distrito TEXT, ubigeo TEXT, created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text));
CREATE INDEX IF NOT EXISTS idx_appointments_dataset ON appointments(dataset_id);
CREATE INDEX IF NOT EXISTS idx_appointments_dataset_specialty ON appointments(dataset_id,especialidad);
CREATE INDEX IF NOT EXISTS idx_appointments_dataset_attended ON appointments(dataset_id,atendido);
CREATE INDEX IF NOT EXISTS idx_appointments_dataset_modality ON appointments(dataset_id,modalidad);
CREATE INDEX IF NOT EXISTS idx_appointments_dataset_date ON appointments(dataset_id,fecha_cita);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date ON appointments(patient_id,fecha_cita DESC);
CREATE TABLE IF NOT EXISTS patients (
 patient_id BIGINT PRIMARY KEY, sexo TEXT, edad INTEGER, seguro SMALLINT CHECK (seguro IN (0,1) OR seguro IS NULL),
 departamento TEXT, provincia TEXT, distrito TEXT, ubigeo TEXT, first_seen TEXT, last_seen TEXT, updated_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_patients_sex ON patients(sexo);
CREATE INDEX IF NOT EXISTS idx_patients_insurance ON patients(seguro);
CREATE TABLE IF NOT EXISTS dataset_analytics (
 dataset_id BIGINT PRIMARY KEY REFERENCES datasets(id) ON DELETE CASCADE,
 payload JSONB NOT NULL,
 generated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text));
'''

def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec='seconds')

def _postgres_sql(sql: str) -> str:
    sql = re.sub(r'\s+COLLATE\s+NOCASE', '', sql, flags=re.IGNORECASE)
    return sql.replace('?', '%s')

class Connection:
    def __init__(self, connection): self._connection = connection
    def execute(self, sql, params=()): return self._connection.execute(_postgres_sql(sql), params)
    def executemany(self, sql, params_seq):
        cur = self._connection.cursor(); cur.executemany(_postgres_sql(sql), params_seq); return cur
    def copy_rows(self, table, columns, rows):
        column_sql = ','.join(columns)
        with self._connection.cursor().copy(f'COPY {table} ({column_sql}) FROM STDIN') as copy:
            for row in rows:
                copy.write_row(row)
    def commit(self): self._connection.commit()
    def rollback(self): self._connection.rollback()

_pool = None

def _get_pool():
    global _pool
    if not DATABASE_URL:
        raise RuntimeError('Falta DATABASE_URL. Copia la cadena PostgreSQL de Supabase en backend/.env.')
    if _pool is None:
        _pool = ConnectionPool(
            DATABASE_URL,
            min_size=1,
            max_size=10,
            open=True,
            kwargs={'row_factory': dict_row, 'connect_timeout': 15, 'prepare_threshold': None},
        )
    return _pool

@contextmanager
def db():
    with _get_pool().connection() as raw:
        try:
            yield Connection(raw)
        except Exception:
            raw.rollback(); raise

def init_db() -> None:
    with db() as conn: conn.execute(SCHEMA); conn.commit()

def seed_admin() -> None:
    with db() as conn:
        existing = conn.execute('SELECT id FROM users WHERE lower(username)=lower(?)', (ADMIN_USERNAME,)).fetchone()
        password_hash, now = hash_password(ADMIN_PASSWORD), utc_now()
        if existing:
            conn.execute("UPDATE users SET name=?,email=?,password_hash=?,role='Administrador',active=1,updated_at=? WHERE id=?",
                         (ADMIN_NAME,ADMIN_EMAIL.lower(),password_hash,now,existing['id']))
        else:
            conn.execute("INSERT INTO users(name,username,email,password_hash,role,active,created_at,updated_at) VALUES (?,?,?,?,'Administrador',1,?,?)",
                         (ADMIN_NAME,ADMIN_USERNAME,ADMIN_EMAIL.lower(),password_hash,now,now))
        conn.commit()

def row_to_dict(row): return dict(row) if row is not None else None
