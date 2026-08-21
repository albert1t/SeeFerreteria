-- Migración: eliminar permisos JSON y renombrar AllowedEmails a EmailsPermitidos
-- Producción usa MySQL (OVH CloudDB)

-- 1. Eliminar columna permissions de Users
ALTER TABLE Users DROP COLUMN permissions;

-- 2. Renombrar tabla AllowedEmails a EmailsPermitidos
RENAME TABLE AllowedEmails TO EmailsPermitidos;

-- 3. Eliminar columna permissions de EmailsPermitidos
ALTER TABLE EmailsPermitidos DROP COLUMN permissions;
