-- Migración: eliminar permisos JSON y renombrar AllowedEmails a AllowedEmails
-- Producción usa MySQL (OVH CloudDB)

-- 1. Eliminar columna permissions de Users
ALTER TABLE Users DROP COLUMN permissions;

-- 2. Renombrar tabla AllowedEmails a AllowedEmails
RENAME TABLE AllowedEmails TO AllowedEmails;

-- 3. Eliminar columna permissions de AllowedEmails
ALTER TABLE AllowedEmails DROP COLUMN permissions;
