-- SEE Ferreteria - Schema for Azure SQL
-- Run this script first on your Azure SQL database

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL UNIQUE,
        passwordHash NVARCHAR(255) NOT NULL,
        name NVARCHAR(100) NOT NULL,
        role NVARCHAR(20) NOT NULL DEFAULT 'user'
            CHECK (role IN ('admin','user')),
        isActive BIT NOT NULL DEFAULT 1,
        createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Familias')
BEGIN
    CREATE TABLE Familias (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL UNIQUE,
        descripcion NVARCHAR(500)
    );
END
GO

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

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Recambios')
BEGIN
    CREATE TABLE Recambios (
        id INT IDENTITY(1,1) PRIMARY KEY,
        referenciaCMH NVARCHAR(50) NOT NULL UNIQUE,
        referenciaCliente NVARCHAR(50),
        nombre NVARCHAR(200) NOT NULL,
        marca NVARCHAR(100),
        descripcionCorta NVARCHAR(500),
        descripcionLarga NVARCHAR(MAX),
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
END
GO

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

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PedidosEstadoHistorial')
BEGIN
    CREATE TABLE PedidosEstadoHistorial (
        id INT IDENTITY(1,1) PRIMARY KEY,
        pedidoId INT NOT NULL,
        usuarioId INT NOT NULL,
        estadoAnterior NVARCHAR(30),
        estadoNuevo NVARCHAR(30) NOT NULL,
        fecha DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Hist_Pedido FOREIGN KEY (pedidoId) REFERENCES Pedidos(id) ON DELETE CASCADE,
        CONSTRAINT FK_Hist_Usuario FOREIGN KEY (usuarioId) REFERENCES Users(id)
    );
END
GO
