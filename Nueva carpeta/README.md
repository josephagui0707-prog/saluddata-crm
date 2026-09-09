# ☁️ Versión preparada para la nube

Este paquete incluye `render.yaml`, `backend/cloud_bootstrap.py` y una base SQLite precargada en `cloud_seed/saluddata.db.gz`. Para desplegarla, consulta **README_NUBE.md**.

---

# SaludData CRM — Hospital María Auxiliadora

Versión integrada del CRM con el **frontend React de SaludData**, backend **Python + FastAPI** y base de datos **SQLite (`sqlite3`)**. Está preparada para importar el archivo real **DATOS HOSPITAL MARIA AUXILIADORA.csv** incluido en `sample-data/`.

## Funciones principales

- Interfaz gráfica React de SaludData.
- Inicio de sesión con usuario y contraseña.
- Código de verificación de 6 dígitos.
- Modo de prueba sin Gmail: el código aparece en pantalla.
- Envío real del código por Gmail mediante contraseña de aplicación.
- Creación manual de usuarios y asignación de rol Administrador / Analista.
- Importación del CSV del Hospital María Auxiliadora a SQLite.
- Módulo de pacientes construido con el ID anonimizado del dataset.
- Historial de citas de cada paciente.
- Dashboard conectado a la base de datos real.
- Gráficos por especialidad, modalidad y estado de atención.
- Reportes por especialidad y exportación a CSV.
- Historial de datasets importados.

## Tecnologías

- **Frontend:** React + Vite + Chart.js.
- **Backend:** Python + FastAPI.
- **Base de datos:** SQLite con el módulo `sqlite3` incluido en Python.
- **Servidor:** Uvicorn.
- **Correo:** `smtplib` de Python.

La base de datos queda en:

```text
backend\data\saluddata.db
```

No necesitas instalar SQLite, MySQL, PostgreSQL, Docker ni Node.js para ejecutar esta versión. El frontend React ya viene preparado dentro de `dist/`.

## Cómo ejecutarlo en Windows

### Opción fácil

Haz doble clic en:

```text
INICIAR_CRM.bat
```

Si es la primera vez, el propio archivo llamará al instalador y preparará el entorno de Python.

También puedes hacerlo en dos pasos:

```text
1. INSTALAR_CRM.bat
2. INICIAR_CRM.bat
```

Después abre:

```text
http://127.0.0.1:8000
```

Cuenta inicial:

```text
Usuario: admin
Contraseña: Cambiar123!
```

En modo de prueba, al iniciar sesión el código de verificación aparecerá en la propia pantalla.

## Importar el dataset del hospital

1. Inicia sesión.
2. Entra en **Importar datos**.
3. Pulsa **Seleccionar archivo**.
4. Selecciona:

```text
sample-data\DATOS HOSPITAL MARIA AUXILIADORA.csv
```

5. Pulsa **Procesar dataset**.
6. Espera a que termine la importación.
7. Ve a **Inicio** o **Reportes**.

El dataset contiene **450,629 registros**, **97,549 pacientes únicos** y **63 especialidades**. La importación completa fue probada con este archivo y se almacenó correctamente en SQLite.

El sistema reconoce estas columnas:

```text
FECHA_CORTE;ID;DIA_SOLICITACITA;DIA_CITA;ESPECIALIDAD;SEXO;EDAD;SEGURO;
PRESENCIAL_REMOTO;ATENDIDO;MONTO;DEPARTAMENTO;PROVINCIA;DISTRITO;UBIGEO
```

## Configurar Gmail

Para que el código deje de mostrarse en modo de prueba y llegue realmente por correo, ejecuta:

```text
configurar_gmail.bat
```

Necesitas una **contraseña de aplicación de Google**, no la contraseña normal de Gmail.

## Reiniciar la base de datos

Si deseas borrar los datos importados y comenzar nuevamente, utiliza:

```text
reiniciar_base_datos.bat
```

Esto elimina `saluddata.db` y vuelve a crear las tablas y el usuario administrador.

## Estructura

```text
SaludData_CRM_Hospital_Maria_Auxiliadora/
├── src/                         código fuente React de SaludData
├── dist/                        frontend listo para ejecutar
├── backend/
│   ├── app.py                   API FastAPI
│   ├── database.py              tablas y conexión SQLite
│   ├── importer.py              importador del CSV hospitalario
│   ├── security.py              contraseñas, tokens y OTP
│   ├── email_service.py         envío del código por Gmail
│   ├── data/
│   │   └── saluddata.db         se crea automáticamente
│   └── requirements.txt
├── sample-data/
│   └── DATOS HOSPITAL MARIA AUXILIADORA.csv
├── INSTALAR_CRM.bat
├── INICIAR_CRM.bat
├── configurar_gmail.bat
└── reiniciar_base_datos.bat
```

## Explicación sencilla para exposición

> SaludData CRM utiliza React para la interfaz y Python con FastAPI para el backend. Los datos se guardan en SQLite usando `sqlite3`, que ya viene integrado con Python. El archivo CSV del Hospital María Auxiliadora se importa a la base de datos y después el sistema consulta SQLite para generar pacientes, estadísticas, gráficos y reportes. El acceso utiliza contraseña y un código de verificación de seis dígitos.


## Registro de usuarios desde el login

La pantalla de acceso ahora incluye **Regístrate**. Un usuario nuevo debe ingresar nombre, usuario, correo, contraseña y confirmación. El backend guarda la cuenta en SQLite con rol **Analista** y genera inmediatamente un código de 6 dígitos para verificar el acceso. El correo ingresado al registrarse es el correo destinatario de los códigos posteriores.

Por seguridad, el formulario público no permite crear administradores. El administrador puede gestionar las cuentas desde el módulo **Usuarios**.

### Correo real

- **En Windows/local:** ejecuta `configurar_gmail.bat`. El script te pedirá el Gmail que enviará los códigos y una contraseña de aplicación de Google. Nunca uses tu contraseña normal de Gmail.
- **En Render:** configura `RESEND_API_KEY` y `RESEND_FROM` en las variables de entorno. Resend entrega el código al Gmail que cada usuario registró. Si no configuras proveedor de correo, el sistema permanece en modo demostración y muestra el código en pantalla.

Las credenciales del correo emisor son configuración del servidor y **no se solicitan en el formulario web**, para evitar exponerlas a otros usuarios.
