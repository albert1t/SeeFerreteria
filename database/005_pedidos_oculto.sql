IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'hidden')
BEGIN
    ALTER TABLE Orders ADD hidden TINYINT(1) NOT NULL DEFAULT 0;
END
GO
