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

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Families')
BEGIN
    CREATE TABLE Families (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(500)
    );
END
GO

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

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Products')
BEGIN
    CREATE TABLE Products (
        id INT IDENTITY(1,1) PRIMARY KEY,
        cmhReference NVARCHAR(50) NOT NULL UNIQUE,
        customerReference NVARCHAR(50),
        name NVARCHAR(200) NOT NULL,
        brand NVARCHAR(100),
        descripcionCorta NVARCHAR(500),
        descripcionLarga NVARCHAR(MAX),
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
END
GO

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
        requestedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updatedAt DATETIME2 NOT NULL DEFAULssssssT SYSUTCDATETIME(),
        CONSTRAINT FK_Order_Product FOREIGN KEY (productId) REFERENCES Products(id),
        CONSTRAINT FK_Order_Requester FOREIGN KEY (requesterId) REFERENCES Users(id)
    );

    CREATE INDEX IX_Orders_status ON Orders(status);
    CREATE INDEX IX_Orders_type ON Orders(type);
    CREATE INDEX IX_Orders_priority_requestedAt ON Orders(priority, requestedAt DESC);
    CREATE INDEX IX_Orders_productId ON Orders(productId);
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderStatusHistory')
BEGIN
    CREATE TABLE OrderStatusHistory (
        id INT IDENTITY(1,1) PRIMARY KEY,
        orderId INT NOT NULL,
        userId INT NOT NULL,
        previousStatus NVARCHAR(30),
        newStatus NVARCHAR(30) NOT NULL,
        fecha DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_History_Order FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE,
        CONSTRAINT FK_History_User FOREIGN KEY (userId) REFERENCES Users(id)
    );
END
GO
