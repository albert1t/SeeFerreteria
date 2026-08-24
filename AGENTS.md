# AGENTS.md — Documentación para agentes de IA / AI Agent Documentation

> Este archivo está pensado para que cualquier agente de IA futuro pueda entender el proyecto, sus accesos y cómo operarlo.
> This file is intended to help future AI agents understand the project, its access points, and how to operate it.

---

## 1. Resumen del proyecto / Project Overview

### Español
**SeeFerreteria** es un sistema full-stack para gestión de products industriales. Incluye un almacén visual por panels/cubetas, gestión de orders, usuarios con roles/permisos, importación de catálogos y notificaciones por correo.

### English
**SeeFerreteria** is a full-stack system for managing industrial spare parts. It features a visual warehouse organized by panels/bins, order management, users with roles/permissions, catalog imports, and email notifications.

---

## 2. Stack tecnológico / Tech Stack

### Español
- **Frontend:** React 19 + TypeScript + Vite + React Router + TanStack Query + Zod.
- **Backend:** Node.js 24 + Express + TypeScript + JWT (`jsonwebtoken`) + `jose` para MSAL.
- **Base de datos:** MySQL (producción en OVH CloudDB; los scripts iniciales hablan de Azure SQL pero el despliegue real usa MySQL via `mysql2`).
- **Almacenamiento de imágenes:** Azure Blob Storage (SAS URL).
- **Autenticación opcional:** Microsoft Azure AD (MSAL).
- **Email:** Nodemailer + SMTP.
- **Hosting:** cPanel en Raiola (CloudLinux + Node.js Selector).

### English
- **Frontend:** React 19 + TypeScript + Vite + React Router + TanStack Query + Zod.
- **Backend:** Node.js 24 + Express + TypeScript + JWT (`jsonwebtoken`) + `jose` for MSAL.
- **Database:** MySQL (production uses OVH CloudDB; initial scripts mention Azure SQL but the real deployment uses MySQL via `mysql2`).
- **Image storage:** Azure Blob Storage (SAS URL).
- **Optional authentication:** Microsoft Azure AD (MSAL).
- **Email:** Nodemailer + SMTP.
- **Hosting:** cPanel on Raiola (CloudLinux + Node.js Selector).

---

## 3. Estructura del repositorio / Repository Layout

```
/
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── index.ts         # Punto de entrada
│   │   ├── config/
│   │   │   ├── env.ts       # Validación de variables de entorno (zod)
│   │   │   └── db.ts        # Pool de MySQL
│   │   ├── routes/          # Endpoints de la API
│   │   ├── services/        # Lógica de negocio
│   │   ├── repositories/    # Acceso a datos
│   │   ├── middleware/      # auth, validate, errorHandler
│   │   ├── schemas/         # Esquemas zod
│   │   ├── scripts/         # Scripts de migración/importación
│   │   └── types/           # Tipos TypeScript
│   ├── dist/                # Código compilado (se sube al repo)
│   ├── .env.example         # Variables de entorno de ejemplo
│   └── package.json
├── frontend/                # Aplicación React
│   ├── src/
│   │   ├── api/             # Cliente HTTP y llamadas a la API
│   │   ├── pages/           # Páginas
│   │   ├── components/      # Componentes
│   │   └── hooks/           # Hooks personalizados
│   ├── .env.production      # Variables del build de producción
│   └── package.json
├── database/                # Scripts SQL
│   ├── 001_schema.sql
│   ├── 002_seed.sql
│   ├── 004_permissions.sql
│   ├── 005_orders_oculto.sql
│   ├── 006_imports_catalogo.sql
│   └── full_schema_ovh.sql  # Esquema completo idempotente
├── .cpanel.yml              # Tareas de deploy de cPanel Git
├── .htaccess                # Reglas Apache: SPA frontend + /api al backend
└── package.json             # Scripts de alto nivel (dev:all, build...)
```

---

## 4. Entorno de producción / Production Environment

### Español
- **Dominio API:** `https://cmhautomacion.com`
- **Dominio frontend:** `https://www.ferreteria.latecnologiaasumedida.com` (alias del hosting; el `VITE_API_URL` apunta a `cmhautomacion.com`).
- **cPanel:** `https://93.95.208.43:2083` (también accesible vía `cmhautomacion.com:2083`).
  - Usuario: `cmhautomacion`
  - Requiere TFA; el token de sesión caduca, así que normalmente habrá que pedir un código fresco.
- **Acceso SSH:** deshabilitado en la cuenta. No se puede entrar por shell.
  - Alternativa: subir scripts PHP temporales a `public_html` para ejecutar comandos como el usuario (`passthru`, `shell_exec`).
- **Repositorio en el servidor:** `/home/cmhautomacion/repositories/SeeFerreteria`
- **Document root (frontend):** `/home/cmhautomacion/repositories/SeeFerreteria/` (gestionado por cPanel Git).
- **Aplicación Node.js:**
  - Ruta: `/home/cmhautomacion/repositories/SeeFerreteria/backend`
  - Archivo de arranque: `dist/index.js`
  - Versión de Node: 24
  - Logs de error: `backend/stderr.log`

### English
- **API domain:** `https://cmhautomacion.com`
- **Frontend domain:** `https://www.ferreteria.latecnologiaasumedida.com` (hosting alias; `VITE_API_URL` points to `cmhautomacion.com`).
- **cPanel:** `https://93.95.208.43:2083` (also reachable via `cmhautomacion.com:2083`).
  - User: `cmhautomacion`
  - Requires TFA; the session token expires, so a fresh code is usually needed.
- **SSH access:** disabled for this account. Shell login is not possible.
  - Alternative: upload temporary PHP scripts to `public_html` to run commands as the user (`passthru`, `shell_exec`).
- **Repository on server:** `/home/cmhautomacion/repositories/SeeFerreteria`
- **Document root (frontend):** `/home/cmhautomacion/repositories/SeeFerreteria/` (managed by cPanel Git).
- **Node.js application:**
  - Path: `/home/cmhautomacion/repositories/SeeFerreteria/backend`
  - Startup file: `dist/index.js`
  - Node version: 24
  - Error logs: `backend/stderr.log`


---

## 5. Variables de entorno / Environment Variables

### Español
El backend valida las variables con `zod` en `backend/src/config/env.ts`.
**Nunca se commitean contraseñas ni tokens.** En producción se configuran en el **Setup Node.js App** de cPanel (CloudLinux Node.js Selector), no en archivos `.env`.

### English
The backend validates variables with `zod` in `backend/src/config/env.ts`.
**Never commit passwords or tokens.** In production they are configured in cPanel's **Setup Node.js App** (CloudLinux Node.js Selector), not in `.env` files.

### Variables del backend / Backend variables

| Variable | Requerida | Descripción / Description | Valor producción (ejemplo) |
|---|---|---|---|
| `NODE_ENV` | Sí | development, production o test | `production` |
| `PORT` | No | Puerto interno (lo asigna cPanel) | `3001` |
| `DB_HOST` | Sí | Host MySQL | `cm1291904-002.eu.clouddb.ovh.net` |
| `DB_PORT` | No | Puerto MySQL | `35996` |
| `DB_NAME` | Sí | Nombre de la BD | `db_ferreteria` |
| `DB_USER` | Sí | Usuario MySQL | `operario` |
| `DB_PASSWORD` | Sí | Contraseña MySQL | *(en cPanel)* |
| `JWT_SECRET` | Sí | Secreto JWT (≥32 caracteres) | *(en cPanel)* |
| `JWT_EXPIRES_IN` | No | Duración del token | `8h` |
| `CORS_ORIGIN` | No | Origen/es permitidos (separados por coma) | `https://www.ferreteria.latecnologiaasumedida.com` |
| `AZURE_AD_TENANT_ID` | No | Tenant de Azure AD | `common` |
| `AZURE_AD_CLIENT_ID` | No | Client ID de Azure AD | `d7d4dbd1-9deb-40fe-823e-5fb44f438e7d` |
| `AZURE_BLOB_SAS_URL` | Sí | SAS URL del contenedor de imágenes | *(en cPanel)* |
| `SMTP_HOST` | No | Servidor SMTP | `mail.cmhautomacion.com` |
| `SMTP_PORT` | No | Puerto SMTP | `465` |
| `SMTP_SECURE` | No | `true` para SSL/TLS | `true` |
| `SMTP_USER` | No | Usuario SMTP | `noreply@cmhautomacion.com` |
| `SMTP_PASS` | No | Contraseña SMTP | *(en cPanel)* |
| `MAIL_FROM` | No | Remitente | `noreply@cmhautomacion.com` |
| `MAIL_REPLY_TO` | No | Reply-To | `comercial@cmhautomacion.com` |
| `NOTIFY_EMAIL` | No | Correo de notificaciones de orders | `danexthegamer@gmail.com` (cambiar a `comercial@cmhautomacion.com` si se prefiere) |
| `MAIL_ENABLED` | No | Activa/desactiva envíos | `true` |
| `NOTIFY_ADMIN_ON_REGISTER` | No | Notificar al admin cuando un nuevo usuario se registra | `true` |

### Variables del frontend / Frontend variables

Viven en `frontend/.env.production` para el build de producción.

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API (`https://cmhautomacion.com`) |
| `VITE_AZURE_AD_CLIENT_ID` | Client ID de MSAL |
| `VITE_AZURE_AD_TENANT_ID` | `common` |
| `VITE_MSAL_REDIRECT_URI` | `https://www.ferreteria.latecnologiaasumedida.com/login` |
| `VITE_AZURE_BLOB_SAS_URL` | SAS URL del contenedor de imágenes |


---

## 6. Base de datos / Database

### Español
Producción usa **MySQL** en OVH CloudDB. El pool se crea en `backend/src/config/db.ts`.

Tablas principales:
- `Users` — usuarios locales (`username`, `passwordHash`, `name`, `role`, `isActive`).
- `AllowedEmails` — whitelist para login con Microsoft.
- `Families` / `Subcategories` — clasificación de productos.
- `Products` — piezas del almacén (referencia, imagen, posición `panel/col/row`, `hidden`, stock, etc.).
- `Orders` — pedidos de reposición/solicitud.
- `OrderStatusHistory` — histórico de cambios de estado.
- `CatalogImports` — log de importaciones masivas.

### English
Production uses **MySQL** on OVH CloudDB. The pool is created in `backend/src/config/db.ts`.

Main tables:
- `Users` — local users (`username`, `passwordHash`, `name`, `role`, `isActive`).
- `AllowedEmails` — whitelist for Microsoft login.
- `Families` / `Subcategories` — spare-part classification.
- `Products` — warehouse items (reference, image, position `panel/col/row`, `hidden`, stock, etc.).
- `Orders` — replacement/orders.
- `OrderStatusHistory` — status change history.
- `CatalogImports` — bulk import log.

---

## 7. Autenticación y permisos / Authentication & Permissions

### Español
- Login local: `POST /api/auth/login` con `username` y `password`.
- Registro público: `POST /api/auth/register`.
- Login Microsoft: `POST /api/auth/msal-login` (requiere que el email esté en `AllowedEmails`).
- El token JWT se devuelve en la respuesta y se puede enviar como cookie `see_token` o header `Authorization: Bearer <token>`.
- Roles: `admin`, `operario`, `user`, `viewer`.
- Permisos se almacenan como JSON en `Users.permissions`; `getDefaultPermissions(role)` da permisos por defecto.

### English
- Local login: `POST /api/auth/login` with `username` and `password`.
- Public registration: `POST /api/auth/register`.
- Microsoft login: `POST /api/auth/msal-login` (email must be in `AllowedEmails`).
- JWT is returned in the response and can be sent as cookie `see_token` or header `Authorization: Bearer <token>`.
- Roles: `admin`, `operario`, `user`, `viewer`.
- Permissions are stored as JSON in `Users.permissions`; `getDefaultPermissions(role)` provides defaults.

---

## 8. Notificaciones por email / Email Notifications

### Español
Implementadas en `backend/src/services/mailService.ts`.

**Disparadores:**
- `createOrder` en `backend/src/services/ordersService.ts`:
  - Envía acuse al solicitante **solo si su `username` tiene formato de email válido**.
  - Notifica siempre a `NOTIFY_EMAIL`.
- `advanceStatus`:
  - Envía seguimiento al solicitante si su `username` es un email válido.
- `register` en `backend/src/services/authService.ts`:
  - Notifica a `NOTIFY_EMAIL` cuando se registra un nuevo usuario, si `NOTIFY_ADMIN_ON_REGISTER=true`.

**Endpoint de prueba:**
```bash
curl -X POST https://cmhautomacion.com/api/orders/test-email \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{}'
```
Si el `username` del usuario autenticado es un email válido, el correo se envía a ese email; si no, a `NOTIFY_EMAIL`.

### English
Implemented in `backend/src/services/mailService.ts`.

**Triggers:**
- `createOrder` in `backend/src/services/ordersService.ts`:
  - Sends acknowledgment to the requester **only if their `username` is a valid email**.
  - Always notifies `NOTIFY_EMAIL`.
- `advanceStatus`:
  - Sends status update to the requester if their `username` is a valid email.
- `register` in `backend/src/services/authService.ts`:
  - Notifies `NOTIFY_EMAIL` when a new user registers, if `NOTIFY_ADMIN_ON_REGISTER=true`.

**Test endpoint:**
```bash
curl -X POST https://cmhautomacion.com/api/orders/test-email \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{}'
```
If the authenticated user's `username` is a valid email, the test email goes there; otherwise it goes to `NOTIFY_EMAIL`.


---

## 9. Despliegue / Deployment

### Español
El despliegue usa **cPanel Git Version Control** + **CloudLinux Node.js Selector**.

**Flujo normal:**
1. Hacer cambios en local, compilar backend (`npm run build` en `backend/`) y frontend (`npm run build` en `frontend/`).
2. Commit y push a `origin/main` (el remote es HTTPS, se necesitan credenciales de GitHub).
3. En cPanel → Git Version Control → pulsar **Update** o **Deploy HEAD Commit**.
4. Reiniciar la app Node.js.

**Reiniciar la app (sin SSH):**
```bash
/usr/sbin/cloudlinux-selector restart --interpreter nodejs \
  --domain cmhautomacion.com \
  --app-root /home/cmhautomacion/repositories/SeeFerreteria/backend
```

**Actualizar variables de entorno:**
```bash
/usr/sbin/cloudlinux-selector set --interpreter nodejs \
  --domain cmhautomacion.com \
  --app-root /home/cmhautomacion/repositories/SeeFerreteria/backend \
  --env-vars '{"SMTP_PASS":"...",...}'
```

**Notas importantes:**
- `.cpanel.yml` copia `backend/` y `frontend/dist/` al document root y ejecuta `npm install --omit=dev`.
- El `npm` normal del `nodevenv` falla cuando `node_modules` es un symlink; por eso `.cpanel.yml` usa la ruta directa de `npm-cli.js` de Node 24.
- No usar `touch tmp/restart.txt`; creaba `backend/tmp/` sin trackear y bloqueaba el deploy.

### English
Deployment uses **cPanel Git Version Control** + **CloudLinux Node.js Selector**.

**Normal flow:**
1. Make local changes, build backend (`npm run build` in `backend/`) and frontend (`npm run build` in `frontend/`).
2. Commit and push to `origin/main` (remote is HTTPS; GitHub credentials required).
3. In cPanel → Git Version Control → click **Update** or **Deploy HEAD Commit**.
4. Restart the Node.js app.

**Restart the app (no SSH):**
```bash
/usr/sbin/cloudlinux-selector restart --interpreter nodejs \
  --domain cmhautomacion.com \
  --app-root /home/cmhautomacion/repositories/SeeFerreteria/backend
```

**Update environment variables:**
```bash
/usr/sbin/cloudlinux-selector set --interpreter nodejs \
  --domain cmhautomacion.com \
  --app-root /home/cmhautomacion/repositories/SeeFerreteria/backend \
  --env-vars '{"SMTP_PASS":"...",...}'
```

**Important notes:**
- `.cpanel.yml` copies `backend/` and `frontend/dist/` to the document root and runs `npm install --omit=dev`.
- The default `npm` from the `nodevenv` fails when `node_modules` is a symlink; therefore `.cpanel.yml` uses the direct Node 24 `npm-cli.js` path.
- Do not use `touch tmp/restart.txt`; it created an untracked `backend/tmp/` and blocked deployment.


---

## 10. Desarrollo local / Local Development

### Español
```bash
# Instalar dependencias
npm install
npm install --prefix backend
npm install --prefix frontend

# Backend
cd backend
cp .env.example .env
# Editar .env con credenciales locales
npm run dev          # http://localhost:3001

# Frontend
cd ../frontend
cp .env.example .env
npm run dev          # http://localhost:5173

# Ambos a la vez (desde raíz)
npm run dev:all
```

### English
```bash
# Install dependencies
npm install
npm install --prefix backend
npm install --prefix frontend

# Backend
cd backend
cp .env.example .env
# Edit .env with local credentials
npm run dev          # http://localhost:3001

# Frontend
cd ../frontend
cp .env.example .env
npm run dev          # http://localhost:5173

# Both at once (from root)
npm run dev:all
```

---

## 11. Endpoints principales / Main Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Healthcheck |
| POST | `/api/auth/register` | Registro público |
| POST | `/api/auth/login` | Login local |
| POST | `/api/auth/msal-login` | Login Microsoft |
| GET | `/api/products` | Listar products |
| GET | `/api/products/:id` | Ver recambio |
| GET | `/api/panels` | Listar panels/resumen |
| GET | `/api/orders` | Listar orders |
| POST | `/api/orders` | Crear pedido (dispara emails) |
| POST | `/api/orders/test-email` | Probar SMTP |
| PATCH | `/api/orders/:id/estado` | Avanzar estado (dispara email) |
| GET | `/api/users` | Gestión de usuarios |
| GET/POST | `/api/catalogs` | Catálogos |
| GET/POST | `/api/imports` | Importaciones masivas |

---

## 12. Cambios recientes / Recent Changes

### Español
- **Full English refactor:** tablas, columnas, endpoints y tipos renombrados a inglés (`Products`, `Orders`, `OrderStatusHistory`, `CatalogImports`, etc.).
- **Migración de BD:** `database/008_standardize_english_names.sql` renombra todas las tablas/columnas de producción.
- **Notificaciones por email:** implementadas con Nodemailer; emails en nuevo pedido, acuse al solicitante y seguimiento de estado.
- **Endpoint de prueba SMTP:** `POST /api/orders/test-email`.
- **`.cpanel.yml` ajustado:** usa `npm-cli.js` directo de Node 24 y elimina `touch tmp/restart.txt`.
- **Backend desplegado y activo en cPanel:** aplicación Node.js recreada/iniciada; `public_html/api/.htaccess` limitado a configuración Passenger; se añadió `RewriteRule ^api/ - [L]` en `public_html/.htaccess` para evitar que WordPress intercepte `/api`.
- **Caché de LiteSpeed purgada** tras el arreglo de `.htaccess` para que `/api/health` responda correctamente.

### English
- **Full English refactor:** tables, columns, endpoints and types renamed to English (`Products`, `Orders`, `OrderStatusHistory`, `CatalogImports`, etc.).
- **DB migration:** `database/008_standardize_english_names.sql` renames all production tables/columns.
- **Email notifications:** order creation, status update and new-user registration (toggleable via `NOTIFY_ADMIN_ON_REGISTER`).
- **SMTP test endpoint:** `POST /api/orders/test-email`.
- **`.cpanel.yml` adjusted:** uses the direct Node 24 `npm-cli.js` path and removes `touch tmp/restart.txt`.
- **Backend deployed and active on cPanel:** Node.js app recreated/started; `public_html/api/.htaccess` limited to Passenger config; `RewriteRule ^api/ - [L]` added to `public_html/.htaccess` so WordPress does not intercept `/api`.
- **LiteSpeed cache purged** after the `.htaccess` fix so `/api/health` responds correctly.


---

## 13. Troubleshooting / Troubleshooting

### Español

**El endpoint `/api/orders/test-email` devuelve 404**
- La app Node está corriendo código antiguo. Matar el proceso `lsnode` y reiniciar:
  ```bash
  kill -9 <pid>
  /usr/sbin/cloudlinux-selector start --interpreter nodejs --domain cmhautomacion.com --app-root /home/cmhautomacion/repositories/SeeFerreteria/backend
  ```

**cPanel Git dice "cannot deploy because uncommitted changes exist"**
- Suele ser `backend/tmp/` creado por un `touch tmp/restart.txt` anterior. Borrarlo vía File Manager o PHP:
  ```bash
  rm -rf /home/cmhautomacion/repositories/SeeFerreteria/backend/tmp
  ```

**`npm install` falla en deploy con symlink de `node_modules`**
- Usar el `npm-cli.js` directo de la versión de Node instalada, tal como hace `.cpanel.yml` actualmente.

**Errores CORS en producción**
- Verificar que `CORS_ORIGIN` en cPanel incluya el origen exacto del frontend (por ejemplo `https://www.ferreteria.latecnologiaasumedida.com`).

**`/api/...` devuelve 404 de WordPress**
- Asegurar que `public_html/api/.htaccess` contenga solo la configuración Passenger de CloudLinux (`PassengerAppRoot`, `PassengerBaseURI /api`, `PassengerNodejs`, `PassengerAppType node`, `PassengerStartupFile dist/index.js`).
- Añadir `RewriteRule ^api/ - [L]` **antes** del bloque WordPress en `public_html/.htaccess`.
- Purgar la caché de LiteSpeed (desde el admin de WP o `do_action('litespeed_purge_all')`) hasta ver `x-litespeed-cache: miss`.

**No llegan emails**
- Revisar `backend/stderr.log` en busca de líneas `[mail] ...`.
- Verificar `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`.
- Probar con `POST /api/orders/test-email`.

### English

**Endpoint `/api/orders/test-email` returns 404**
- The Node app is running old code. Kill the `lsnode` process and restart:
  ```bash
  kill -9 <pid>
  /usr/sbin/cloudlinux-selector start --interpreter nodejs --domain cmhautomacion.com --app-root /home/cmhautomacion/repositories/SeeFerreteria/backend
  ```

**cPanel Git says "cannot deploy because uncommitted changes exist"**
- Usually caused by `backend/tmp/` created by a previous `touch tmp/restart.txt`. Remove it via File Manager or PHP:
  ```bash
  rm -rf /home/cmhautomacion/repositories/SeeFerreteria/backend/tmp
  ```

**`npm install` fails during deploy due to `node_modules` symlink**
- Use the direct `npm-cli.js` from the installed Node version, as the current `.cpanel.yml` does.

**CORS errors in production**
- Check that `CORS_ORIGIN` in cPanel includes the exact frontend origin (e.g. `https://www.ferreteria.latecnologiaasumedida.com`).

**`/api/...` returns WordPress 404**
- Ensure `public_html/api/.htaccess` contains only the CloudLinux Passenger configuration (`PassengerAppRoot`, `PassengerBaseURI /api`, `PassengerNodejs`, `PassengerAppType node`, `PassengerStartupFile dist/index.js`).
- Add `RewriteRule ^api/ - [L]` **before** the WordPress block in `public_html/.htaccess`.
- Purge the LiteSpeed cache (via WP admin or `do_action('litespeed_purge_all')`) until `x-litespeed-cache: miss` is seen.

**Emails not arriving**
- Check `backend/stderr.log` for `[mail] ...` lines.
- Verify `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`.
- Test with `POST /api/orders/test-email`.

---

## 14. Acceso rápido / Quick Access

| Recurso | Valor / comando |
|---|---|
| cPanel | `https://93.95.208.43:2083` usuario `cmhautomacion` (requiere TFA) |
| API prod | `https://cmhautomacion.com/api` |
| Frontend prod | `https://www.ferreteria.latecnologiaasumedida.com` |
| Repo servidor | `/home/cmhautomacion/repositories/SeeFerreteria` |
| App Node.js | `/home/cmhautomacion/repositories/SeeFerreteria/backend` |
| Logs | `backend/stderr.log` |
| Reinicio | `/usr/sbin/cloudlinux-selector restart --interpreter nodejs --domain cmhautomacion.com --app-root /home/cmhautomacion/repositories/SeeFerreteria/backend` |
| Health | `curl https://cmhautomacion.com/api/health` |
| Test email | `curl -X POST https://cmhautomacion.com/api/orders/test-email -H 'Authorization: Bearer <token>' -H 'Content-Type: application/json' -d '{}'` |

> **Nota de seguridad:** Las contraseñas, tokens y el SAS de Azure solo deben vivir en las variables de entorno de cPanel o en `.env` locales nunca en el repo.
> **Security note:** Passwords, tokens, and the Azure SAS should only live in cPanel environment variables or local `.env` files, never in the repo.

