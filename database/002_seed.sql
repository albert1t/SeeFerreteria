-- SEE Ferreteria - Seed data
-- Run after 001_schema.sql
-- Usuarios iniciales creados por el backend seed (ver backend/src/scripts/seed.ts).

-- Families
IF NOT EXISTS (SELECT 1 FROM Families WHERE name = N'Tornillería')
    INSERT INTO Families (name, description) VALUES (N'Tornillería', N'Tornillos, tuercas y fijaciones');
IF NOT EXISTS (SELECT 1 FROM Families WHERE name = N'Electricidad')
    INSERT INTO Families (name, description) VALUES (N'Electricidad', N'Material eléctrico y cableado');
IF NOT EXISTS (SELECT 1 FROM Families WHERE name = N'Fontanería')
    INSERT INTO Families (name, description) VALUES (N'Fontanería', N'Tuberías, racores y válvulas');
IF NOT EXISTS (SELECT 1 FROM Families WHERE name = N'Herramientas')
    INSERT INTO Families (name, description) VALUES (N'Herramientas', N'Herramientas manuales y consumibles');
GO

-- Subcategories
DECLARE @tornId INT = (SELECT id FROM Families WHERE name = N'Tornillería');
DECLARE @elecId INT = (SELECT id FROM Families WHERE name = N'Electricidad');
DECLARE @fontId INT = (SELECT id FROM Families WHERE name = N'Fontanería');
DECLARE @herrId INT = (SELECT id FROM Families WHERE name = N'Herramientas');

IF NOT EXISTS (SELECT 1 FROM Subcategories WHERE name = N'Tornillos métricos' AND familyId = @tornId)
    INSERT INTO Subcategories (familyId, name) VALUES (@tornId, N'Tornillos métricos');
IF NOT EXISTS (SELECT 1 FROM Subcategories WHERE name = N'Tuercas' AND familyId = @tornId)
    INSERT INTO Subcategories (familyId, name) VALUES (@tornId, N'Tuercas');
IF NOT EXISTS (SELECT 1 FROM Subcategories WHERE name = N'Arandelas' AND familyId = @tornId)
    INSERT INTO Subcategories (familyId, name) VALUES (@tornId, N'Arandelas');
IF NOT EXISTS (SELECT 1 FROM Subcategories WHERE name = N'Cables' AND familyId = @elecId)
    INSERT INTO Subcategories (familyId, name) VALUES (@elecId, N'Cables');
IF NOT EXISTS (SELECT 1 FROM Subcategories WHERE name = N'Interruptores' AND familyId = @elecId)
    INSERT INTO Subcategories (familyId, name) VALUES (@elecId, N'Interruptores');
IF NOT EXISTS (SELECT 1 FROM Subcategories WHERE name = N'Racores' AND familyId = @fontId)
    INSERT INTO Subcategories (familyId, name) VALUES (@fontId, N'Racores');
IF NOT EXISTS (SELECT 1 FROM Subcategories WHERE name = N'Brocas' AND familyId = @herrId)
    INSERT INTO Subcategories (familyId, name) VALUES (@herrId, N'Brocas');
GO

-- Users are seeded via: npm run seed (backend) - passwords must be hashed with bcrypt

-- Sample products (panel A1-A3)
DECLARE @tornId INT = (SELECT id FROM Families WHERE name = N'Tornillería');
DECLARE @elecId INT = (SELECT id FROM Families WHERE name = N'Electricidad');
DECLARE @subTorn INT = (SELECT TOP 1 id FROM Subcategories WHERE name = N'Tornillos métricos');
DECLARE @subTuerca INT = (SELECT TOP 1 id FROM Subcategories WHERE name = N'Tuercas');
DECLARE @subCable INT = (SELECT TOP 1 id FROM Subcategories WHERE name = N'Cables');

IF NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'CMH00001')
    INSERT INTO Products (cmhReference, customerReference, name, brand, descripcionCorta, descripcionLarga,
        packagingUnit, image, deliveryTime, familyId, subcategoryId, reorderPoint, panel, col, row)
    VALUES ('CMH00001', 'CLI-000001', N'Tornillo hexagonal M8x30', N'Würth',
        N'Tornillo hexagonal de acero zincado M8x30',
        N'Tornillo hexagonal M8x30. Acero 8.8 zincado. Uso industrial.',
        N'Caja de 100 uds', 'https://placehold.co/120x120/1e3a5f/ffffff?text=CMH00001', N'3 días',
        @tornId, @subTorn, 100, 'A1', 1, 1, 150);

IF NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'CMH00002')
    INSERT INTO Products (cmhReference, customerReference, name, brand, descripcionCorta, descripcionLarga,
        packagingUnit, image, deliveryTime, familyId, subcategoryId, reorderPoint, panel, col, row)
    VALUES ('CMH00002', 'CLI-000002', N'Tuerca autoblocante M10', N'Bossard',
        N'Tuerca autoblocante nylon M10',
        N'Tuerca autoblocante con anillo de nylon M10.',
        N'Bolsa de 50 uds', 'https://placehold.co/120x120/1e3a5f/ffffff?text=CMH00002', N'5 días',
        @tornId, @subTuerca, 50, 'A1', 2, 1, 80);

IF NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'CMH00003')
    INSERT INTO Products (cmhReference, customerReference, name, brand, descripcionCorta, descripcionLarga,
        packagingUnit, image, deliveryTime, familyId, subcategoryId, reorderPoint, panel, col, row)
    VALUES ('CMH00003', 'CLI-000003', N'Cable unipolar 2.5mm', N'General Cable',
        N'Cable unipolar flexible 2.5mm²',
        N'Cable unipolar flexible H07V-K 2.5mm². Rollo 100m.',
        N'Rollo 100m', 'https://placehold.co/120x120/1e3a5f/ffffff?text=CMH00003', N'7 días',
        @elecId, @subCable, 25, 'A2', 1, 1, 40);

IF NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'CMH00004')
    INSERT INTO Products (cmhReference, customerReference, name, brand, descripcionCorta, descripcionLarga,
        packagingUnit, image, deliveryTime, familyId, subcategoryId, reorderPoint, panel, col, row)
    VALUES ('CMH00004', 'CLI-000004', N'Tornillo allen M6x20', N'Fischer',
        N'Tornillo cabeza allen M6x20 inox',
        N'Tornillo cabeza allen inoxidable A2 M6x20.',
        N'Caja de 200 uds', 'https://placehold.co/120x120/1e3a5f/ffffff?text=CMH00004', N'3 días',
        @tornId, @subTorn, 200, 'A2', 3, 5, 300);

IF NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'CMH00005')
    INSERT INTO Products (cmhReference, customerReference, name, brand, descripcionCorta, descripcionLarga,
        packagingUnit, image, deliveryTime, familyId, subcategoryId, reorderPoint, panel, col, row)
    VALUES ('CMH00005', 'CLI-000005', N'Taco expansivo 10x60', N'Hilti',
        N'Taco expansivo acero 10x60mm',
        N'Taco expansivo de acero para hormigón 10x60mm.',
        N'Caja de 50 uds', 'https://placehold.co/120x120/1e3a5f/ffffff?text=CMH00005', N'5 días',
        @tornId, @subTorn, 50, 'A3', 1, 10, 120);
GO
