-- Hace que panel, col y row sean opcionales en Products
-- Para permitir productos sin ubicacion asignada

ALTER TABLE Products MODIFY panel VARCHAR(10) NULL;
ALTER TABLE Products MODIFY col INT NULL;
ALTER TABLE Products MODIFY `row` INT NULL;
