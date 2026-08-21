-- Migración 008: renombrar todas las tablas y columnas a inglés
-- Estado previo (MySQL OVH): Familias, Subcategorias, Recambios, Pedidos, PedidosEstadoHistorial, ImportacionesCatalogo, EmailsPermitidos
-- Estado objetivo: Families, Subcategories, Products, Orders, OrderStatusHistory, CatalogImports, AllowedEmails

SET FOREIGN_KEY_CHECKS = 0;

-- Quitar FKs que referencian tablas a renombrar (IF EXISTS para seguridad)
ALTER TABLE Subcategorias DROP FOREIGN KEY IF EXISTS FK_Subcategory_Family;
ALTER TABLE Recambios DROP FOREIGN KEY IF EXISTS FK_Product_Family;
ALTER TABLE Recambios DROP FOREIGN KEY IF EXISTS FK_Product_Subcategory;
ALTER TABLE Pedidos DROP FOREIGN KEY IF EXISTS FK_Order_Product;
ALTER TABLE Pedidos DROP FOREIGN KEY IF EXISTS FK_Order_Requester;
ALTER TABLE PedidosEstadoHistorial DROP FOREIGN KEY IF EXISTS FK_History_Order;
ALTER TABLE PedidosEstadoHistorial DROP FOREIGN KEY IF EXISTS FK_History_User;
ALTER TABLE ImportacionesCatalogo DROP FOREIGN KEY IF EXISTS FK_Import_User;

-- Renombrar tablas
RENAME TABLE
  Familias TO Families,
  Subcategorias TO Subcategories,
  Recambios TO Products,
  Pedidos TO Orders,
  PedidosEstadoHistorial TO OrderStatusHistory,
  ImportacionesCatalogo TO CatalogImports,
  EmailsPermitidos TO AllowedEmails;

-- Families
ALTER TABLE Families
  CHANGE COLUMN nombre name VARCHAR(100) NOT NULL,
  CHANGE COLUMN descripcion description VARCHAR(500);

-- Subcategories
ALTER TABLE Subcategories
  CHANGE COLUMN familiaId familyId INT NOT NULL,
  CHANGE COLUMN nombre name VARCHAR(100) NOT NULL;

-- Products
ALTER TABLE Products
  CHANGE COLUMN referenciaCMH cmhReference VARCHAR(50) NOT NULL,
  CHANGE COLUMN referenciaCliente customerReference VARCHAR(50),
  CHANGE COLUMN codigo code VARCHAR(50),
  CHANGE COLUMN nombre name VARCHAR(200) NOT NULL,
  CHANGE COLUMN marca brand VARCHAR(100),
  CHANGE COLUMN descripcion description TEXT,
  CHANGE COLUMN metrica metric VARCHAR(100),
  CHANGE COLUMN unidadEmbalaje packagingUnit VARCHAR(100),
  CHANGE COLUMN imagen image VARCHAR(500),
  CHANGE COLUMN plazoEntrega deliveryTime VARCHAR(50),
  CHANGE COLUMN familiaId familyId INT NOT NULL,
  CHANGE COLUMN subcategoriaId subcategoryId INT,
  CHANGE COLUMN nReposicion reorderPoint INT NOT NULL DEFAULT 1,
  CHANGE COLUMN stock stock INT DEFAULT 0,
  CHANGE COLUMN oculto hidden BIT NOT NULL DEFAULT 0;

-- Orders
ALTER TABLE Orders
  CHANGE COLUMN recambioId productId INT NOT NULL,
  CHANGE COLUMN solicitanteId requesterId INT NOT NULL,
  CHANGE COLUMN tipo type VARCHAR(30) NOT NULL,
  CHANGE COLUMN cantidad quantity INT NOT NULL,
  CHANGE COLUMN plazoDeseado desiredDeadline VARCHAR(50),
  CHANGE COLUMN estado status VARCHAR(30) NOT NULL DEFAULT 'Solicitado',
  CHANGE COLUMN prioritario priority BIT NOT NULL DEFAULT 0,
  CHANGE COLUMN observaciones notes TEXT,
  CHANGE COLUMN oculto hidden BIT NOT NULL DEFAULT 0,
  CHANGE COLUMN fechaSolicitud requestedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CHANGE COLUMN fechaActualizacion updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

-- OrderStatusHistory
ALTER TABLE OrderStatusHistory
  CHANGE COLUMN pedidoId orderId INT NOT NULL,
  CHANGE COLUMN usuarioId userId INT NOT NULL,
  CHANGE COLUMN estadoAnterior previousStatus VARCHAR(30),
  CHANGE COLUMN estadoNuevo newStatus VARCHAR(30) NOT NULL,
  CHANGE COLUMN observaciones notes VARCHAR(500),
  CHANGE COLUMN fecha createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AllowedEmails: ya en inglés excepto nombre de tabla renombrado arriba

-- Restaurar FKs
ALTER TABLE Subcategories
  ADD CONSTRAINT FK_Subcategory_Family FOREIGN KEY (familyId) REFERENCES Families(id) ON DELETE NO ACTION;

ALTER TABLE Products
  ADD CONSTRAINT FK_Product_Family FOREIGN KEY (familyId) REFERENCES Families(id),
  ADD CONSTRAINT FK_Product_Subcategory FOREIGN KEY (subcategoryId) REFERENCES Subcategories(id);

ALTER TABLE Orders
  ADD CONSTRAINT FK_Order_Product FOREIGN KEY (productId) REFERENCES Products(id),
  ADD CONSTRAINT FK_Order_Requester FOREIGN KEY (requesterId) REFERENCES Users(id);

ALTER TABLE OrderStatusHistory
  ADD CONSTRAINT FK_History_Order FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE,
  ADD CONSTRAINT FK_History_User FOREIGN KEY (userId) REFERENCES Users(id);

ALTER TABLE CatalogImports
  ADD CONSTRAINT FK_Import_User FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE RESTRICT;

SET FOREIGN_KEY_CHECKS = 1;

-- Renombrar índices viejos (si existen) a nombres en inglés
ALTER TABLE Products DROP INDEX IF EXISTS IX_Recambios_RefCMH;
ALTER TABLE Products DROP INDEX IF EXISTS IX_Recambios_Nombre;
ALTER TABLE Products DROP INDEX IF EXISTS IX_Recambios_Panel;
ALTER TABLE Products DROP INDEX IF EXISTS IX_Recambios_Codigo;
CREATE INDEX IX_Products_cmhReference ON Products(cmhReference);
CREATE INDEX IX_Products_name ON Products(name);
CREATE INDEX IX_Products_panel ON Products(panel);
CREATE INDEX IX_Products_code ON Products(code);

ALTER TABLE Orders DROP INDEX IF EXISTS IX_Pedidos_Estado;
ALTER TABLE Orders DROP INDEX IF EXISTS IX_Pedidos_Tipo;
ALTER TABLE Orders DROP INDEX IF EXISTS IX_Pedidos_Prioritario;
ALTER TABLE Orders DROP INDEX IF EXISTS IX_Pedidos_Recambio;
CREATE INDEX IX_Orders_status ON Orders(status);
CREATE INDEX IX_Orders_type ON Orders(type);
CREATE INDEX IX_Orders_priority_requestedAt ON Orders(priority, requestedAt DESC);
CREATE INDEX IX_Orders_productId ON Orders(productId);

ALTER TABLE CatalogImports DROP INDEX IF EXISTS IX_Importaciones_Marca_Fecha;
CREATE INDEX IX_CatalogImports_brand_finishedAt ON CatalogImports(brand, finishedAt DESC);
