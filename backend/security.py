from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from typing import Any

from config import APP_SECRET, TOKEN_HOURS

PBKDF2_ITERATIONS = 240_000


def _b64e(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('ascii').rstrip('=')


def _b64d(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + '=' * (-len(text) % 4))


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, PBKDF2_ITERATIONS)
    return f'pbkdf2_sha256${PBKDF2_ITERATIONS}${_b64e(salt)}${_b64e(digest)}'


def verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, iterations, salt_b64, digest_b64 = encoded.split('$', 3)
        if algorithm != 'pbkdf2_sha256':
            return False
        salt = _b64d(salt_b64)
        expected = _b64d(digest_b64)
        actual = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, int(iterations))
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False


def generate_otp() -> str:
    return f'{secrets.randbelow(1_000_000):06d}'


def hash_otp(code: str) -> str:
    return hmac.new(APP_SECRET.encode('utf-8'), code.encode('utf-8'), hashlib.sha256).hexdigest()


def issue_token(user: dict[str, Any]) -> str:
    payload = {
        'id': int(user['id']),
        'username': user['username'],
        'name': user['name'],
        'role': user['role'],
        'email': user['email'],
        'exp': int(time.time()) + TOKEN_HOURS * 3600,
    }
    body = _b64e(json.dumps(payload, separators=(',', ':'), ensure_ascii=False).encode('utf-8'))
    signature = hmac.new(APP_SECRET.encode('utf-8'), body.encode('ascii'), hashlib.sha256).digest()
    return f'{body}.{_b64e(signature)}'


def verify_token(token: str) -> dict[str, Any] | None:
    try:
        body, signature = token.split('.', 1)
        expected = hmac.new(APP_SECRET.encode('utf-8'), body.encode('ascii'), hashlib.sha256).digest()
        if not hmac.compare_digest(expected, _b64d(signature)):
            return None
        payload = json.loads(_b64d(body).decode('utf-8'))
        if int(payload.get('exp', 0)) < int(time.time()):
            return None
        return payload
    except Exception:
        return None
