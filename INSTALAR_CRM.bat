@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title Instalacion SaludData CRM Hospitalario

echo ================================================
echo     INSTALACION SALUDDATA CRM - SUPABASE
echo ================================================
echo.
python --version >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Python no esta instalado o no esta agregado al PATH.
  echo Instala Python y marca Add python.exe to PATH.
  pause
  exit /b 1
)

echo [1/3] Preparando entorno virtual...
if not exist ".venv\Scripts\python.exe" (
  python -m venv .venv
  if errorlevel 1 goto :error
) else (
  echo El entorno virtual ya existe.
)

echo.
echo [2/3] Instalando FastAPI y dependencias...
".venv\Scripts\python.exe" -m pip install -r backend\requirements.txt
if errorlevel 1 goto :error

echo.
echo [3/3] Conectando y preparando Supabase...
".venv\Scripts\python.exe" backend\setup.py
if errorlevel 1 goto :error

echo.
echo ================================================
echo INSTALACION COMPLETADA
echo ================================================
echo Usuario inicial: admin
echo Contrasena:      Cambiar123!
echo.
echo No necesitas instalar SQLite, PostgreSQL, Docker ni Node.js.
echo Ahora ejecuta INICIAR_CRM.bat
echo.
pause
exit /b 0

:error
echo.
echo [ERROR] La instalacion no termino correctamente.
echo Copia el error que aparece arriba para revisarlo.
pause
exit /b 1
