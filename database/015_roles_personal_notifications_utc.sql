-- Roles actuales, preferencias personales de correo y normalización de cuentas existentes.
-- Ejecutar una vez en la base MySQL antes de desplegar esta versión.

ALTER TABLE Users
  MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'compras',
  ADD COLUMN emailOrdersMode VARCHAR(20) NOT NULL DEFAULT 'all';

ALTER TABLE AllowedEmails
  MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'compras';

UPDATE Users SET role = 'almacen' WHERE role = 'operario';
UPDATE Users SET role = 'compras' WHERE role = 'user';
UPDATE AllowedEmails SET role = 'almacen' WHERE role = 'operario';
UPDATE AllowedEmails SET role = 'compras' WHERE role = 'user';
