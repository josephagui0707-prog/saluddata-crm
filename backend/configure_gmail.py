from __future__ import annotations

import getpass
from pathlib import Path

from config import ENV_FILE, ensure_env_file


def read_env(path: Path) -> dict[str, str]:
    result = {}
    for line in path.read_text(encoding='utf-8').splitlines():
        if not line.strip() or line.lstrip().startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        result[k.strip()] = v.strip()
    return result


def write_env(path: Path, values: dict[str, str]) -> None:
    order = [
        'APP_SECRET','TOKEN_HOURS','EMAIL_DEV_MODE','SMTP_HOST','SMTP_PORT','SMTP_SSL',
        'SMTP_USER','SMTP_PASS','SMTP_FROM','ADMIN_NAME','ADMIN_USERNAME','ADMIN_EMAIL','ADMIN_PASSWORD'
    ]
    lines = ['# SaludData CRM - configuracion local']
    for key in order:
        if key in values:
            lines.append(f'{key}={values[key]}')
    for key, value in values.items():
        if key not in order:
            lines.append(f'{key}={value}')
    path.write_text('\n'.join(lines) + '\n', encoding='utf-8')


ensure_env_file()
values = read_env(ENV_FILE)
print('\nCONFIGURAR GMAIL PARA CODIGOS DE VERIFICACION')
print('Usa una CONTRASENA DE APLICACION de Google, no tu contrasena normal de Gmail.')
email = input('Correo Gmail que enviara los codigos: ').strip()
password = getpass.getpass('Contrasena de aplicacion (16 caracteres): ').replace(' ', '').strip()
admin_email = input(f'Correo de la cuenta admin [{email}]: ').strip() or email
if not email or not password:
    raise SystemExit('Correo y contrasena de aplicacion son obligatorios.')
values.update({
    'EMAIL_DEV_MODE': 'false',
    'SMTP_HOST': 'smtp.gmail.com',
    'SMTP_PORT': '465',
    'SMTP_SSL': 'true',
    'SMTP_USER': email,
    'SMTP_PASS': password,
    'SMTP_FROM': email,
    'ADMIN_EMAIL': admin_email,
})
write_env(ENV_FILE, values)

# Recargar modulos en un proceso nuevo es mas simple; aqui actualizamos directamente la BD.
from database import db, init_db, utc_now
init_db()
with db() as conn:
    conn.execute('UPDATE users SET email=?, updated_at=? WHERE username=? COLLATE NOCASE', (admin_email.lower(), utc_now(), values.get('ADMIN_USERNAME','admin')))
    conn.commit()
print('\nGmail configurado. Los nuevos codigos se enviaran por correo.')
print(f'Correo del administrador: {admin_email}')
