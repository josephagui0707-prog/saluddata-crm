from __future__ import annotations

import json
import smtplib
import urllib.error
import urllib.request
from email.message import EmailMessage

from config import (
    EMAIL_DEV_MODE,
    RESEND_API_KEY,
    RESEND_FROM,
    SMTP_FROM,
    SMTP_HOST,
    SMTP_PASS,
    SMTP_PORT,
    SMTP_SSL,
    SMTP_USER,
)


def smtp_configured() -> bool:
    return bool(SMTP_HOST and SMTP_USER and SMTP_PASS)


def resend_configured() -> bool:
    return bool(RESEND_API_KEY and RESEND_FROM)


def _plain_body(name: str, code: str) -> str:
    return f'Hola {name}. Tu codigo de verificacion es {code}. Vence en 10 minutos.'


def _html_body(name: str, code: str) -> str:
    return f'''<html><body style="font-family:Arial,sans-serif">
    <div style="max-width:520px;margin:auto;padding:24px;border:1px solid #dbeafe;border-radius:12px">
      <h2 style="color:#0f766e">SaludData CRM</h2>
      <p>Hola <strong>{name}</strong>,</p>
      <p>Usa este codigo para completar tu inicio de sesion:</p>
      <div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px;background:#f0fdfa;border-radius:10px;text-align:center;color:#0f172a">{code}</div>
      <p style="color:#64748b">El codigo vence en 10 minutos. Si no intentaste iniciar sesion, ignora este mensaje.</p>
    </div></body></html>'''


def _send_resend(to: str, name: str, code: str) -> None:
    payload = json.dumps({
        'from': RESEND_FROM,
        'to': [to],
        'subject': 'Codigo de verificacion - SaludData CRM',
        'text': _plain_body(name, code),
        'html': _html_body(name, code),
    }).encode('utf-8')
    req = urllib.request.Request(
        'https://api.resend.com/emails',
        data=payload,
        method='POST',
        headers={
            'Authorization': f'Bearer {RESEND_API_KEY}',
            'Content-Type': 'application/json',
            'User-Agent': 'SaludData-CRM/3.1',
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            if not 200 <= int(response.status) < 300:
                raise RuntimeError(f'Resend devolvio HTTP {response.status}.')
    except urllib.error.HTTPError as exc:
        try:
            detail = exc.read().decode('utf-8', errors='replace')[:500]
        except Exception:
            detail = str(exc)
        raise RuntimeError(f'No se pudo enviar el correo con Resend: {detail}') from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f'No se pudo conectar con Resend: {exc.reason}') from exc


def _send_smtp(to: str, name: str, code: str) -> None:
    msg = EmailMessage()
    msg['Subject'] = 'Codigo de verificacion - SaludData CRM'
    msg['From'] = SMTP_FROM or SMTP_USER
    msg['To'] = to
    msg.set_content(_plain_body(name, code))
    msg.add_alternative(_html_body(name, code), subtype='html')

    if SMTP_SSL:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=30) as server:
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
    else:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)


def send_verification_code(to: str, name: str, code: str) -> dict:
    # En nube se prioriza una API HTTPS porque algunos planes gratuitos bloquean SMTP.
    if resend_configured():
        _send_resend(to, name, code)
        return {'delivered': True, 'devMode': False, 'provider': 'resend'}

    if smtp_configured():
        _send_smtp(to, name, code)
        return {'delivered': True, 'devMode': False, 'provider': 'smtp'}

    if EMAIL_DEV_MODE:
        print(f'[MODO DESARROLLO] Codigo para {to}: {code}')
        return {'delivered': False, 'devMode': True, 'provider': 'dev'}

    raise RuntimeError(
        'El correo no esta configurado. En Render Free usa RESEND_API_KEY/RESEND_FROM o activa EMAIL_DEV_MODE.'
    )
