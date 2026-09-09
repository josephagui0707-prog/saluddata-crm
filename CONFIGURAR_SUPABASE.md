# Configuración de Supabase para SaludData CRM

## 1. Crear el proyecto

1. Crea un proyecto en Supabase.
2. En **Project Settings > Database**, copia la cadena de conexión del **Transaction pooler**.
3. Abre `backend/.env` y agrega:

```env
DATABASE_URL=postgresql://postgres.REFERENCIA:CONTRASEÑA@HOST:6543/postgres
```

No publiques este archivo ni compartas la contraseña. La conexión se realiza desde FastAPI; la contraseña no queda expuesta en React.

## 2. Instalar y crear las tablas

Ejecuta `INSTALAR_CRM.bat` nuevamente. Al iniciar el backend, las tablas e índices optimizados se crean automáticamente.

## 3. Migrar los datos actuales de SQLite

Si deseas conservar la información de `saluddata.db`, abre una terminal dentro de `backend` y ejecuta:

```powershell
python migrate_sqlite_to_supabase.py ..\cloud_seed\saluddata.db.gz
```

El proceso trabaja en bloques de 5,000 registros para no llenar la memoria y conserva usuarios, códigos, datasets, citas y pacientes.

## Optimización incluida

- Pool de hasta 10 conexiones reutilizables, para evitar reconectar en cada consulta.
- Índices compuestos para dataset, paciente, fecha, especialidad, modalidad y atención.
- Índices únicos sin distinguir mayúsculas para usuario y correo.
- Importación por lotes de 5,000 filas.
- Carga masiva mediante el protocolo `COPY` de PostgreSQL.
- Paginación de pacientes y límites en las vistas previas.
- Consultas parametrizadas para mantener seguridad y aprovechar los planes de ejecución de PostgreSQL.
- Resumen analítico persistente por dataset: los gráficos no vuelven a recorrer cientos de miles de citas en cada apertura.
- Un único endpoint para descargar todas las tarjetas y gráficos del dashboard.
- Caché privada de 60 segundos en el navegador.
- Gráficos de sexo, edades, distritos y espera promedio calculados con los datos reales.

La velocidad final también depende de elegir una región de Supabase cercana al servidor donde se ejecuta FastAPI. Si el frontend y FastAPI se ejecutan en Lima pero Supabase está en una región lejana, habrá latencia de red aunque las consultas estén optimizadas.
