-- SEE Ferreteria - Seed data
-- Run after 001_schema.sql
-- Default passwords (set via backend seed script): admin/admin123, operario1/op123

-- Familias
IF NOT EXISTS (SELECT 1 FROM Familias WHERE nombre = N'Tornillería')
    INSERT INTO Familias (nombre, descripcion) VALUES (N'Tornillería', N'Tornillos, tuercas y fijaciones');
IF NOT EXISTS (SELECT 1 FROM Familias WHERE nombre = N'Electricidad')
    INSERT INTO Familias (nombre, descripcion) VALUES (N'Electricidad', N'Material eléctrico y cableado');
IF NOT EXISTS (SELECT 1 FROM Familias WHERE nombre = N'Fontanería')
    INSERT INTO Familias (nombre, descripcion) VALUES (N'Fontanería', N'Tuberías, racores y válvulas');
IF NOT EXISTS (SELECT 1 FROM Familias WHERE nombre = N'Herramientas')
    INSERT INTO Familias (nombre, descripcion) VALUES (N'Herramientas', N'Herramientas manuales y consumibles');
GO

-- Subcategorias
DECLARE @tornId INT = (SELECT id FROM Familias WHERE nombre = N'Tornillería');
DECLARE @elecId INT = (SELECT id FROM Familias WHERE nombre = N'Electricidad');
DECLARE @fontId INT = (SELECT id FROM Familias WHERE nombre = N'Fontanería');
DECLARE @herrId INT = (SELECT id FROM Familias WHERE nombre = N'Herramientas');

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

-- Users are seeded via: npm run seed (backend) - passwords must be hashed with bcrypt

-- Sample recambios (panel A1-A3)
DECLARE @tornId INT = (SELECT id FROM Familias WHERE nombre = N'Tornillería');
DECLARE @elecId INT = (SELECT id FROM Familias WHERE nombre = N'Electricidad');
DECLARE @subTorn INT = (SELECT TOP 1 id FROM Subcategorias WHERE nombre = N'Tornillos métricos');
DECLARE @subTuerca INT = (SELECT TOP 1 id FROM Subcategorias WHERE nombre = N'Tuercas');
DECLARE @subCable INT = (SELECT TOP 1 id FROM Subcategorias WHERE nombre = N'Cables');

IF NOT EXISTS (SELECT 1 FROM Recambios WHERE referenciaCMH = 'CMH00001')
    INSERT INTO Recambios (referenciaCMH, referenciaCliente, nombre, marca, descripcionCorta, descripcionLarga,
        unidadEmbalaje, imagen, plazoEntrega, familiaId, subcategoriaId, nReposicion, panel, col, row)
    VALUES ('CMH00001', 'CLI-000001', N'Tornillo hexagonal M8x30', N'Würth',
        N'Tornillo hexagonal de acero zincado M8x30',
        N'Tornillo hexagonal M8x30. Acero 8.8 zincado. Uso industrial.',
        N'Caja de 100 uds', 'https://placehold.co/120x120/1e3a5f/ffffff?text=CMH00001', N'3 días',
        @tornId, @subTorn, 100, 'A1', 1, 1, 150);

IF NOT EXISTS (SELECT 1 FROM Recambios WHERE referenciaCMH = 'CMH00002')
    INSERT INTO Recambios (referenciaCMH, referenciaCliente, nombre, marca, descripcionCorta, descripcionLarga,
        unidadEmbalaje, imagen, plazoEntrega, familiaId, subcategoriaId, nReposicion, panel, col, row)
    VALUES ('CMH00002', 'CLI-000002', N'Tuerca autoblocante M10', N'Bossard',
        N'Tuerca autoblocante nylon M10',
        N'Tuerca autoblocante con anillo de nylon M10.',
        N'Bolsa de 50 uds', 'https://placehold.co/120x120/1e3a5f/ffffff?text=CMH00002', N'5 días',
        @tornId, @subTuerca, 50, 'A1', 2, 1, 80);

IF NOT EXISTS (SELECT 1 FROM Recambios WHERE referenciaCMH = 'CMH00003')
    INSERT INTO Recambios (referenciaCMH, referenciaCliente, nombre, marca, descripcionCorta, descripcionLarga,
        unidadEmbalaje, imagen, plazoEntrega, familiaId, subcategoriaId, nReposicion, panel, col, row)
    VALUES ('CMH00003', 'CLI-000003', N'Cable unipolar 2.5mm', N'General Cable',
        N'Cable unipolar flexible 2.5mm²',
        N'Cable unipolar flexible H07V-K 2.5mm². Rollo 100m.',
        N'Rollo 100m', 'https://placehold.co/120x120/1e3a5f/ffffff?text=CMH00003', N'7 días',
        @elecId, @subCable, 25, 'A2', 1, 1, 40);

IF NOT EXISTS (SELECT 1 FROM Recambios WHERE referenciaCMH = 'CMH00004')
    INSERT INTO Recambios (referenciaCMH, referenciaCliente, nombre, marca, descripcionCorta, descripcionLarga,
        unidadEmbalaje, imagen, plazoEntrega, familiaId, subcategoriaId, nReposicion, panel, col, row)
    VALUES ('CMH00004', 'CLI-000004', N'Tornillo allen M6x20', N'Fischer',
        N'Tornillo cabeza allen M6x20 inox',
        N'Tornillo cabeza allen inoxidable A2 M6x20.',
        N'Caja de 200 uds', 'https://placehold.co/120x120/1e3a5f/ffffff?text=CMH00004', N'3 días',
        @tornId, @subTorn, 200, 'A2', 3, 5, 300);

IF NOT EXISTS (SELECT 1 FROM Recambios WHERE referenciaCMH = 'CMH00005')
    INSERT INTO Recambios (referenciaCMH, referenciaCliente, nombre, marca, descripcionCorta, descripcionLarga,
        unidadEmbalaje, imagen, plazoEntrega, familiaId, subcategoriaId, nReposicion, panel, col, row)
    VALUES ('CMH00005', 'CLI-000005', N'Taco expansivo 10x60', N'Hilti',
        N'Taco expansivo acero 10x60mm',
        N'Taco expansivo de acero para hormigón 10x60mm.',
        N'Caja de 50 uds', 'https://placehold.co/120x120/1e3a5f/ffffff?text=CMH00005', N'5 días',
        @tornId, @subTorn, 50, 'A3', 1, 10, 120);
GO
