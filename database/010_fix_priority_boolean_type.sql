-- Cambia Orders.priority de BIT(1) a TINYINT(1)
-- para que mysql2 devuelva 0/1 en lugar de Buffer.

ALTER TABLE Orders MODIFY priority TINYINT(1) NOT NULL DEFAULT 0;
