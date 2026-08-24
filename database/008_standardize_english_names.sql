-- Migración 008: renombrar columnas restantes a inglés
-- Estado actual en producción: tablas ya en inglés, columnas aún en español en Products, Orders, OrderStatusHistory y CatalogImports.

SET FOREIGN_KEY_CHECKS = 0;

-- Quitar FKs que usan columnas españolas
ALTER TABLE Products DROP FOREIGN KEY IF EXISTS FK_Rec_Familia;
ALTER TABLE Products DROP FOREIGN KEY IF EXISTS FK_Rec_Subcategoria;
ALTER TABLE Orders DROP FOREIGN KEY IF EXISTS FK_Ped_Recambio;
ALTER TABLE Orders DROP FOREIGN KEY IF EXISTS FK_Ped_Solicitante;
ALTER TABLE OrderStatusHistory DROP FOREIGN KEY IF EXISTS FK_Hist_Pedido;
ALTER TABLE OrderStatusHistory DROP FOREIGN KEY IF EXISTS FK_Hist_Usuario;
ALTER TABLE CatalogImports DROP FOREIGN KEY IF EXISTS FK_Import_Usuario;

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
  CHANGE COLUMN oculto hidden TINYINT(1) NOT NULL DEFAULT 0;

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

-- CatalogImports
ALTER TABLE CatalogImports
  CHANGE COLUMN marca brand VARCHAR(50) NOT NULL,
  CHANGE COLUMN totalRegistros totalRecords INT NOT NULL DEFAULT 0,
  CHANGE COLUMN actualizados updated INT NOT NULL DEFAULT 0,
  CHANGE COLUMN errores errors INT NOT NULL DEFAULT 0,
  CHANGE COLUMN erroresDetalle errorDetails TEXT,
  CHANGE COLUMN estado status ENUM('procesando', 'completado', 'fallido') NOT NULL DEFAULT 'procesando',
  CHANGE COLUMN archivoNombre fileName VARCHAR(255),
  CHANGE COLUMN usuarioId userId INT NOT NULL,
  CHANGE COLUMN fechaInicio startedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CHANGE COLUMN fechaFin finishedAt DATETIME(3);

-- Restaurar FKs con nombres en inglés
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

-- Renombrar índices viejos a nombres en inglés
ALTER TABLE Products DROP INDEX IF EXISTS referenciaCMH;
ALTER TABLE Products DROP INDEX IF EXISTS IX_Recambios_RefCMH;
ALTER TABLE Products DROP INDEX IF EXISTS IX_Recambios_Nombre;
ALTER TABLE Products DROP INDEX IF EXISTS IX_Recambios_Panel;
ALTER TABLE Products DROP INDEX IF EXISTS IX_Recambios_Codigo;
ALTER TABLE Products DROP INDEX IF EXISTS UQ_Recambio_Ubicacion;
CREATE UNIQUE INDEX UQ_Product_Location ON Products(panel, col, row);
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
