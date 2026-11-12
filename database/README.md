# Base de datos — Azure SQL

> La producción actual funciona con MySQL. Antes de desplegar, ejecuta en orden en la base MySQL de OVH las migraciones pendientes: `015_roles_personal_notifications_utc.sql`, `016_remove_viewer_role.sql`, `017_roles_table.sql` (crea la tabla `Roles` con los permisos por rol — el backend no arranca sin ella), `018_add_notification_email.sql` y `019_order_notification_matrix.sql`. Ninguna de estas migraciones está escrita para SQL Server.

## Requisitos

- Instancia de Azure SQL Database creada
- IP de desarrollo añadida en **Firewall rules** del servidor SQL

## Instalación

1. Conecta con Azure Data Studio, SSMS o `sqlcmd` a tu base de datos.
2. Ejecuta en orden:
   - `001_schema.sql` — crea las 6 tablas
   - `002_seed.sql` — families, subcategorías y products de demo
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
