# SEE Ferretería

Sistema full-stack de gestión de recambios con almacén visual por paneles/cubetas, pedidos y autenticación por roles.

## Stack

- **Frontend**: React 19 + TypeScript + Vite + React Router + TanStack Query
- **Backend**: Node.js + Express + TypeScript + JWT
- **Base de datos**: Azure SQL

## Inicio rápido

### 1. Base de datos

Ver [database/README.md](database/README.md). Ejecuta `001_schema.sql` y `002_seed.sql` en Azure SQL.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edita .env con credenciales Azure SQL y JWT_SECRET (mín. 32 caracteres)
# Opcional: configura AZURE_AD_TENANT_ID y AZURE_AD_CLIENT_ID para habilitar inicio de sesión con Microsoft.
npm install
npm run seed
npm run dev
```

### 3. Frontend

```bash
# Desde la raíz del proyecto
cp .env.example .env
# Si quieres usar MSAL, añade VITE_AZURE_AD_CLIENT_ID y VITE_AZURE_AD_TENANT_ID.
npm install
npm run dev
```

### 4. Ambos a la vez

```bash
npm install
cd backend && npm install && cd ..
npm run dev:all
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Usuarios demo

| Usuario   | Contraseña | Rol   |
|-----------|------------|-------|
| admin     | admin123   | admin |
| operario1 | op123      | user  |
