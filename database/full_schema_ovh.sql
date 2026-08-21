-- ============================================================
-- SEE Ferretería - Esquema completo para OVH Cloud (SQL Server)
-- Basado en el esquema real de Azure SQL + migraciones
-- Idempotente: ejecutar多次 sin dañar datos existentes
-- ============================================================

-- ============================================================
-- 1. TABLAS
-- ============================================================

-- Users
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL UNIQUE,
        passwordHash NVARCHAR(255) NOT NULL,
        name NVARCHAR(100) NOT NULL,
        role NVARCHAR(20) NOT NULL DEFAULT 'user'
            CHECK (role IN ('admin','user','viewer','operario')),
        isActive BIT NOT NULL DEFAULT 1,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

-- Families
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Families')
BEGIN
    CREATE TABLE Families (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(500),
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

-- Subcategories
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Subcategories')
BEGIN
    CREATE TABLE Subcategories (
        id INT IDENTITY(1,1) PRIMARY KEY,
        familyId INT NOT NULL,
        name NVARCHAR(100) NOT NULL,
        CONSTRAINT FK_Subcategory_Family FOREIGN KEY (familyId)
            REFERENCES Families(id) ON DELETE NO ACTION
    );
END
GO

-- Products
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Products')
BEGIN
    CREATE TABLE Products (
        id INT IDENTITY(1,1) PRIMARY KEY,
        cmhReference NVARCHAR(50) NOT NULL UNIQUE,
        customerReference NVARCHAR(50),
        code NVARCHAR(50),
        name NVARCHAR(200) NOT NULL,
        brand NVARCHAR(100),
        description NVARCHAR(MAX),
        metric NVARCHAR(100),
        packagingUnit NVARCHAR(100),
        image NVARCHAR(500),
        deliveryTime NVARCHAR(50),
        familyId INT NOT NULL,
        subcategoryId INT,
        reorderPoint INT NOT NULL DEFAULT 1,
        panel NVARCHAR(10) NOT NULL,
        col TINYINT NOT NULL CHECK (col BETWEEN 1 AND 6),
        row TINYINT NOT NULL CHECK (row BETWEEN 1 AND 15),
        stock INT DEFAULT 0,
        hidden BIT NOT NULL DEFAULT 0,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Product_Family FOREIGN KEY (familyId) REFERENCES Families(id),
        CONSTRAINT FK_Product_Subcategory FOREIGN KEY (subcategoryId) REFERENCES Subcategories(id),
        CONSTRAINT UQ_Recambio_Ubicacion UNIQUE (panel, col, row)
    );

    CREATE INDEX IX_Products_cmhReference ON Products(cmhReference);
    CREATE INDEX IX_Products_name ON Products(name);
    CREATE INDEX IX_Products_panel ON Products(panel);
    CREATE INDEX IX_Products_code ON Products(code);
END
GO

-- Orders
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Orders')
BEGIN
    CREATE TABLE Orders (
        id INT IDENTITY(1,1) PRIMARY KEY,
        productId INT NOT NULL,
        requesterId INT NOT NULL,
        type NVARCHAR(30) NOT NULL
            CHECK (type IN (N'Reposición', N'Solicitud', N'Solicitud Express')),
        quantity INT NOT NULL CHECK (quantity > 0),
        desiredDeadline NVARCHAR(50),
        status NVARCHAR(30) NOT NULL DEFAULT 'Solicitado'
            CHECK (status IN ('Solicitado','Pedido realizado','Pedido recibido','Finalizado')),
        priority BIT NOT NULL DEFAULT 0,
        notes NVARCHAR(MAX),
        hidden BIT NOT NULL DEFAULT 0,
        requestedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Order_Product FOREIGN KEY (productId) REFERENCES Products(id),
        CONSTRAINT FK_Order_Requester FOREIGN KEY (requesterId) REFERENCES Users(id)
    );

    CREATE INDEX IX_Orders_status ON Orders(status);
    CREATE INDEX IX_Orders_type ON Orders(type);
    CREATE INDEX IX_Orders_priority_requestedAt ON Orders(priority, requestedAt DESC);
    CREATE INDEX IX_Orders_productId ON Orders(productId);
END
GO

-- OrderStatusHistory
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderStatusHistory')
BEGIN
    CREATE TABLE OrderStatusHistory (
        id INT IDENTITY(1,1) PRIMARY KEY,
        orderId INT NOT NULL,
        userId INT NOT NULL,
        previousStatus NVARCHAR(30),
        newStatus NVARCHAR(30) NOT NULL,
        notes NVARCHAR(500),
        fecha DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_History_Order FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE,
        CONSTRAINT FK_History_User FOREIGN KEY (userId) REFERENCES Users(id)
    );
END
GO

-- AllowedEmails (para MSAL)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AllowedEmails')
BEGIN
    CREATE TABLE AllowedEmails (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(100) NOT NULL UNIQUE,
        role NVARCHAR(20) NOT NULL DEFAULT 'user',
        isActive BIT NOT NULL DEFAULT 1,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

-- ============================================================
-- 2. DATOS INICIALES (Families + Subcategories)
-- ============================================================

-- Families
IF NOT EXISTS (SELECT 1 FROM Families WHERE name = N'Tornillería')
    INSERT INTO Families (name, description) VALUES (N'Tornillería', N'Tornillos, tuercas, arandelas y elementos de unión roscados');
IF NOT EXISTS (SELECT 1 FROM Families WHERE name = N'Herramientas')
    INSERT INTO Families (name, description) VALUES (N'Herramientas', N'Herramientas manuales, eléctricas y de medición');
IF NOT EXISTS (SELECT 1 FROM Families WHERE name = N'Electricidad')
    INSERT INTO Families (name, description) VALUES (N'Electricidad', N'Cables, conectores, protecciones y material eléctrico');
IF NOT EXISTS (SELECT 1 FROM Families WHERE name = N'Fontanería')
    INSERT INTO Families (name, description) VALUES (N'Fontanería', N'Tuberías, válvulas, racores y componentes');
IF NOT EXISTS (SELECT 1 FROM Families WHERE name = N'Neumatica')
    INSERT INTO Families (name, description) VALUES (N'Neumatica', N'Cilindros, válvulas, racores y componentes neumáticos');
IF NOT EXISTS (SELECT 1 FROM Families WHERE name = N'Climatización')
    INSERT INTO Families (name, description) VALUES (N'Climatización', N'Aire acondicionado y calefacción');
IF NOT EXISTS (SELECT 1 FROM Families WHERE name = N'Seguridad')
    INSERT INTO Families (name, description) VALUES (N'Seguridad', N'EPIs y material de seguridad');
GO

DECLARE @tornId INT = (SELECT id FROM Families WHERE name = N'Tornillería');
DECLARE @elecId INT = (SELECT id FROM Families WHERE name = N'Electricidad');
DECLARE @fontId INT = (SELECT id FROM Families WHERE name = N'Fontanería');
DECLARE @herrId INT = (SELECT id FROM Families WHERE name = N'Herramientas');

-- Subcategories
IF NOT EXISTS (SELECT 1 FROM Subcategories WHERE name = N'Tornillos métricos' AND familyId = @tornId)
    INSERT INTO Subcategories (familyId, name) VALUES (@tornId, N'Tornillos métricos');
IF NOT EXISTS (SELECT 1 FROM Subcategories WHERE name = N'Tuercas' AND familyId = @tornId)
    INSERT INTO Subcategories (familyId, name) VALUES (@tornId, N'Tuercas');
IF NOT EXISTS (SELECT 1 FROM Subcategories WHERE name = N'Arandelas' AND familyId = @tornId)
    INSERT INTO Subcategories (familyId, name) VALUES (@tornId, N'Arandelas');
IF NOT EXISTS (SELECT 1 FROM Subcategories WHERE name = N'Cables' AND familyId = @elecId)
    INSERT INTO Subcategories (familyId, name) VALUES (@elecId, N'Cables');
IF NOT EXISTS (SELECT 1 FROM Subcategories WHERE name = N'Interruptores' AND familyId = @elecId)
    INSERT INTO Subcategories (familyId, name) VALUES (@elecId, N'Interruptores');
IF NOT EXISTS (SELECT 1 FROM Subcategories WHERE name = N'Racores' AND familyId = @fontId)
    INSERT INTO Subcategories (familyId, name) VALUES (@fontId, N'Racores');
IF NOT EXISTS (SELECT 1 FROM Subcategories WHERE name = N'Brocas' AND familyId = @herrId)
    INSERT INTO Subcategories (familyId, name) VALUES (@herrId, N'Brocas');
GO

-- ============================================================
-- 3. USUARIOS POR DEFECTO
-- Contraseñas hasheadas con bcrypt (generadas por backend)
-- Los usuarios se crean via seed del backend: npm run seed
-- ============================================================

-- ============================================================
-- 4. NOTAS PARA IMPORTAR DATOS EXISTENTES
-- ============================================================
-- Para importar datos desde el bacpac de Azure:
-- 1. Products, Orders, OrderStatusHistory, AllowedEmails
--    deben importarse con SSMS (Import Data-tier Application)
--    o con sqlpackage: 
--    sqlpackage /Action:Import /SourceFile:Backup_SeeFerreteria.bacpac
--                /TargetConnectionString:"...OVH connection string..."
--
-- 2. O exportar como .sql desde SSMS: 
--    Botón derecho BD → Tasks → Generate Scripts → Schema + Data
-- ============================================================

PRINT '✅ Esquema completo aplicado correctamente';
GO
