-- Correo de notificación personal para usuarios que hacen login con contraseña
-- (su username no es un email). Los usuarios de Microsoft siguen usando su username
-- directamente, este campo no se usa para ellos.
-- Ejecutar una vez en la base MySQL antes de desplegar esta versión.

ALTER TABLE Users
  ADD COLUMN notificationEmail VARCHAR(255) NULL;
