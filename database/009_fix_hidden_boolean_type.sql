-- Cambia las columnas booleanas de BIT(1) a TINYINT(1)
-- para que mysql2 devuelva números en lugar de Buffer.

ALTER TABLE Products MODIFY hidden TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE Orders MODIFY hidden TINYINT(1) NOT NULL DEFAULT 0;
