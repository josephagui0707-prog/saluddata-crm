@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title SaludData CRM - Hospital Maria Auxiliadora

if not exist ".venv\Scripts\python.exe" (
  echo Primera ejecucion: se instalara el proyecto automaticamente.
  call INSTALAR_CRM.bat
  if errorlevel 1 exit /b 1
)

if not exist "dist\index.html" (
  echo [ERROR] Falta el frontend SaludData compilado.
  echo Vuelve a extraer el ZIP completo.
  pause
  exit /b 1
)

echo ================================================
echo       SALUDDATA CRM HOSPITALARIO
echo ================================================
echo Base de datos: Supabase PostgreSQL
echo Sistema:       http://127.0.0.1:8000
echo Documentacion: http://127.0.0.1:8000/api/docs
echo.
echo No cierres esta ventana mientras uses el CRM.
echo Para detenerlo presiona CTRL+C.
echo.
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:8000'"
".venv\Scripts\python.exe" -m uvicorn app:app --app-dir backend --host 127.0.0.1 --port 8000
pause
