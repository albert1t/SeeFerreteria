-- Add granular permissions and MSAL email allowlist

IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'permissions' AND object_id = OBJECT_ID('Users'))
BEGIN
    ALTER TABLE Users ADD permissions NVARCHAR(MAX) NULL;
END
GO

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

-- Default permissions for existing users:
-- admin: all permissions
-- user: can create/view/edit pedidos, view recambios
UPDATE Users
SET permissions = CASE
    WHEN role = 'admin' THEN '{"admin":true,"pedidos":{"create":true,"view":true,"edit":true,"delete":true},"recambios":{"create":true,"view":true,"edit":true,"delete":true}}'
    ELSE '{"admin":false,"pedidos":{"create":true,"view":true,"edit":true,"delete":false},"recambios":{"create":false,"view":true,"edit":false,"delete":false}}'
END
WHERE permissions IS NULL;
GO
