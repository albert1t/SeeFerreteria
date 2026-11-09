-- El rol 'viewer' (solo lectura) ya no existe en la app; se retira el último rol legado.
-- Ejecutar una vez en la base MySQL antes de desplegar esta versión.

UPDATE Users SET role = 'compras' WHERE role = 'viewer';
UPDATE AllowedEmails SET role = 'compras' WHERE role = 'viewer';
