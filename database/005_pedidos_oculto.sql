IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Pedidos') AND name = 'oculto')
BEGIN
    ALTER TABLE Pedidos ADD oculto BIT NOT NULL DEFAULT 0;
END
GO
