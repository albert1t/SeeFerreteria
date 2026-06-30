# Base de datos — Azure SQL

## Requisitos

- Instancia de Azure SQL Database creada
- IP de desarrollo añadida en **Firewall rules** del servidor SQL

## Instalación

1. Conecta con Azure Data Studio, SSMS o `sqlcmd` a tu base de datos.
2. Ejecuta en orden:
   - `001_schema.sql` — crea las 6 tablas
   - `002_seed.sql` — familias, subcategorías y recambios de demo
3. Desde `backend/`, ejecuta el seed de usuarios (contraseñas hasheadas):
   ```bash
   cd backend
   npm run seed
   ```

## Variables de entorno (backend/.env)

```env
AZURE_SQL_SERVER=tu-servidor.database.windows.net
AZURE_SQL_DATABASE=see_ferreteria
AZURE_SQL_USER=tu_usuario
AZURE_SQL_PASSWORD=tu_contraseña
AZURE_SQL_ENCRYPT=true
AZURE_SQL_TRUST_SERVER_CERTIFICATE=false

JWT_SECRET=genera-un-secreto-largo-y-aleatorio
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
PORT=3001
```

## Usuarios demo (tras npm run seed)

| Usuario    | Contraseña | Rol   |
|------------|------------|-------|
| admin      | admin123   | admin |
| operario1  | op123      | user  |
