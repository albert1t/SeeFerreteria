-- Tabla de ajustes dinámicos administrables desde la UI
CREATE TABLE IF NOT EXISTS Settings (
    settingKey VARCHAR(50) PRIMARY KEY,
    settingValue TEXT,
    updatedAt DATETIME(6) NOT NULL DEFAULT UTC_TIMESTAMP(6)
);
