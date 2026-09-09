# SaludData CRM en la nube

Esta versión usa React, FastAPI y Supabase PostgreSQL. Los datos ya no dependen de un archivo SQLite temporal, por lo que permanecen disponibles cuando Render reinicia el servidor.

## Despliegue en Render

1. Crea el proyecto y la base de datos en Supabase.
2. En Render agrega la variable secreta `DATABASE_URL` usando la cadena del Transaction pooler de Supabase.
3. Conserva las demás variables de correo y administrador definidas en `render.yaml`.
4. Publica el servicio. FastAPI creará automáticamente las tablas y los índices.

Para migrar la información precargada y ver las instrucciones completas, consulta `CONFIGURAR_SUPABASE.md`.

## Rendimiento

El backend reutiliza conexiones y la base contiene índices para los filtros usados por dashboards, pacientes y reportes. La carga masiva se procesa en bloques para evitar un consumo excesivo de memoria.
