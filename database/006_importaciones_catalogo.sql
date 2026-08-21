-- SEE Ferreteria - Migration: catalog imports metadata and Festo price columns
-- Compatible with MySQL / MariaDB (the backend currently uses mysql2)
-- Run this after the existing schema is in place.

-- Table to track every bulk catalog import (Festo, etc.)
CREATE TABLE IF NOT EXISTS CatalogImports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    totalRecords INT NOT NULL DEFAULT 0,
    updated INT NOT NULL DEFAULT 0,
    errors INT NOT NULL DEFAULT 0,
    errorDetails TEXT,
    status ENUM('procesando', 'completado', 'fallido') NOT NULL DEFAULT 'procesando',
    fileName VARCHAR(255),
    userId INT NOT NULL,
    startedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    finishedAt DATETIME(3),
    CONSTRAINT FK_Import_User FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IX_Importaciones_Marca_Fecha ON CatalogImports(brand, finishedAt DESC);

-- Add PVP orientativo fields to the master product table
ALTER TABLE Products
    ADD COLUMN IF NOT EXISTS pvpOrientativo DECIMAL(12,2) NULL AFTER packagingUnit,
    ADD COLUMN IF NOT EXISTS pvpOrientativoMoneda VARCHAR(3) NULL DEFAULT 'EUR' AFTER pvpOrientativo;
