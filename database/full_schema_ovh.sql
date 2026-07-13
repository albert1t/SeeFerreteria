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
        permissions NVARCHAR(MAX) NULL,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

-- Familias
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Familias')
BEGIN
    CREATE TABLE Familias (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL UNIQUE,
        descripcion NVARCHAR(500),
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

-- Subcategorias
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Subcategorias')
BEGIN
    CREATE TABLE Subcategorias (
        id INT IDENTITY(1,1) PRIMARY KEY,
        familiaId INT NOT NULL,
        nombre NVARCHAR(100) NOT NULL,
        CONSTRAINT FK_Sub_Familia FOREIGN KEY (familiaId)
            REFERENCES Familias(id) ON DELETE NO ACTION
    );
END
GO

-- Recambios
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Recambios')
BEGIN
    CREATE TABLE Recambios (
        id INT IDENTITY(1,1) PRIMARY KEY,
        referenciaCMH NVARCHAR(50) NOT NULL UNIQUE,
        referenciaCliente NVARCHAR(50),
        codigo NVARCHAR(50),
        nombre NVARCHAR(200) NOT NULL,
        marca NVARCHAR(100),
        descripcion NVARCHAR(MAX),
        metrica NVARCHAR(100),
        unidadEmbalaje NVARCHAR(100),
        imagen NVARCHAR(500),
        plazoEntrega NVARCHAR(50),
        familiaId INT NOT NULL,
        subcategoriaId INT,
        nReposicion INT NOT NULL DEFAULT 1,
        panel NVARCHAR(10) NOT NULL,
        col TINYINT NOT NULL CHECK (col BETWEEN 1 AND 6),
        row TINYINT NOT NULL CHECK (row BETWEEN 1 AND 15),
        stock INT DEFAULT 0,
        oculto BIT NOT NULL DEFAULT 0,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Rec_Familia FOREIGN KEY (familiaId) REFERENCES Familias(id),
        CONSTRAINT FK_Rec_Subcategoria FOREIGN KEY (subcategoriaId) REFERENCES Subcategorias(id),
        CONSTRAINT UQ_Recambio_Ubicacion UNIQUE (panel, col, row)
    );

    CREATE INDEX IX_Recambios_RefCMH ON Recambios(referenciaCMH);
    CREATE INDEX IX_Recambios_Nombre ON Recambios(nombre);
    CREATE INDEX IX_Recambios_Panel ON Recambios(panel);
    CREATE INDEX IX_Recambios_Codigo ON Recambios(codigo);
END
GO

-- Pedidos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Pedidos')
BEGIN
    CREATE TABLE Pedidos (
        id INT IDENTITY(1,1) PRIMARY KEY,
        recambioId INT NOT NULL,
        solicitanteId INT NOT NULL,
        tipo NVARCHAR(30) NOT NULL
            CHECK (tipo IN (N'Reposición', N'Solicitud', N'Solicitud Express')),
        cantidad INT NOT NULL CHECK (cantidad > 0),
        plazoDeseado NVARCHAR(50),
        estado NVARCHAR(30) NOT NULL DEFAULT 'Solicitado'
            CHECK (estado IN ('Solicitado','Pedido realizado','Pedido recibido','Finalizado')),
        prioritario BIT NOT NULL DEFAULT 0,
        observaciones NVARCHAR(MAX),
        oculto BIT NOT NULL DEFAULT 0,
        fechaSolicitud DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        fechaActualizacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Ped_Recambio FOREIGN KEY (recambioId) REFERENCES Recambios(id),
        CONSTRAINT FK_Ped_Solicitante FOREIGN KEY (solicitanteId) REFERENCES Users(id)
    );

    CREATE INDEX IX_Pedidos_Estado ON Pedidos(estado);
    CREATE INDEX IX_Pedidos_Tipo ON Pedidos(tipo);
    CREATE INDEX IX_Pedidos_Prioritario ON Pedidos(prioritario, fechaSolicitud DESC);
    CREATE INDEX IX_Pedidos_Recambio ON Pedidos(recambioId);
END
GO

-- PedidosEstadoHistorial
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PedidosEstadoHistorial')
BEGIN
    CREATE TABLE PedidosEstadoHistorial (
        id INT IDENTITY(1,1) PRIMARY KEY,
        pedidoId INT NOT NULL,
        usuarioId INT NOT NULL,
        estadoAnterior NVARCHAR(30),
        estadoNuevo NVARCHAR(30) NOT NULL,
        observaciones NVARCHAR(500),
        fecha DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Hist_Pedido FOREIGN KEY (pedidoId) REFERENCES Pedidos(id) ON DELETE CASCADE,
        CONSTRAINT FK_Hist_Usuario FOREIGN KEY (usuarioId) REFERENCES Users(id)
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
        permissions NVARCHAR(MAX) NULL,
        isActive BIT NOT NULL DEFAULT 1,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

-- ============================================================
-- 2. DATOS INICIALES (Familias + Subcategorias)
-- ============================================================

-- Familias
IF NOT EXISTS (SELECT 1 FROM Familias WHERE nombre = N'Tornillería')
    INSERT INTO Familias (nombre, descripcion) VALUES (N'Tornillería', N'Tornillos, tuercas, arandelas y elementos de unión roscados');
IF NOT EXISTS (SELECT 1 FROM Familias WHERE nombre = N'Herramientas')
    INSERT INTO Familias (nombre, descripcion) VALUES (N'Herramientas', N'Herramientas manuales, eléctricas y de medición');
IF NOT EXISTS (SELECT 1 FROM Familias WHERE nombre = N'Electricidad')
    INSERT INTO Familias (nombre, descripcion) VALUES (N'Electricidad', N'Cables, conectores, protecciones y material eléctrico');
IF NOT EXISTS (SELECT 1 FROM Familias WHERE nombre = N'Fontanería')
    INSERT INTO Familias (nombre, descripcion) VALUES (N'Fontanería', N'Tuberías, válvulas, racores y componentes');
IF NOT EXISTS (SELECT 1 FROM Familias WHERE nombre = N'Neumatica')
    INSERT INTO Familias (nombre, descripcion) VALUES (N'Neumatica', N'Cilindros, válvulas, racores y componentes neumáticos');
IF NOT EXISTS (SELECT 1 FROM Familias WHERE nombre = N'Climatización')
    INSERT INTO Familias (nombre, descripcion) VALUES (N'Climatización', N'Aire acondicionado y calefacción');
IF NOT EXISTS (SELECT 1 FROM Familias WHERE nombre = N'Seguridad')
    INSERT INTO Familias (nombre, descripcion) VALUES (N'Seguridad', N'EPIs y material de seguridad');
GO

DECLARE @tornId INT = (SELECT id FROM Familias WHERE nombre = N'Tornillería');
DECLARE @elecId INT = (SELECT id FROM Familias WHERE nombre = N'Electricidad');
DECLARE @fontId INT = (SELECT id FROM Familias WHERE nombre = N'Fontanería');
DECLARE @herrId INT = (SELECT id FROM Familias WHERE nombre = N'Herramientas');

-- Subcategorias
IF NOT EXISTS (SELECT 1 FROM Subcategorias WHERE nombre = N'Tornillos métricos' AND familiaId = @tornId)
    INSERT INTO Subcategorias (familiaId, nombre) VALUES (@tornId, N'Tornillos métricos');
IF NOT EXISTS (SELECT 1 FROM Subcategorias WHERE nombre = N'Tuercas' AND familiaId = @tornId)
    INSERT INTO Subcategorias (familiaId, nombre) VALUES (@tornId, N'Tuercas');
IF NOT EXISTS (SELECT 1 FROM Subcategorias WHERE nombre = N'Arandelas' AND familiaId = @tornId)
    INSERT INTO Subcategorias (familiaId, nombre) VALUES (@tornId, N'Arandelas');
IF NOT EXISTS (SELECT 1 FROM Subcategorias WHERE nombre = N'Cables' AND familiaId = @elecId)
    INSERT INTO Subcategorias (familiaId, nombre) VALUES (@elecId, N'Cables');
IF NOT EXISTS (SELECT 1 FROM Subcategorias WHERE nombre = N'Interruptores' AND familiaId = @elecId)
    INSERT INTO Subcategorias (familiaId, nombre) VALUES (@elecId, N'Interruptores');
IF NOT EXISTS (SELECT 1 FROM Subcategorias WHERE nombre = N'Racores' AND familiaId = @fontId)
    INSERT INTO Subcategorias (familiaId, nombre) VALUES (@fontId, N'Racores');
IF NOT EXISTS (SELECT 1 FROM Subcategorias WHERE nombre = N'Brocas' AND familiaId = @herrId)
    INSERT INTO Subcategorias (familiaId, nombre) VALUES (@herrId, N'Brocas');
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
-- 1. Recambios, Pedidos, PedidosEstadoHistorial, AllowedEmails
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
