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
│   ├── 015_roles_personal_notifications_utc.sql
│   ├── 016_remove_viewer_role.sql
│   ├── 017_roles_table.sql              # Tabla Roles: permisos por rol en BD
│   ├── 018_add_notification_email.sql   # Correo personal de notificaciones
│   ├── 019_order_notification_matrix.sql # Matriz tipo de pedido × evento
│   └── full_schema_ovh.sql  # Esquema completo idempotente (desactualizado, ver nota abajo)
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
  - **Token de API de cPanel:** existe un token (`cpanel <usuario>:<token>`) que permite llamar a la UAPI de cPanel (`https://cmhautomacion.com:2083/execute/<Módulo>/<función>` con header `Authorization: cpanel usuario:token`) **sin pasar por TFA**. Con `Fileman::upload_files`/`get_file_content`/`list_files` se puede subir el script PHP de deploy, ejecutarlo vía HTTP normal, y luego borrarlo — todo sin intervención humana ni código fresco de TFA. El token no vive en este repo; está en las notas locales del usuario (ver sección de credenciales conocidas que el propio usuario puede compartir).
- **Repositorio en el servidor:** `/home/cmhautomacion/repositories/SeeFerreteria`
- **Document root (frontend):** `/home/cmhautomacion/repositories/SeeFerreteria/` (gestionado por cPanel Git).
- **Aplicación Node.js:**
  - Ruta: `/home/cmhautomacion/repositories/SeeFerreteria/backend`
  - Archivo de arranque: `dist/index.js`
  - Versión de Node: 24
  - Logs de error: `backend/stderr.log`
- **Frontend real en producción:** NO se sirve desde este hosting cPanel — vive en un hosting OVH aparte (`www.ferreteria.latecnologiaasumedida.com`, IP `46.105.204.26`, ruta `/home/iyxjhjj/repositories/SeeFerreteria/frontend/dist`), sin credenciales FTP/cPanel conocidas; el usuario lo sube a mano. Se puede verificar si está actualizado comparando el `index.html` servido (`/assets/index-<hash>.js`) contra `frontend/dist/index.html` del commit actual — sin necesitar credenciales.

### English
- **API domain:** `https://cmhautomacion.com`
- **Frontend domain:** `https://www.ferreteria.latecnologiaasumedida.com` (hosting alias; `VITE_API_URL` points to `cmhautomacion.com`).
- **cPanel:** `https://93.95.208.43:2083` (also reachable via `cmhautomacion.com:2083`).
  - User: `cmhautomacion`
  - Requires TFA; the session token expires, so a fresh code is usually needed.
- **SSH access:** disabled for this account. Shell login is not possible.
  - Alternative: upload temporary PHP scripts to `public_html` to run commands as the user (`passthru`, `shell_exec`).
  - **cPanel API token:** a token (`cpanel <user>:<token>`) exists that calls cPanel's UAPI (`https://cmhautomacion.com:2083/execute/<Module>/<function>` with header `Authorization: cpanel user:token`) **without TFA**. Using `Fileman::upload_files`/`get_file_content`/`list_files` you can upload the deploy PHP script, run it over plain HTTP, and delete it afterward — fully unattended, no fresh TFA code needed. The token itself is not in this repo; it lives in the user's local notes (ask the user to share it).
- **Repository on server:** `/home/cmhautomacion/repositories/SeeFerreteria`
- **Document root (frontend):** `/home/cmhautomacion/repositories/SeeFerreteria/` (managed by cPanel Git).
- **Node.js application:**
  - Path: `/home/cmhautomacion/repositories/SeeFerreteria/backend`
  - Startup file: `dist/index.js`
  - Node version: 24
  - Error logs: `backend/stderr.log`
- **Actual production frontend:** NOT served from this cPanel hosting — it lives on a separate OVH host (`www.ferreteria.latecnologiaasumedida.com`, IP `46.105.204.26`, path `/home/iyxjhjj/repositories/SeeFerreteria/frontend/dist`), with no known FTP/cPanel credentials; the user uploads it manually. Check whether it's up to date by comparing the served `index.html` (`/assets/index-<hash>.js`) against the current commit's `frontend/dist/index.html` — no credentials needed for that check.


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
| `NOTIFY_EMAIL` | No | Correo de notificaciones de orders (valor inicial; editable en `/admin/ajustes`) | `danexthegamer@gmail.com` (cambiar a `comercial@cmhautomacion.com` si se prefiere) |
| `MAIL_ENABLED` | No | Activa/desactiva envíos | `true` |
| `NOTIFY_ADMIN_ON_REGISTER` | No | Notificar al admin cuando un nuevo usuario se registra | `true` |
| `EMAIL_ORDERS_MODE` | No | Solo usado como valor inicial (all→todo activado, none→todo desactivado) la primera vez que se calcula la matriz de notificaciones global; una vez existe la fila `orderNotificationMatrix` en `Settings`, esta variable ya no tiene efecto | `all` |

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
- `Users` — usuarios locales (`username`, `passwordHash`, `name`, `role`, `isActive`, `notificationEmail` [correo propio para cuentas de contraseña; las de Microsoft usan `username` directo], `orderNotificationPrefs` [JSON, matriz tipo de pedido × evento]).
- `AllowedEmails` — whitelist para login con Microsoft. El primer login MSAL crea un `User` real pero **no borra** la fila de `AllowedEmails` correspondiente; la pantalla `/usuarios` fusiona ambas fuentes visualmente (`frontend/src/utils/mergeAccounts.ts`), deduplicando por email.
- `Roles` — permisos por rol (`name`, `label`, `permissions` JSON con la forma `{admin, orders, products, families, tarifas}`). Se carga en memoria al arrancar el backend (`backend/src/repositories/roles.ts`); si se edita a mano en BD, hace falta reiniciar el proceso Node para que se note el cambio (no hay invalidación de caché en caliente).
- `Settings` — clave/valor genérico (`settingKey`, `settingValue`). Guarda, entre otras, `mailEnabled`, `notifyEmail`, `notifyAdminOnRegister`, `orderNotificationMatrix` (JSON).
- `Families` / `Subcategories` — clasificación de productos.
- `Products` — piezas del almacén (referencia, imagen, posición `panel/col/row`, `hidden`, stock, etc.).
- `Orders` — pedidos de reposición/solicitud.
- `OrderStatusHistory` — histórico de cambios de estado.
- `CatalogImports` — log de importaciones masivas.

> **Nota:** `database/full_schema_ovh.sql` quedó desactualizado (no incluye `Roles`, ni las columnas nuevas de `Users`); para levantar un esquema desde cero hay que aplicarlo y luego correr en orden las migraciones `001` a la última.

### English
Production uses **MySQL** on OVH CloudDB. The pool is created in `backend/src/config/db.ts`.

Main tables:
- `Users` — local users (`username`, `passwordHash`, `name`, `role`, `isActive`, `notificationEmail` [own address for password accounts; Microsoft accounts use `username` directly], `orderNotificationPrefs` [JSON, order-type × event matrix]).
- `AllowedEmails` — whitelist for Microsoft login. The first MSAL login creates a real `User` but **never deletes** the matching `AllowedEmails` row; the `/usuarios` screen merges both sources visually (`frontend/src/utils/mergeAccounts.ts`), deduped by email.
- `Roles` — permissions per role (`name`, `label`, `permissions` JSON shaped `{admin, orders, products, families, tarifas}`). Loaded into memory at backend startup (`backend/src/repositories/roles.ts`); editing it directly in the DB needs a Node process restart to take effect (no hot cache invalidation).
- `Settings` — generic key/value (`settingKey`, `settingValue`). Stores, among others, `mailEnabled`, `notifyEmail`, `notifyAdminOnRegister`, `orderNotificationMatrix` (JSON).
- `Families` / `Subcategories` — spare-part classification.
- `Products` — warehouse items (reference, image, position `panel/col/row`, `hidden`, stock, etc.).
- `Orders` — replacement/orders.
- `OrderStatusHistory` — status change history.
- `CatalogImports` — bulk import log.

> **Note:** `database/full_schema_ovh.sql` is stale (no `Roles` table, no new `Users` columns); to stand up a schema from scratch, apply it and then run every migration from `001` through the latest, in order.

---

## 7. Autenticación y permisos / Authentication & Permissions

### Español
- Login local: `POST /api/auth/login` con `username` y `password`.
- Registro público: `POST /api/auth/register`.
- Login Microsoft: `POST /api/auth/msal-login` (requiere que el email esté en `AllowedEmails`).
- El token JWT se devuelve en la respuesta y se puede enviar como cookie `see_token` o header `Authorization: Bearer <token>`.
- Roles actuales: `admin`, `almacen`, `compras`. `operario` y `user` son alias heredados que se normalizan a `almacen`/`compras` (`normalizeUserRole`); el rol `viewer` se eliminó por completo (migración `016`, cualquier fila existente se reasignó a `compras`).
- **Los permisos ya no están hardcodeados**: viven en la tabla `Roles` (columna `permissions`, JSON), cargada en memoria al arrancar (`backend/src/repositories/roles.ts`, `getPermissionsForRole`). `GET /api/users/roles` expone la lista de roles al frontend (usado por el desplegable de rol en `/usuarios`), y `/api/auth/me` (y login/register/msal-login) devuelven `user.permissions` ya resuelto, así que el frontend no mantiene su propia copia de la matriz (`useAuth.tsx` → `can()` lee directamente de ahí).
- Matriz de permisos actual (resumen):
  - **admin**: todo.
  - **almacen**: control total de `products` y `families` (crear/editar/eliminar); en `orders`, el permiso base es total pero con una regla de negocio en código (no en la tabla `Roles`, porque depende de cada fila): solo puede editar/eliminar pedidos que **él mismo solicitó** y mientras sigan en `Solicitado` (`ordersService.assertCanModifyOrder`, espejado en frontend por `PedidosPage.tsx` → `modificable`). Puede marcar pedidos como `Pedido recibido` sin esa restricción de propiedad.
  - **compras**: gestiona cualquier pedido sin restricción de fase ni propiedad (crear/editar/eliminar), pero **no puede marcar un pedido como `Pedido recibido`** (bloqueado explícitamente en `ordersService.advanceStatus`, no es un permiso de la tabla `Roles`). Edita ficha/precio de productos (`products.edit=true`) pero el backend descarta silenciosamente los campos de almacén (`panel`, `col`, `row`, `familyId`, `reorderPoint`, `hidden`) si los envía — no puede crear/eliminar productos ni entrar en `/almacen`.
- Rutas de solo-almacén (`/swap`, `/unpositioned`, `/:id/assign-position` en `products.ts`) usan `requireRole('admin','almacen')` explícito en vez de `requirePermission('products', ...)`, precisamente para excluir a `compras` aunque tenga `products.edit=true`.

### English
- Local login: `POST /api/auth/login` with `username` and `password`.
- Public registration: `POST /api/auth/register`.
- Microsoft login: `POST /api/auth/msal-login` (email must be in `AllowedEmails`).
- JWT is returned in the response and can be sent as cookie `see_token` or header `Authorization: Bearer <token>`.
- Current roles: `admin`, `almacen`, `compras`. `operario` and `user` are legacy aliases normalized to `almacen`/`compras` (`normalizeUserRole`); the `viewer` role was fully removed (migration `016`, any existing row was reassigned to `compras`).
- **Permissions are no longer hardcoded**: they live in the `Roles` table (`permissions` column, JSON), loaded into memory at startup (`backend/src/repositories/roles.ts`, `getPermissionsForRole`). `GET /api/users/roles` exposes the role list to the frontend (used by the role dropdown in `/usuarios`), and `/api/auth/me` (plus login/register/msal-login) return a resolved `user.permissions`, so the frontend keeps no local copy of the matrix (`useAuth.tsx` → `can()` reads it directly).
- Current permission matrix (summary):
  - **admin**: everything.
  - **almacen**: full control of `products` and `families` (create/edit/delete); for `orders`, the base permission is unrestricted but a business rule in code (not in the `Roles` table, since it's per-row) limits them to editing/deleting only orders **they themselves requested**, and only while still `Solicitado` (`ordersService.assertCanModifyOrder`, mirrored in the frontend by `PedidosPage.tsx` → `modificable`). They can mark orders `Pedido recibido` without that ownership restriction.
  - **compras**: manages any order with no phase or ownership restriction (create/edit/delete), but **cannot mark an order `Pedido recibido`** (explicitly blocked in `ordersService.advanceStatus`, not a `Roles`-table permission). Edits product sheet/price (`products.edit=true`) but the backend silently drops warehouse fields (`panel`, `col`, `row`, `familyId`, `reorderPoint`, `hidden`) if sent — cannot create/delete products or enter `/almacen`.
- Warehouse-only routes (`/swap`, `/unpositioned`, `/:id/assign-position` in `products.ts`) use explicit `requireRole('admin','almacen')` instead of `requirePermission('products', ...)`, specifically to exclude `compras` even though it has `products.edit=true`.

---

## 8. Notificaciones por email / Email Notifications

### Español
Implementadas en `backend/src/services/mailService.ts`. Desde la migración `019`, el antiguo modo único (`all`/`urgent_only`/`none`) desapareció: ahora hay una **matriz configurable tipo de pedido × evento** (`OrderNotificationMatrix` en `backend/src/types/index.ts`), con exactamente los mismos dos canales de siempre pero cada uno con su propia matriz:

- **Global** (tabla `Settings`, clave `orderNotificationMatrix`; se edita en `/admin/ajustes`, solo admin): decide qué eventos avisan a `notifyEmail`.
- **Personal** (columna `Users.orderNotificationPrefs`; se edita en `/mis-ajustes`, cualquier usuario): decide qué eventos avisan al propio usuario.

Los eventos son: `created` (alta del pedido) y cada estado al que puede avanzar (`Pedido realizado`, `Pedido recibido`, `Finalizado`); el tipo de pedido es `Reposición` / `Solicitud` / `Solicitud Express`. El antiguo "solo urgentes" ya no existe como concepto — el mismo efecto se logra activando solo las casillas de `Solicitud Express`.

**Correo de destino personal:** si el `username` del usuario es un email válido (cuentas Microsoft), los avisos van ahí directo y no es configurable. Si no (cuentas de contraseña), el usuario configura un correo propio en `Users.notificationEmail` desde `/mis-ajustes`; si no lo ha puesto, no recibe nada aunque tenga eventos activados (`mailService.resolveNotificationEmail`).

**Disparadores:**
- `createOrder` en `ordersService.ts`: evalúa el evento `created` contra la matriz personal del solicitante (acuse) y contra la matriz global (`notificarEventoPedido`).
- `advanceStatus`: evalúa `newStatus` (que nunca es `Solicitado`, siempre coincide con un evento válido) contra ambas matrices — **ahora también notifica a la empresa en cambios de estado**, no solo al crear (antes solo se notificaba al solicitante).
- `updatePedido` (editar cantidad/plazo/notas mientras sigue en `Solicitado`): se trata como parte del evento `created` a efectos de la matriz personal; no dispara aviso a la empresa.
- `register` en `authService.ts`: notifica a `NOTIFY_EMAIL` si `NOTIFY_ADMIN_ON_REGISTER=true` (sin cambios, no usa la matriz).

**Endpoint de prueba:**
```bash
curl -X POST https://cmhautomacion.com/api/orders/test-email \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{}'
```
Si el `username` del usuario autenticado es un email válido, el correo se envía a ese email; si no, a `NOTIFY_EMAIL`.

### English
Implemented in `backend/src/services/mailService.ts`. As of migration `019`, the old single mode (`all`/`urgent_only`/`none`) is gone: there's now a **configurable order-type × event matrix** (`OrderNotificationMatrix` in `backend/src/types/index.ts`), with the same two channels as before, each with its own matrix:

- **Global** (`Settings` table, key `orderNotificationMatrix`; edited at `/admin/ajustes`, admin only): decides which events notify `notifyEmail`.
- **Personal** (`Users.orderNotificationPrefs` column; edited at `/mis-ajustes`, any user): decides which events notify that user.

Events are: `created` (order placed) and each status it can advance to (`Pedido realizado`, `Pedido recibido`, `Finalizado`); order type is `Reposición` / `Solicitud` / `Solicitud Express`. The old "urgent only" no longer exists as a concept — the same effect is achieved by only enabling the `Solicitud Express` row.

**Personal destination email:** if the user's `username` is a valid email (Microsoft accounts), alerts go there directly and it's not configurable. Otherwise (password accounts), the user sets their own address in `Users.notificationEmail` from `/mis-ajustes`; if unset, they get nothing even with events enabled (`mailService.resolveNotificationEmail`).

**Triggers:**
- `createOrder` in `ordersService.ts`: evaluates the `created` event against the requester's personal matrix (acknowledgment) and against the global matrix (`notificarEventoPedido`).
- `advanceStatus`: evaluates `newStatus` (never `Solicitado`, always a valid event) against both matrices — **now also notifies the company on status changes**, not just on creation (previously only the requester was notified there).
- `updatePedido` (editing quantity/deadline/notes while still `Solicitado`): treated as part of the `created` event for the personal matrix; does not notify the company.
- `register` in `authService.ts`: notifies `NOTIFY_EMAIL` if `NOTIFY_ADMIN_ON_REGISTER=true` (unchanged, doesn't use the matrix).

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
El despliegue ya **no usa cPanel Git Version Control** (fue eliminado). Se despliega mediante un script PHP temporal subido a `public_html` que ejecuta `git fetch/reset`, las migraciones SQL, `npm install` y reinicia la app.

**Flujo normal:**
1. Hacer cambios en local, compilar backend (`npm run build` en `backend/`) y frontend (`npm run build` en `frontend/`).
2. Commit y push a `origin/main` (el remote es HTTPS, se necesitan credenciales de GitHub).
3. Subir y ejecutar un script PHP en `public_html` que haga `git reset --hard origin/main`, aplique migraciones pendientes, ejecute `npm install --omit=dev` y reinicie la app.
4. El frontend en `www.ferreteria.latecnologiaasumedida.com` está en OVH (IP `46.105.204.26`); hay que copiar `frontend/dist` a `/home/iyxjhjj/repositories/SeeFerreteria/frontend/dist` y purgar la caché de OVH CDN manualmente.

**Reiniciar la app (sin SSH):**
`cloudlinux-selector restart` puede no matar el proceso antiguo. Para forzar la recarga:
```bash
# Obtener PID
ps aux | grep 'lsnode:/home/cmhautomacion/repositories/SeeFerreteria/backend/'
kill -9 <pid>
# Luego iniciar
/usr/sbin/cloudlinux-selector start --json --interpreter nodejs \
  --domain cmhautomacion.com \
  --app-root /home/cmhautomacion/repositories/SeeFerreteria/backend
```

**Actualizar variables de entorno:**
```bash
/usr/sbin/cloudlinux-selector set --json --interpreter nodejs \
  --domain cmhautomacion.com \
  --app-root /home/cmhautomacion/repositories/SeeFerreteria/backend \
  --env-vars '{"SMTP_PASS":"...",...}'
```

**Notas importantes:**
- El `npm` normal del `nodevenv` falla cuando `node_modules` es un symlink; usar la ruta directa de `npm-cli.js` de Node 24:
  `/opt/alt/alt-nodejs24/root/usr/bin/node /opt/alt/alt-nodejs24/root/usr/lib/node_modules/npm/bin/npm-cli.js install --omit=dev`
- No usar `touch tmp/restart.txt`; creaba `backend/tmp/` sin trackear y bloqueaba el deploy.

**Deploy desatendido con el token de API de cPanel (probado y funcional):**
1. Subir un script PHP (p.ej. a `public_html/deploy_run.php`) vía `Fileman::upload_files` que haga `git reset --hard origin/main`, `git clean -fd`, y el `npm install --omit=dev` de arriba.
2. Ejecutarlo con un `curl` normal a `https://cmhautomacion.com/deploy_run.php` (devuelve el log por `passthru`).
3. Reiniciar: otro script que mate el PID de `ps aux | grep lsnode:.../backend/` y llame a `cloudlinux-selector start` (ver comandos de arriba).
4. Verificar con `/api/health` y, si hace falta, leyendo `backend/stderr.log` o el contenido de `dist/` vía `Fileman::get_file_content`.
5. Borrar los scripts temporales de `public_html` al terminar (`unlink`), incluido el propio script de limpieza.

Todo esto sin TFA ni sesión de navegador — solo el token de API.

### English
Deployment no longer uses **cPanel Git Version Control** (it was removed). Deploy via a temporary PHP script uploaded to `public_html` that runs `git fetch/reset`, applies SQL migrations, runs `npm install`, and restarts the app.

**Normal flow:**
1. Make local changes, build backend (`npm run build` in `backend/`) and frontend (`npm run build` in `frontend/`).
2. Commit and push to `origin/main` (remote is HTTPS; GitHub credentials required).
3. Upload and run a PHP script in `public_html` that does `git reset --hard origin/main`, applies pending migrations, runs `npm install --omit=dev`, and restarts the app.
4. The frontend at `www.ferreteria.latecnologiaasumedida.com` is on OVH (IP `46.105.204.26`); copy `frontend/dist` to `/home/iyxjhjj/repositories/SeeFerreteria/frontend/dist` and purge the OVH CDN cache manually.

**Restart the app (no SSH):**
`cloudlinux-selector restart` may not kill the old process. To force a reload:
```bash
# Get PID
ps aux | grep 'lsnode:/home/cmhautomacion/repositories/SeeFerreteria/backend/'
kill -9 <pid>
# Then start
/usr/sbin/cloudlinux-selector start --json --interpreter nodejs \
  --domain cmhautomacion.com \
  --app-root /home/cmhautomacion/repositories/SeeFerreteria/backend
```

**Update environment variables:**
```bash
/usr/sbin/cloudlinux-selector set --json --interpreter nodejs \
  --domain cmhautomacion.com \
  --app-root /home/cmhautomacion/repositories/SeeFerreteria/backend \
  --env-vars '{"SMTP_PASS":"...",...}'
```

**Important notes:**
- The default `npm` from the `nodevenv` fails when `node_modules` is a symlink; use the direct Node 24 `npm-cli.js` path:
  `/opt/alt/alt-nodejs24/root/usr/bin/node /opt/alt/alt-nodejs24/root/usr/lib/node_modules/npm/bin/npm-cli.js install --omit=dev`
- Do not use `touch tmp/restart.txt`; it created an untracked `backend/tmp/` and blocked deployment.

**Unattended deploy with the cPanel API token (tested, works):**
1. Upload a PHP script (e.g. to `public_html/deploy_run.php`) via `Fileman::upload_files` that runs `git reset --hard origin/main`, `git clean -fd`, and the `npm install --omit=dev` above.
2. Run it with a plain `curl` to `https://cmhautomacion.com/deploy_run.php` (output streams back via `passthru`).
3. Restart: another script that kills the PID from `ps aux | grep lsnode:.../backend/` and calls `cloudlinux-selector start` (commands above).
4. Verify with `/api/health` and, if needed, by reading `backend/stderr.log` or `dist/` file contents via `Fileman::get_file_content`.
5. Delete the temporary scripts from `public_html` afterward (`unlink`), including the cleanup script itself.

All of this with no TFA and no browser session — just the API token.


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
| PATCH | `/api/orders/:id/status` | Avanzar estado (dispara email) |
| GET | `/api/users` | Gestión de usuarios |
| GET | `/api/users/roles` | Lista de roles con permisos (admin) |
| GET/PUT | `/api/settings/notifications` | Ajustes globales de notificaciones: `orderNotificationMatrix` (admin) |
| GET/PUT | `/api/settings/my-notifications` | Preferencias personales: `orderNotificationMatrix` + `notificationEmail` |
| GET/POST | `/api/catalogs` | Catálogos |
| GET/POST | `/api/imports` | Importaciones masivas |

---

## 12. Cambios recientes / Recent Changes

### Español
- **Rework de roles/permisos y notificaciones (noviembre 2026):**
  - Pantalla `/usuarios` fusiona `Users` + `AllowedEmails` en una sola tabla (columna "tipo de acceso").
  - `almacen` gana control total de productos/familias; `compras` gestiona cualquier pedido sin restricción de fase (antes solo podía editar/eliminar en `Solicitado`) pero sigue sin poder marcar `Pedido recibido`; `almacen` queda restringido a editar/eliminar solo sus propios pedidos mientras sigan `Solicitado`.
  - Rol `viewer` eliminado (migración `016`).
  - Permisos movidos de código hardcodeado a la tabla `Roles` (migración `017`); el frontend ya no mantiene su propia copia de la matriz.
  - Notificaciones: correo personal configurable para cuentas de contraseña (migración `018`), y el modo simple de pedidos sustituido por una matriz tipo de pedido × evento, tanto global como personal (migración `019`); la empresa ahora también recibe avisos en cambios de estado, no solo al crear.
  - Corregido bug de arrastre: `GET /api/products/unpositioned` nunca había sido alcanzable porque `GET /:id` (registrada antes) la interceptaba.
- **Full English refactor:** tablas, columnas, endpoints y tipos renombrados a inglés (`Products`, `Orders`, `OrderStatusHistory`, `CatalogImports`, etc.).
- **Migración de BD:** `database/008_standardize_english_names.sql` renombra todas las tablas/columnas de producción.
- **Notificaciones por email:** implementadas con Nodemailer; emails en nuevo pedido, acuse al solicitante y seguimiento de estado.
- **Modo de emails de pedidos:** variable `EMAIL_ORDERS_MODE` (`all`, `urgent_only`, `none`) y ajustes dinámicos en `/api/settings/notifications`.
- **Pestaña de ajustes de administrador:** `/admin/ajustes` para configurar notificaciones sin tocar variables de entorno.
- **Permisos de pedidos:** edición/eliminación solo permitida mientras el estado sea `Solicitado`.
- **Corrección flag urgente:** migración `010` cambia `Orders.priority` de `BIT(1)` a `TINYINT(1)`.
- **Corrección historial:** columna `OrderStatusHistory.createdAt` en lugar de `fecha`.
- **Endpoint de prueba SMTP:** `POST /api/orders/test-email`.
- **Despliegue manual:** cPanel Git eliminado; deploy vía script PHP temporal + `kill -9` del proceso `lsnode` para forzar recarga.

### English
- **Roles/permissions and notifications rework (November 2026):**
  - `/usuarios` screen merges `Users` + `AllowedEmails` into one table (an "access type" column).
  - `almacen` gains full control of products/families; `compras` now manages any order with no phase restriction (previously could only edit/delete while `Solicitado`) but still cannot mark `Pedido recibido`; `almacen` is now restricted to editing/deleting only its own orders while still `Solicitado`.
  - `viewer` role removed (migration `016`).
  - Permissions moved from hardcoded code to the `Roles` table (migration `017`); the frontend no longer keeps its own copy of the matrix.
  - Notifications: configurable personal email for password accounts (migration `018`), and the simple order-email mode replaced by an order-type × event matrix, both global and personal (migration `019`); the company now also gets notified on status changes, not just on creation.
  - Fixed a drag-along bug: `GET /api/products/unpositioned` had never been reachable because `GET /:id` (registered earlier) was shadowing it.
- **Full English refactor:** tables, columns, endpoints and types renamed to English (`Products`, `Orders`, `OrderStatusHistory`, `CatalogImports`, etc.).
- **DB migration:** `database/008_standardize_english_names.sql` renames all production tables/columns.
- **Email notifications:** order creation, status update and new-user registration (toggleable via `NOTIFY_ADMIN_ON_REGISTER`).
- **Order email mode:** `EMAIL_ORDERS_MODE` env var (`all`, `urgent_only`, `none`) and dynamic settings at `/api/settings/notifications`.
- **Admin settings tab:** `/admin/ajustes` to configure notifications without editing environment variables.
- **Order permissions:** edit/delete only allowed while status is `Solicitado`.
- **Urgent flag fix:** migration `010` changes `Orders.priority` from `BIT(1)` to `TINYINT(1)`.
- **History fix:** `OrderStatusHistory.createdAt` column instead of `fecha`.
- **SMTP test endpoint:** `POST /api/orders/test-email`.
- **Manual deployment:** cPanel Git removed; deploy via temporary PHP script + `kill -9` the `lsnode` process to force reload.


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
- Revisar `orderNotificationMatrix` (global en `/admin/ajustes`, personal en `/mis-ajustes`): si el evento/tipo de pedido correspondiente está desactivado, no se envía nada aunque SMTP funcione.

**Una ruta nueva con GET y segmento literal (ej. `/unpositioned`) nunca responde / cae en el handler equivocado**
- En Express, las rutas se evalúan en el orden en que se registran. Un `GET /:id` registrado antes intercepta cualquier GET literal posterior (`id` acaba valiendo el string literal, típicamente produce un error o `NaN`). Las rutas GET con segmento fijo deben registrarse **antes** que `GET /:id` en el mismo router (ver `backend/src/routes/products.ts`, donde `/unpositioned` tuvo este bug durante meses sin que nadie lo notara).

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
- Check `orderNotificationMatrix` (global at `/admin/ajustes`, personal at `/mis-ajustes`): if the relevant event/order-type is off, nothing sends even with working SMTP.

**A new GET route with a literal segment (e.g. `/unpositioned`) never responds / hits the wrong handler**
- Express evaluates routes in registration order. A `GET /:id` registered earlier intercepts any later literal GET (`id` ends up as the literal string, usually producing an error or `NaN`). Fixed-segment GET routes must be registered **before** `GET /:id` in the same router (see `backend/src/routes/products.ts`, where `/unpositioned` had this exact bug for months unnoticed).

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
