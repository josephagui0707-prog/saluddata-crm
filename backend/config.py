from __future__ import annotations

import os
import secrets
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
ENV_FILE = BASE_DIR / '.env'
UPLOAD_DIR = BASE_DIR / 'uploads'
DIST_DIR = PROJECT_DIR / 'dist'


def load_env(path: Path = ENV_FILE) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding='utf-8').splitlines():
        line = raw_line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def ensure_env_file() -> None:
    if ENV_FILE.exists():
        return
    secret = secrets.token_urlsafe(48)
    ENV_FILE.write_text(
        '\n'.join([
            '# SaludData CRM - configuracion local',
            f'APP_SECRET={secret}',
            'DATABASE_URL=',
            'TOKEN_HOURS=8',
            'EMAIL_DEV_MODE=true',
            'SMTP_HOST=smtp.gmail.com',
            'SMTP_PORT=465',
            'SMTP_SSL=true',
            'SMTP_USER=',
            'SMTP_PASS=',
            'SMTP_FROM=',
            'ADMIN_NAME=Administrador',
            'ADMIN_USERNAME=admin',
            'ADMIN_EMAIL=admin@saluddata.local',
            'ADMIN_PASSWORD=Cambiar123!',
            '',
        ]),
        encoding='utf-8',
    )


ensure_env_file()
load_env()

DATABASE_URL = os.environ.get('DATABASE_URL', '')
APP_SECRET = os.environ.get('APP_SECRET', 'saluddata-dev-secret')
TOKEN_HOURS = int(os.environ.get('TOKEN_HOURS', '8'))
EMAIL_DEV_MODE = os.environ.get('EMAIL_DEV_MODE', 'true').lower() == 'true'
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '465'))
SMTP_SSL = os.environ.get('SMTP_SSL', 'true').lower() == 'true'
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASS = os.environ.get('SMTP_PASS', '')
SMTP_FROM = os.environ.get('SMTP_FROM', '') or SMTP_USER
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
RESEND_FROM = os.environ.get('RESEND_FROM', '')

ADMIN_NAME = os.environ.get('ADMIN_NAME', 'Administrador')
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@saluddata.local')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Cambiar123!')
