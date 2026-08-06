-- SEE Ferreteria - Migration: catalog imports metadata and Festo price columns
-- Compatible with MySQL / MariaDB (the backend currently uses mysql2)
-- Run this after the existing schema is in place.

-- Table to track every bulk catalog import (Festo, etc.)
CREATE TABLE IF NOT EXISTS ImportacionesCatalogo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(50) NOT NULL,
    totalRegistros INT NOT NULL DEFAULT 0,
    actualizados INT NOT NULL DEFAULT 0,
    errores INT NOT NULL DEFAULT 0,
    erroresDetalle TEXT,
    estado ENUM('procesando', 'completado', 'fallido') NOT NULL DEFAULT 'procesando',
    archivoNombre VARCHAR(255),
    usuarioId INT NOT NULL,
    fechaInicio DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    fechaFin DATETIME(3),
    CONSTRAINT FK_Import_Usuario FOREIGN KEY (usuarioId) REFERENCES Users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IX_Importaciones_Marca_Fecha ON ImportacionesCatalogo(marca, fechaFin DESC);

-- Add PVP orientativo fields to the master product table
ALTER TABLE Recambios
    ADD COLUMN IF NOT EXISTS pvpOrientativo DECIMAL(12,2) NULL AFTER unidadEmbalaje,
    ADD COLUMN IF NOT EXISTS pvpOrientativoMoneda VARCHAR(3) NULL DEFAULT 'EUR' AFTER pvpOrientativo;
