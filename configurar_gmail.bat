@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  echo Primero ejecuta INSTALAR_CRM.bat
  pause
  exit /b 1
)

echo ================================================
echo     CONFIGURAR GMAIL - CODIGO DE VERIFICACION
echo ================================================
echo.
echo Necesitas una Contrasena de aplicacion de Google.
echo NO uses tu contrasena normal de Gmail.
echo.
".venv\Scripts\python.exe" backend\configure_gmail.py
if errorlevel 1 (
  echo.
  echo No se pudo completar la configuracion.
)
echo.
pause
