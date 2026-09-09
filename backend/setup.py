from config import ENV_FILE
from database import init_db, seed_admin

init_db()
seed_admin()
print('Base de datos Supabase preparada correctamente.')
print('Administrador inicial: admin / Cambiar123!')
print(f'Configuracion: {ENV_FILE}')
