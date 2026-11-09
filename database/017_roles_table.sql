-- Tabla Roles: los permisos de cada rol pasan de estar hardcodeados en el backend/frontend
-- a vivir aquí. El backend los carga una vez al arrancar (ver repositories/roles.ts).
-- Ejecutar una vez en la base MySQL antes de desplegar esta versión.

CREATE TABLE IF NOT EXISTS Roles (
  name VARCHAR(20) NOT NULL PRIMARY KEY,
  label VARCHAR(50) NOT NULL,
  permissions JSON NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO Roles (name, label, permissions) VALUES
('admin', 'Administrador', JSON_OBJECT(
  'admin', TRUE,
  'orders', JSON_OBJECT('create', TRUE, 'view', TRUE, 'edit', TRUE, 'delete', TRUE),
  'products', JSON_OBJECT('create', TRUE, 'view', TRUE, 'edit', TRUE, 'delete', TRUE, 'viewDataPage', TRUE),
  'families', JSON_OBJECT('create', TRUE, 'view', TRUE, 'edit', TRUE, 'delete', TRUE),
  'tarifas', JSON_OBJECT('create', TRUE, 'view', TRUE, 'edit', TRUE, 'delete', TRUE)
)),
-- Control total de su pestaña (productos y familias). En pedidos, solo propios + fase
-- "Solicitado" se aplica en código (ordersService.assertCanModifyOrder), no es expresable
-- como permiso plano porque depende de cada pedido.
('almacen', 'Almacén', JSON_OBJECT(
  'admin', FALSE,
  'orders', JSON_OBJECT('create', TRUE, 'view', TRUE, 'edit', TRUE, 'delete', TRUE),
  'products', JSON_OBJECT('create', TRUE, 'view', TRUE, 'edit', TRUE, 'delete', TRUE, 'viewDataPage', FALSE),
  'families', JSON_OBJECT('create', TRUE, 'view', TRUE, 'edit', TRUE, 'delete', TRUE),
  'tarifas', JSON_OBJECT('create', FALSE, 'view', FALSE, 'edit', FALSE, 'delete', FALSE)
)),
-- Gestiona cualquier pedido sin restricción de fase y edita ficha/precio de productos
-- (el backend descarta los campos de almacén si los envía), pero no crea/elimina
-- productos ni entra en Almacén.
('compras', 'Compras', JSON_OBJECT(
  'admin', FALSE,
  'orders', JSON_OBJECT('create', TRUE, 'view', TRUE, 'edit', TRUE, 'delete', TRUE),
  'products', JSON_OBJECT('create', FALSE, 'view', TRUE, 'edit', TRUE, 'delete', FALSE, 'viewDataPage', TRUE),
  'families', JSON_OBJECT('create', FALSE, 'view', FALSE, 'edit', FALSE, 'delete', FALSE),
  'tarifas', JSON_OBJECT('create', FALSE, 'view', FALSE, 'edit', FALSE, 'delete', FALSE)
))
ON DUPLICATE KEY UPDATE permissions = VALUES(permissions), label = VALUES(label);
