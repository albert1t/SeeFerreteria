-- Migracion 013: Importar productos de Copia de Material_Ferreteria.xlsx
-- 692 productos sin ubicacion (panel/col/row = NULL)
-- Imagenes representativas por familia

-- 1. Crear familias que no existen
INSERT IGNORE INTO Families (name) VALUES
  ('Arrandelas Anchas'),
  ('Arrandelas Grower'),
  ('Arrandelas Normales'),
  ('Chaveta'),
  ('Circlips'),
  ('Insertos'),
  ('Pasadores'),
  ('Posicionador'),
  ('Tornillo DIN7991'),
  ('Tornillo DIN912'),
  ('Tuerca Freno'),
  ('Tuerca Hexagonal'),
  ('Tóricas'),
  ('Varilla Roscada');

-- 2. Insertar productos

INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-1-4', 'Pasador cilíndrico DIN 6325', '1x4', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-1-4');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-1-6', 'Pasador cilíndrico DIN 6325', '1x6', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-1-6');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-1-8', 'Pasador cilíndrico DIN 6325', '1x8', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-1-8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-1-10', 'Pasador cilíndrico DIN 6325', '1x10', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-1-10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-1-12', 'Pasador cilíndrico DIN 6325', '1x12', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-1-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-2-6', 'Pasador cilíndrico DIN 6325', '2x6', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-2-6');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-2-8', 'Pasador cilíndrico DIN 6325', '2x8', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-2-8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-2-10', 'Pasador cilíndrico DIN 6325', '2x10', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-2-10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-2-12', 'Pasador cilíndrico DIN 6325', '2x12', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-2-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-2-14', 'Pasador cilíndrico DIN 6325', '2x14', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-2-14');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-2-16', 'Pasador cilíndrico DIN 6325', '2x16', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-2-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-2-18', 'Pasador cilíndrico DIN 6325', '2x18', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-2-18');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-2-20', 'Pasador cilíndrico DIN 6325', '2x20', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-2-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-2-22', 'Pasador cilíndrico DIN 6325', '2x22', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-2-22');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-2-24', 'Pasador cilíndrico DIN 6325', '2x24', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-2-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-2-26', 'Pasador cilíndrico DIN 6325', '2x26', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-2-26');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-2-28', 'Pasador cilíndrico DIN 6325', '2x28', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-2-28');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-2-30', 'Pasador cilíndrico DIN 6325', '2x30', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-2-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-2-32', 'Pasador cilíndrico DIN 6325', '2x32', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-2-32');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-2-36', 'Pasador cilíndrico DIN 6325', '2x36', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-2-36');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-2-40', 'Pasador cilíndrico DIN 6325', '2x40', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-2-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-6', 'Pasador cilíndrico DIN 6325', '3x6', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-6');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-8', 'Pasador cilíndrico DIN 6325', '3x8', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-10', 'Pasador cilíndrico DIN 6325', '3x10', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-12', 'Pasador cilíndrico DIN 6325', '3x12', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-14', 'Pasador cilíndrico DIN 6325', '3x14', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-14');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-16', 'Pasador cilíndrico DIN 6325', '3x16', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-18', 'Pasador cilíndrico DIN 6325', '3x18', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-18');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-20', 'Pasador cilíndrico DIN 6325', '3x20', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-22', 'Pasador cilíndrico DIN 6325', '3x22', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-22');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-24', 'Pasador cilíndrico DIN 6325', '3x24', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-26', 'Pasador cilíndrico DIN 6325', '3x26', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-26');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-28', 'Pasador cilíndrico DIN 6325', '3x28', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-28');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-30', 'Pasador cilíndrico DIN 6325', '3x30', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-32', 'Pasador cilíndrico DIN 6325', '3x32', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-32');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-36', 'Pasador cilíndrico DIN 6325', '3x36', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-36');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-40', 'Pasador cilíndrico DIN 6325', '3x40', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-45', 'Pasador cilíndrico DIN 6325', '3x45', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-50', 'Pasador cilíndrico DIN 6325', '3x50', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-3-60', 'Pasador cilíndrico DIN 6325', '3x60', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-3-60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-6', 'Pasador cilíndrico DIN 6325', '4x6', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-6');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-10', 'Pasador cilíndrico DIN 6325', '4x10', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-12', 'Pasador cilíndrico DIN 6325', '4x12', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-14', 'Pasador cilíndrico DIN 6325', '4x14', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-14');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-16', 'Pasador cilíndrico DIN 6325', '4x16', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-18', 'Pasador cilíndrico DIN 6325', '4x18', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-18');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-20', 'Pasador cilíndrico DIN 6325', '4x20', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-22', 'Pasador cilíndrico DIN 6325', '4x22', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-22');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-24', 'Pasador cilíndrico DIN 6325', '4x24', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-26', 'Pasador cilíndrico DIN 6325', '4x26', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-26');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-28', 'Pasador cilíndrico DIN 6325', '4x28', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-28');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-30', 'Pasador cilíndrico DIN 6325', '4x30', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-32', 'Pasador cilíndrico DIN 6325', '4x32', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-32');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-36', 'Pasador cilíndrico DIN 6325', '4x36', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-36');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-40', 'Pasador cilíndrico DIN 6325', '4x40', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-45', 'Pasador cilíndrico DIN 6325', '4x45', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-50', 'Pasador cilíndrico DIN 6325', '4x50', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-55', 'Pasador cilíndrico DIN 6325', '4x55', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-55');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-4-60', 'Pasador cilíndrico DIN 6325', '4x60', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-4-60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-8', 'Pasador cilíndrico DIN 6325', '5x8', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-10', 'Pasador cilíndrico DIN 6325', '5x10', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-12', 'Pasador cilíndrico DIN 6325', '5x12', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-14', 'Pasador cilíndrico DIN 6325', '5x14', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-14');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-16', 'Pasador cilíndrico DIN 6325', '5x16', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-18', 'Pasador cilíndrico DIN 6325', '5x18', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-18');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-20', 'Pasador cilíndrico DIN 6325', '5x20', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-22', 'Pasador cilíndrico DIN 6325', '5x22', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-22');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-24', 'Pasador cilíndrico DIN 6325', '5x24', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-26', 'Pasador cilíndrico DIN 6325', '5x26', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-26');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-28', 'Pasador cilíndrico DIN 6325', '5x28', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-28');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-30', 'Pasador cilíndrico DIN 6325', '5x30', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-32', 'Pasador cilíndrico DIN 6325', '5x32', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-32');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-36', 'Pasador cilíndrico DIN 6325', '5x36', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-36');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-40', 'Pasador cilíndrico DIN 6325', '5x40', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-45', 'Pasador cilíndrico DIN 6325', '5x45', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-50', 'Pasador cilíndrico DIN 6325', '5x50', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-55', 'Pasador cilíndrico DIN 6325', '5x55', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-55');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-5-60', 'Pasador cilíndrico DIN 6325', '5x60', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-5-60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-10', 'Pasador cilíndrico DIN 6325', '6x10', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-12', 'Pasador cilíndrico DIN 6325', '6x12', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-14', 'Pasador cilíndrico DIN 6325', '6x14', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-14');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-16', 'Pasador cilíndrico DIN 6325', '6x16', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-18', 'Pasador cilíndrico DIN 6325', '6x18', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-18');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-20', 'Pasador cilíndrico DIN 6325', '6x20', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-22', 'Pasador cilíndrico DIN 6325', '6x22', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-22');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-24', 'Pasador cilíndrico DIN 6325', '6x24', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-26', 'Pasador cilíndrico DIN 6325', '6x26', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-26');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-28', 'Pasador cilíndrico DIN 6325', '6x28', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-28');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-30', 'Pasador cilíndrico DIN 6325', '6x30', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-32', 'Pasador cilíndrico DIN 6325', '6x32', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-32');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-36', 'Pasador cilíndrico DIN 6325', '6x36', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-36');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-40', 'Pasador cilíndrico DIN 6325', '6x40', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-45', 'Pasador cilíndrico DIN 6325', '6x45', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-50', 'Pasador cilíndrico DIN 6325', '6x50', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-55', 'Pasador cilíndrico DIN 6325', '6x55', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-55');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-60', 'Pasador cilíndrico DIN 6325', '6x60', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-70', 'Pasador cilíndrico DIN 6325', '6x70', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-70');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-80', 'Pasador cilíndrico DIN 6325', '6x80', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-80');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-90', 'Pasador cilíndrico DIN 6325', '6x90', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-90');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-6-100', 'Pasador cilíndrico DIN 6325', '6x100', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-6-100');

-- 100 productos procesados

INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-14', 'Pasador cilíndrico DIN 6325', '8x14', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-14');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-16', 'Pasador cilíndrico DIN 6325', '8x16', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-18', 'Pasador cilíndrico DIN 6325', '8x18', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-18');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-20', 'Pasador cilíndrico DIN 6325', '8x20', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-22', 'Pasador cilíndrico DIN 6325', '8x22', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-22');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-24', 'Pasador cilíndrico DIN 6325', '8x24', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-24', 'Pasador cilíndrico DIN 6325', '8x24', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-26', 'Pasador cilíndrico DIN 6325', '8x26', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-26');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-28', 'Pasador cilíndrico DIN 6325', '8x28', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-28');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-30', 'Pasador cilíndrico DIN 6325', '8x30', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-32', 'Pasador cilíndrico DIN 6325', '8x32', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-32');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-36', 'Pasador cilíndrico DIN 6325', '8x36', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-36');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-40', 'Pasador cilíndrico DIN 6325', '8x40', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-45', 'Pasador cilíndrico DIN 6325', '8x45', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-50', 'Pasador cilíndrico DIN 6325', '8x50', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-55', 'Pasador cilíndrico DIN 6325', '8x55', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-55');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-60', 'Pasador cilíndrico DIN 6325', '8x60', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-70', 'Pasador cilíndrico DIN 6325', '8x70', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-70');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-80', 'Pasador cilíndrico DIN 6325', '8x80', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-80');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-90', 'Pasador cilíndrico DIN 6325', '8x90', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-90');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-100', 'Pasador cilíndrico DIN 6325', '8x100', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-100');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-8-120', 'Pasador cilíndrico DIN 6325', '8x120', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-8-120');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-10-20', 'Pasador cilíndrico DIN 6325', '10x20', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-10-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-10-30', 'Pasador cilíndrico DIN 6325', '10x30', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-10-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-10-40', 'Pasador cilíndrico DIN 6325', '10x40', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-10-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-12-20', 'Pasador cilíndrico DIN 6325', '12x20', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-12-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-12-24', 'Pasador cilíndrico DIN 6325', '12x24', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-12-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-12-36', 'Pasador cilíndrico DIN 6325', '12x36', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-12-36');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-12-40', 'Pasador cilíndrico DIN 6325', '12x40', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-12-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-12-45', 'Pasador cilíndrico DIN 6325', '12x45', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-12-45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-210-12-50', 'Pasador cilíndrico DIN 6325', '12x50', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-210-12-50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 2,90x1,78', 'Junta tórica NBR70º Shore A', '2,90x1,78', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 2,90x1,78');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 3,68x1,78', 'Junta tórica NBR70º Shore A', '3,68x1,78', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 3,68x1,78');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 4,48x1,78', 'Junta tórica NBR70º Shore A', '4,48x1,78', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 4,48x1,78');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 5,28x1,78', 'Junta tórica NBR70º Shore A', '5,28x1,78', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 5,28x1,78');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 6,07x1,78', 'Junta tórica NBR70º Shore A', '6,07x1,78', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 6,07x1,78');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 7,66x1,78', 'Junta tórica NBR70º Shore A', '7,66x1,78', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 7,66x1,78');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 9,25x1,78', 'Junta tórica NBR70º Shore A', '9,25x1,78', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 9,25x1,78');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 10,82x1,78', 'Junta tórica NBR70º Shore A', '10,82x1,78', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 10,82x1,78');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 12,42x1,78', 'Junta tórica NBR70º Shore A', '12,42x1,78', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 12,42x1,78');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 14,00x1,78', 'Junta tórica NBR70º Shore A', '14,00x1,78', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 14,00x1,78');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 15,60x1,78', 'Junta tórica NBR70º Shore A', '15,60x1,78', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 15,60x1,78');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 17,16x1,78', 'Junta tórica NBR70º Shore A', '17,16x1,78', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 17,16x1,78');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 18,77x1,78', 'Junta tórica NBR70º Shore A', '18,77x1,78', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 18,77x1,78');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 9,19x2,62', 'Junta tórica NBR70º Shore A', '9,19x2,62', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 9,19x2,62');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 10,78x2,62', 'Junta tórica NBR70º Shore A', '10,78x2,62', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 10,78x2,62');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 12,37x2,62', 'Junta tórica NBR70º Shore A', '12,37x2,62', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 12,37x2,62');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 13,95x2,62', 'Junta tórica NBR70º Shore A', '13,95x2,62', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 13,95x2,62');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 15,54x2,62', 'Junta tórica NBR70º Shore A', '15,54x2,62', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 15,54x2,62');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 17,13x2,62', 'Junta tórica NBR70º Shore A', '17,13x2,62', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 17,13x2,62');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 18,72x2,62', 'Junta tórica NBR70º Shore A', '18,72x2,62', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 18,72x2,62');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 20,29x2,62', 'Junta tórica NBR70º Shore A', '20,29x2,62', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 20,29x2,62');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 21,89x2,62', 'Junta tórica NBR70º Shore A', '21,89x2,62', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 21,89x2,62');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 23,47x2,62', 'Junta tórica NBR70º Shore A', '23,47x2,62', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 23,47x2,62');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 18,64x3,53', 'Junta tórica NBR70º Shore A', '18,64x3,53', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 18,64x3,53');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 20,22x3,53', 'Junta tórica NBR70º Shore A', '20,22x3,53', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 20,22x3,53');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 21,82x3,53', 'Junta tórica NBR70º Shore A', '21,82x3,53', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 21,82x3,53');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 23,40x3,53', 'Junta tórica NBR70º Shore A', '23,40x3,53', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 23,40x3,53');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 24,99x3,53', 'Junta tórica NBR70º Shore A', '24,99x3,53', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 24,99x3,53');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 26,58x3,53', 'Junta tórica NBR70º Shore A', '26,58x3,53', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 26,58x3,53');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 28,17x3,53', 'Junta tórica NBR70º Shore A', '28,17x3,53', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 28,17x3,53');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 20,35x1,78', 'Junta tórica NBR70º Shore A', '20,35x1,78', '15', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 20,35x1,78');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 21,95x1,78', 'Junta tórica NBR70º Shore A', '21,95x1,78', '15', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 21,95x1,78');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 25,07x2,62', 'Junta tórica NBR70º Shore A', '25,07x2,62', '15', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 25,07x2,62');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 26,64x2,62', 'Junta tórica NBR70º Shore A', '26,64x2,62', '15', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 26,64x2,62');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 28,25x2,62', 'Junta tórica NBR70º Shore A', '28,25x2,62', '15', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 28,25x2,62');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 29,82x2,62', 'Junta tórica NBR70º Shore A', '29,82x2,62', '15', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 29,82x2,62');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 31,42x2,62', 'Junta tórica NBR70º Shore A', '31,42x2,62', '15', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 31,42x2,62');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 33,00x2,62', 'Junta tórica NBR70º Shore A', '33,00x2,62', '15', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 33,00x2,62');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 34,59x2,62', 'Junta tórica NBR70º Shore A', '34,59x2,62', '15', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 34,59x2,62');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 29,75x3,53', 'Junta tórica NBR70º Shore A', '29,75x3,53', '15', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 29,75x3,53');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 31,34x3,53', 'Junta tórica NBR70º Shore A', '31,34x3,53', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 31,34x3,53');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 32,92x3,53', 'Junta tórica NBR70º Shore A', '32,92x3,53', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 32,92x3,53');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 34,52x3,53', 'Junta tórica NBR70º Shore A', '34,52x3,53', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 34,52x3,53');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 36,10x3,53', 'Junta tórica NBR70º Shore A', '36,10x3,53', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 36,10x3,53');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 37,69x3,53', 'Junta tórica NBR70º Shore A', '37,69x3,53', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 37,69x3,53');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 40,87x3,53', 'Junta tórica NBR70º Shore A', '40,87x3,53', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 40,87x3,53');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 44,04x3,53', 'Junta tórica NBR70º Shore A', '44,04x3,53', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 44,04x3,53');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 47,22x3,53', 'Junta tórica NBR70º Shore A', '47,22x3,53', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 47,22x3,53');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 50,50x3,53', 'Junta tórica NBR70º Shore A', '50,50x3,53', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 50,50x3,53');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 37,47x5,33', 'Junta tórica NBR70º Shore A', '37,47x5,33', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 37,47x5,33');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 40,65x5,33', 'Junta tórica NBR70º Shore A', '40,65x5,33', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 40,65x5,33');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 43,82x5,33', 'Junta tórica NBR70º Shore A', '43,82x5,33', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 43,82x5,33');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 47,00x5,33', 'Junta tórica NBR70º Shore A', '47,00x5,33', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 47,00x5,33');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'E2 - 50,16x5,33', 'Junta tórica NBR70º Shore A', '50,16x5,33', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/O_ring.png/800px-O_ring.png', 1, 0
FROM Families f WHERE f.name = 'Tóricas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'E2 - 50,16x5,33');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-3-8', 'Chaveta DIN 6885A', '3x8', '20', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-3-8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-3-12', 'Chaveta DIN 6885A', '3x12', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-3-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-3-16', 'Chaveta DIN 6885A', '3x16', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-3-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-3-20', 'Chaveta DIN 6885A', '3x20', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-3-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-3-30', 'Chaveta DIN 6885A', '3x30', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-3-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-4-8', 'Chaveta DIN 6885A', '4x8', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-4-8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-4-12', 'Chaveta DIN 6885A', '4x12', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-4-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-4-16', 'Chaveta DIN 6885A', '4x16', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-4-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-4-20', 'Chaveta DIN 6885A', '4x20', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-4-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-4-30', 'Chaveta DIN 6885A', '4x30', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-4-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-5-8', 'Chaveta DIN 6885A', '5x8', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-5-8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-5-12', 'Chaveta DIN 6885A', '5x12', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-5-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-5-16', 'Chaveta DIN 6885A', '5x16', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-5-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-5-20', 'Chaveta DIN 6885A', '5x20', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-5-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-5-32', 'Chaveta DIN 6885A', '5x32', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-5-32');

-- 200 productos procesados

INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-6-8', 'Chaveta DIN 6885A', '6x8', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-6-8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-6-12', 'Chaveta DIN 6885A', '6x12', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-6-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-6-16', 'Chaveta DIN 6885A', '6x16', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-6-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-6-20', 'Chaveta DIN 6885A', '6x20', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-6-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-6-32', 'Chaveta DIN 6885A', '6x32', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-6-32');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-8-12', 'Chaveta DIN 6885A', '8x12', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-8-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-8-16', 'Chaveta DIN 6885A', '8x16', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-8-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-8-20', 'Chaveta DIN 6885A', '8x20', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-8-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-8-30', 'Chaveta DIN 6885A', '8x30', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-8-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '31-970-8-40', 'Chaveta DIN 6885A', '8x40', '5', f.id, 'https://www.norelem.com/media/image/product/82861/lg/woodruff-keys-din-6888.jpg', 1, 0
FROM Families f WHERE f.name = 'Chaveta'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '31-970-8-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-2-10', 'Pasador elástico ISO 8752', '2x10', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-2-10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-2-12', 'Pasador elástico ISO 8752', '2x12', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-2-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-2-14', 'Pasador elástico ISO 8752', '2x14', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-2-14');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-2-16', 'Pasador elástico ISO 8752', '2x16', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-2-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-2-18', 'Pasador elástico ISO 8752', '2x18', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-2-18');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-2-20', 'Pasador elástico ISO 8752', '2x20', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-2-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-2-22', 'Pasador elástico ISO 8752', '2x22', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-2-22');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-2-24', 'Pasador elástico ISO 8752', '2x24', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-2-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-2-26', 'Pasador elástico ISO 8752', '2x26', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-2-26');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-2-28', 'Pasador elástico ISO 8752', '2x28', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-2-28');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-2-30', 'Pasador elástico ISO 8752', '2x30', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-2-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-2-4', 'Pasador elástico ISO 8752', '2x4', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-2-4');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-2-5', 'Pasador elástico ISO 8752', '2x5', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-2-5');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-2-6', 'Pasador elástico ISO 8752', '2x6', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-2-6');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-2-8', 'Pasador elástico ISO 8752', '2x8', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-2-8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-3-10', 'Pasador elástico ISO 8752', '3x10', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-3-10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-3-12', 'Pasador elástico ISO 8752', '3x12', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-3-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-3-14', 'Pasador elástico ISO 8752', '3x14', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-3-14');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-3-16', 'Pasador elástico ISO 8752', '3x16', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-3-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-3-18', 'Pasador elástico ISO 8752', '3x18', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-3-18');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-3-20', 'Pasador elástico ISO 8752', '3x20', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-3-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-3-22', 'Pasador elástico ISO 8752', '3x22', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-3-22');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-3-24', 'Pasador elástico ISO 8752', '3x24', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-3-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-3-26', 'Pasador elástico ISO 8752', '3x26', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-3-26');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-3-28', 'Pasador elástico ISO 8752', '3x28', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-3-28');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-3-30', 'Pasador elástico ISO 8752', '3x30', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-3-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-3-35', 'Pasador elástico ISO 8752', '3x35', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-3-35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-3-40', 'Pasador elástico ISO 8752', '3x40', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-3-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-3-5', 'Pasador elástico ISO 8752', '3x5', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-3-5');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-3-6', 'Pasador elástico ISO 8752', '3x6', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-3-6');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-3-8', 'Pasador elástico ISO 8752', '3x8', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-3-8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-4-10', 'Pasador elástico ISO 8752', '4x10', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-4-10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-4-12', 'Pasador elástico ISO 8752', '4x12', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-4-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-4-14', 'Pasador elástico ISO 8752', '4x14', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-4-14');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-4-16', 'Pasador elástico ISO 8752', '4x16', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-4-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-4-18', 'Pasador elástico ISO 8752', '4x18', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-4-18');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-4-20', 'Pasador elástico ISO 8752', '4x20', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-4-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-4-22', 'Pasador elástico ISO 8752', '4x22', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-4-22');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-4-24', 'Pasador elástico ISO 8752', '4x24', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-4-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-4-26', 'Pasador elástico ISO 8752', '4x26', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-4-26');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-4-28', 'Pasador elástico ISO 8752', '4x28', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-4-28');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-4-30', 'Pasador elástico ISO 8752', '4x30', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-4-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-4-35', 'Pasador elástico ISO 8752', '4x35', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-4-35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-4-40', 'Pasador elástico ISO 8752', '4x40', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-4-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-4-45', 'Pasador elástico ISO 8752', '4x45', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-4-45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-4-50', 'Pasador elástico ISO 8752', '4x50', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-4-50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-4-8', 'Pasador elástico ISO 8752', '4x8', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-4-8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-5-10', 'Pasador elástico ISO 8752', '5x10', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-5-10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-5-12', 'Pasador elástico ISO 8752', '5x12', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-5-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-5-14', 'Pasador elástico ISO 8752', '5x14', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-5-14');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-5-16', 'Pasador elástico ISO 8752', '5x16', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-5-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-5-18', 'Pasador elástico ISO 8752', '5x18', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-5-18');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-5-20', 'Pasador elástico ISO 8752', '5x20', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-5-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-5-22', 'Pasador elástico ISO 8752', '5x22', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-5-22');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-5-24', 'Pasador elástico ISO 8752', '5x24', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-5-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-5-26', 'Pasador elástico ISO 8752', '5x26', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-5-26');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-5-28', 'Pasador elástico ISO 8752', '5x28', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-5-28');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-5-30', 'Pasador elástico ISO 8752', '5x30', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-5-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-5-35', 'Pasador elástico ISO 8752', '5x35', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-5-35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-5-40', 'Pasador elástico ISO 8752', '5x40', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-5-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-5-45', 'Pasador elástico ISO 8752', '5x45', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-5-45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-5-50', 'Pasador elástico ISO 8752', '5x50', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-5-50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-5-55', 'Pasador elástico ISO 8752', '5x55', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-5-55');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-5-60', 'Pasador elástico ISO 8752', '5x60', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-5-60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-10', 'Pasador elástico ISO 8752', '6x10', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-100', 'Pasador elástico ISO 8752', '6x100', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-100');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-12', 'Pasador elástico ISO 8752', '6x12', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-14', 'Pasador elástico ISO 8752', '6x14', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-14');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-16', 'Pasador elástico ISO 8752', '6x16', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-18', 'Pasador elástico ISO 8752', '6x18', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-18');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-20', 'Pasador elástico ISO 8752', '6x20', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-22', 'Pasador elástico ISO 8752', '6x22', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-22');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-24', 'Pasador elástico ISO 8752', '6x24', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-26', 'Pasador elástico ISO 8752', '6x26', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-26');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-28', 'Pasador elástico ISO 8752', '6x28', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-28');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-30', 'Pasador elástico ISO 8752', '6x30', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-35', 'Pasador elástico ISO 8752', '6x35', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-40', 'Pasador elástico ISO 8752', '6x40', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-45', 'Pasador elástico ISO 8752', '6x45', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-50', 'Pasador elástico ISO 8752', '6x50', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-55', 'Pasador elástico ISO 8752', '6x55', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-55');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-60', 'Pasador elástico ISO 8752', '6x60', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-65', 'Pasador elástico ISO 8752', '6x65', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-65');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-70', 'Pasador elástico ISO 8752', '6x70', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-70');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-6-75', 'Pasador elástico ISO 8752', '6x75', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-6-75');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-100', 'Pasador elástico ISO 8752', '8x100', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-100');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-16', 'Pasador elástico ISO 8752', '8x16', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-18', 'Pasador elástico ISO 8752', '8x18', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-18');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-20', 'Pasador elástico ISO 8752', '8x20', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-22', 'Pasador elástico ISO 8752', '8x22', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-22');

-- 300 productos procesados

INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-24', 'Pasador elástico ISO 8752', '8x24', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-26', 'Pasador elástico ISO 8752', '8x26', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-26');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-28', 'Pasador elástico ISO 8752', '8x28', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-28');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-30', 'Pasador elástico ISO 8752', '8x30', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-35', 'Pasador elástico ISO 8752', '8x35', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-40', 'Pasador elástico ISO 8752', '8x40', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-45', 'Pasador elástico ISO 8752', '8x45', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-50', 'Pasador elástico ISO 8752', '8x50', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-60', 'Pasador elástico ISO 8752', '8x60', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-65', 'Pasador elástico ISO 8752', '8x65', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-65');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-70', 'Pasador elástico ISO 8752', '8x70', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-70');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-75', 'Pasador elástico ISO 8752', '8x75', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-75');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-80', 'Pasador elástico ISO 8752', '8x80', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-80');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-8-90', 'Pasador elástico ISO 8752', '8x90', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-8-90');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-10-20', 'Pasador elástico ISO 8752', '10x20', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-10-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-10-26', 'Pasador elástico ISO 8752', '10x26', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-10-26');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-10-30', 'Pasador elástico ISO 8752', '10x30', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-10-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-10-35', 'Pasador elástico ISO 8752', '10x35', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-10-35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-10-40', 'Pasador elástico ISO 8752', '10x40', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-10-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-10-45', 'Pasador elástico ISO 8752', '10x45', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-10-45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-10-50', 'Pasador elástico ISO 8752', '10x50', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-10-50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-12-24', 'Pasador elástico ISO 8752', '12x24', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-12-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-12-45', 'Pasador elástico ISO 8752', '12x45', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-12-45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-12-50', 'Pasador elástico ISO 8752', '12x50', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-12-50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-12-55', 'Pasador elástico ISO 8752', '12x55', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-12-55');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-12-60', 'Pasador elástico ISO 8752', '12x60', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-12-60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-12-65', 'Pasador elástico ISO 8752', '12x65', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-12-65');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-12-70', 'Pasador elástico ISO 8752', '12x70', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-12-70');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-12-75', 'Pasador elástico ISO 8752', '12x75', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-12-75');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-270-12-80', 'Pasador elástico ISO 8752', '12x80', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-270-12-80');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-4-10', 'Pasador extraible DIN 7979', '4x10', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-4-10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-4-12', 'Pasador extraible DIN 7979', '4x12', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-4-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-4-14', 'Pasador extraible DIN 7979', '4x14', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-4-14');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-4-16', 'Pasador extraible DIN 7979', '4x16', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-4-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-4-20', 'Pasador extraible DIN 7979', '4x20', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-4-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-4-24', 'Pasador extraible DIN 7979', '4x24', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-4-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-4-30', 'Pasador extraible DIN 7979', '4x30', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-4-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-4-36', 'Pasador extraible DIN 7979', '4x36', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-4-36');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-4-40', 'Pasador extraible DIN 7979', '4x40', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-4-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-5-10', 'Pasador extraible DIN 7979', '5x10', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-5-10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-5-12', 'Pasador extraible DIN 7979', '5x12', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-5-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-5-16', 'Pasador extraible DIN 7979', '5x16', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-5-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-5-18', 'Pasador extraible DIN 7979', '5x18', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-5-18');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-5-20', 'Pasador extraible DIN 7979', '5x20', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-5-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-5-24', 'Pasador extraible DIN 7979', '5x24', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-5-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-5-28', 'Pasador extraible DIN 7979', '5x28', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-5-28');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-5-30', 'Pasador extraible DIN 7979', '5x30', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-5-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-5-32', 'Pasador extraible DIN 7979', '5x32', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-5-32');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-5-36', 'Pasador extraible DIN 7979', '5x36', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-5-36');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-5-40', 'Pasador extraible DIN 7979', '5x40', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-5-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-5-45', 'Pasador extraible DIN 7979', '5x45', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-5-45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-5-45', 'Pasador extraible DIN 7979', '5x45', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-5-45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-5-50', 'Pasador extraible DIN 7979', '5x50', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-5-50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-6-12', 'Pasador extraible DIN 7979', '6x12', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-6-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-6-14', 'Pasador extraible DIN 7979', '6x14', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-6-14');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-6-16', 'Pasador extraible DIN 7979', '6x16', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-6-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-6-18', 'Pasador extraible DIN 7979', '6x18', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-6-18');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-6-20', 'Pasador extraible DIN 7979', '6x20', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-6-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-6-24', 'Pasador extraible DIN 7979', '6x24', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-6-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-6-28', 'Pasador extraible DIN 7979', '6x28', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-6-28');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-6-30', 'Pasador extraible DIN 7979', '6x30', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-6-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-6-32', 'Pasador extraible DIN 7979', '6x32', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-6-32');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-6-36', 'Pasador extraible DIN 7979', '6x36', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-6-36');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-6-40', 'Pasador extraible DIN 7979', '6x40', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-6-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-6-45', 'Pasador extraible DIN 7979', '6x45', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-6-45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-6-50', 'Pasador extraible DIN 7979', '6x50', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-6-50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-6-55', 'Pasador extraible DIN 7979', '6x55', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-6-55');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-6-60', 'Pasador extraible DIN 7979', '6x60', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-6-60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-8-100', 'Pasador extraible DIN 7979', '8x100', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-8-100');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-8-16', 'Pasador extraible DIN 7979', '8x16', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-8-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-8-20', 'Pasador extraible DIN 7979', '8x20', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-8-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-8-24', 'Pasador extraible DIN 7979', '8x24', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-8-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-8-28', 'Pasador extraible DIN 7979', '8x28', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-8-28');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-8-30', 'Pasador extraible DIN 7979', '8x30', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-8-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-8-32', 'Pasador extraible DIN 7979', '8x32', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-8-32');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-8-36', 'Pasador extraible DIN 7979', '8x36', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-8-36');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-8-40', 'Pasador extraible DIN 7979', '8x40', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-8-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-8-45', 'Pasador extraible DIN 7979', '8x45', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-8-45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-8-50', 'Pasador extraible DIN 7979', '8x50', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-8-50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-8-55', 'Pasador extraible DIN 7979', '8x55', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-8-55');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-8-60', 'Pasador extraible DIN 7979', '8x60', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-8-60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-8-70', 'Pasador extraible DIN 7979', '8x70', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-8-70');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-8-80', 'Pasador extraible DIN 7979', '8x80', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-8-80');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-230-8-90', 'Pasador extraible DIN 7979', '8x90', '10', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Pasadores'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-230-8-90');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-011-3', 'Tornillo de presión con bola', 'M3', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Posicionador'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-011-3');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-011-4', 'Tornillo de presión con bola', 'M4', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Posicionador'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-011-4');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-011-5', 'Tornillo de presión con bola', 'M5', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Posicionador'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-011-5');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-011-6', 'Tornillo de presión con bola', 'M6', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Posicionador'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-011-6');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-011-8', 'Tornillo de presión con bola', 'M8', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Posicionador'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-011-8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-011-10', 'Tornillo de presión con bola', 'M10', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Posicionador'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-011-10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-011-12', 'Tornillo de presión con bola', 'M12', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Posicionador'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-011-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-012-4', 'Tornillo de presión con tetón', 'M4', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Posicionador'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-012-4');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-012-5', 'Tornillo de presión con tetón', 'M5', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Posicionador'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-012-5');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-012-6', 'Tornillo de presión con tetón', 'M6', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Posicionador'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-012-6');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-012-8', 'Tornillo de presión con tetón', 'M8', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Posicionador'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-012-8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-012-10', 'Tornillo de presión con tetón', 'M10', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Posicionador'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-012-10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '32-012-12', 'Tornillo de presión con tetón', 'M12', '20', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steel-Dowel-Pins.jpg/800px-Steel-Dowel-Pins.jpg', 1, 0
FROM Families f WHERE f.name = 'Posicionador'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '32-012-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '437003', 'Varilla roscada 1 metro DIN976 4.8', 'M3', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/ISO_metric_thread_M20.JPG/800px-ISO_metric_thread_M20.JPG', 1, 0
FROM Families f WHERE f.name = 'Varilla Roscada'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '437003');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '439414', 'Varilla roscada 1 metro DIN976 8.8 Cincado', 'M4', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/ISO_metric_thread_M20.JPG/800px-ISO_metric_thread_M20.JPG', 1, 0
FROM Families f WHERE f.name = 'Varilla Roscada'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '439414');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '439415', 'Varilla roscada 1 metro DIN976 8.8 Cincado', 'M5', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/ISO_metric_thread_M20.JPG/800px-ISO_metric_thread_M20.JPG', 1, 0
FROM Families f WHERE f.name = 'Varilla Roscada'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '439415');

-- 400 productos procesados

INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '439416', 'Varilla roscada 1 metro DIN976 8.8 Cincado', 'M6', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/ISO_metric_thread_M20.JPG/800px-ISO_metric_thread_M20.JPG', 1, 0
FROM Families f WHERE f.name = 'Varilla Roscada'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '439416');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '439418', 'Varilla roscada 1 metro DIN976 8.8 Cincado', 'M8', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/ISO_metric_thread_M20.JPG/800px-ISO_metric_thread_M20.JPG', 1, 0
FROM Families f WHERE f.name = 'Varilla Roscada'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '439418');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '4394112', 'Varilla roscada 1 metro DIN976 8.8 Cincado', 'M12', '5', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/ISO_metric_thread_M20.JPG/800px-ISO_metric_thread_M20.JPG', 1, 0
FROM Families f WHERE f.name = 'Varilla Roscada'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '4394112');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-5', 'Circlips Exterior DIN 471', '5', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-5');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-6', 'Circlips Exterior DIN 471', '6', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-6');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-7', 'Circlips Exterior DIN 471', '7', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-7');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-8', 'Circlips Exterior DIN 471', '8', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-9', 'Circlips Exterior DIN 471', '9', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-9');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-10', 'Circlips Exterior DIN 471', '10', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-11', 'Circlips Exterior DIN 471', '11', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-11');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-12', 'Circlips Exterior DIN 471', '12', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-13', 'Circlips Exterior DIN 471', '13', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-13');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-14', 'Circlips Exterior DIN 471', '14', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-14');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-15', 'Circlips Exterior DIN 471', '15', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-15');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-16', 'Circlips Exterior DIN 471', '16', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-17', 'Circlips Exterior DIN 471', '17', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-17');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-18', 'Circlips Exterior DIN 471', '18', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-18');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-19', 'Circlips Exterior DIN 471', '19', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-19');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-20', 'Circlips Exterior DIN 471', '20', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-21', 'Circlips Exterior DIN 471', '21', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-21');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-22', 'Circlips Exterior DIN 471', '22', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-22');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-23', 'Circlips Exterior DIN 471', '23', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-23');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-24', 'Circlips Exterior DIN 471', '24', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-25', 'Circlips Exterior DIN 471', '25', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-25');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-26', 'Circlips Exterior DIN 471', '26', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-26');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-27', 'Circlips Exterior DIN 471', '27', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-27');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-28', 'Circlips Exterior DIN 471', '28', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-28');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-29', 'Circlips Exterior DIN 471', '29', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-29');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-30', 'Circlips Exterior DIN 471', '30', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-31', 'Circlips Exterior DIN 471', '31', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-31');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-32', 'Circlips Exterior DIN 471', '32', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-32');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-33', 'Circlips Exterior DIN 471', '33', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-33');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-34', 'Circlips Exterior DIN 471', '34', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-34');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-35', 'Circlips Exterior DIN 471', '35', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-36', 'Circlips Exterior DIN 471', '36', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-36');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-37', 'Circlips Exterior DIN 471', '37', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-37');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-38', 'Circlips Exterior DIN 471', '38', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-38');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-04-39', 'Circlips Exterior DIN 471', '39', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-04-39');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-8', 'Circlips Interior DIN 472', '8', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-9', 'Circlips Interior DIN 472', '9', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-9');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-10', 'Circlips Interior DIN 472', '10', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-11', 'Circlips Interior DIN 472', '11', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-11');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-12', 'Circlips Interior DIN 472', '12', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-13', 'Circlips Interior DIN 472', '13', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-13');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-14', 'Circlips Interior DIN 472', '14', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-14');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-15', 'Circlips Interior DIN 472', '15', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-15');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-16', 'Circlips Interior DIN 472', '16', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-17', 'Circlips Interior DIN 472', '17', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-17');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-18', 'Circlips Interior DIN 472', '18', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-18');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-19', 'Circlips Interior DIN 472', '19', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-19');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-20', 'Circlips Interior DIN 472', '20', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-21', 'Circlips Interior DIN 472', '21', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-21');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-22', 'Circlips Interior DIN 472', '22', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-22');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-23', 'Circlips Interior DIN 472', '23', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-23');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-24', 'Circlips Interior DIN 472', '24', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-24');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-25', 'Circlips Interior DIN 472', '25', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-25');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-26', 'Circlips Interior DIN 472', '26', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-26');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-27', 'Circlips Interior DIN 472', '27', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-27');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-28', 'Circlips Interior DIN 472', '28', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-28');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-29', 'Circlips Interior DIN 472', '29', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-29');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-30', 'Circlips Interior DIN 472', '30', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-31', 'Circlips Interior DIN 472', '31', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-31');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-32', 'Circlips Interior DIN 472', '32', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-32');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-33', 'Circlips Interior DIN 472', '33', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-33');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-35', 'Circlips Interior DIN 472', '35', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-36', 'Circlips Interior DIN 472', '36', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-36');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-37', 'Circlips Interior DIN 472', '37', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-37');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-38', 'Circlips Interior DIN 472', '38', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-38');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT 'F3-05-40', 'Circlips Interior DIN 472', '40', '10', f.id, 'https://www.spaldingfasteners.co.uk/pub/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/x/External_Circlip__40535.1725730329.JPG', 1, 0
FROM Families f WHERE f.name = 'Circlips'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = 'F3-05-40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '796803', 'Inserto autorroscante Cincado', 'M3', '200', f.id, 'https://americas.bossard.com/media/image/product/8776/lg/Screwlock__14137.1785084881.png', 1, 0
FROM Families f WHERE f.name = 'Insertos'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '796803');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '796804', 'Inserto autorroscante Cincado', 'M4', '200', f.id, 'https://americas.bossard.com/media/image/product/8776/lg/Screwlock__14137.1785084881.png', 1, 0
FROM Families f WHERE f.name = 'Insertos'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '796804');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '796805', 'Inserto autorroscante Cincado', 'M5', '100', f.id, 'https://americas.bossard.com/media/image/product/8776/lg/Screwlock__14137.1785084881.png', 1, 0
FROM Families f WHERE f.name = 'Insertos'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '796805');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '796806B9', 'Inserto autorroscante Cincado', 'M6', '100', f.id, 'https://americas.bossard.com/media/image/product/8776/lg/Screwlock__14137.1785084881.png', 1, 0
FROM Families f WHERE f.name = 'Insertos'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '796806B9');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '796808', 'Inserto autorroscante Cincado', 'M8', '100', f.id, 'https://americas.bossard.com/media/image/product/8776/lg/Screwlock__14137.1785084881.png', 1, 0
FROM Families f WHERE f.name = 'Insertos'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '796808');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232013X6', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '3x6', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232013X6');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232013X8', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '3x8', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232013X8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232013X10', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '3x10', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232013X10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232013X12', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '3x12', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232013X12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232013X16', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '3x16', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232013X16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232013X20', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '3x20', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232013X20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232013X25', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '3x25', '200', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232013X25');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232013X30', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '3x30', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232013X30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232013X35', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '3x35', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232013X35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232013X40', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '3x40', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232013X40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232014X6', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '4x6', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232014X6');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232014X8', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '4x8', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232014X8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232014X10', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '4x10', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232014X10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232014X12', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '4x12', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232014X12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232014X16', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '4x16', '200', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232014X16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232014X20', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '4x20', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232014X20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232014X25', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '4x25', '200', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232014X25');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232014X30', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '4x30', '200', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232014X30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232014X35', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '4x35', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232014X35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232014X40', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '4x40', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232014X40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232014X45', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '4x45', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232014X45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232014X50', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '4x50', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232014X50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232014X60', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '4x60', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232014X60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320014X70', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '14x70', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320014X70');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232015X6', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '5x6', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232015X6');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232015X8', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '5x8', '200', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232015X8');

-- 500 productos procesados

INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232015X10', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '5x10', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232015X10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232015X12', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '5x12', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232015X12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232015X14', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '5x14', '200', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232015X14');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232015X16', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '5x16', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232015X16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232015X18', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '5x18', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232015X18');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232015X20', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '5x20', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232015X20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232015X25', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '5x25', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232015X25');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232015X30', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '5x30', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232015X30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232015X35', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '5x35', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232015X35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232015X40', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '5x40', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232015X40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232015X50', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '5x50', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232015X50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232015X55', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '5x55', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232015X55');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232015X60', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '5x60', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232015X60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232015X65', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '5x65', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232015X65');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232015X70', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '5x70', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232015X70');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232015X80', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '5x80', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232015X80');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X10', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x10', '200', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X12', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x12', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X14', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x14', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X14');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X16', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x16', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X20', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x20', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X25', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x25', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X25');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X30', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x30', '100', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X35', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x35', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X40', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x40', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X45', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x45', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X50', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x50', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X55', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x55', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X55');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X60', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x60', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X65', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x65', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X65');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X70', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x70', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X70');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X80', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x80', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X80');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X90', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x90', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X90');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X100', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x100', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X100');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X110', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x110', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X110');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232016X120', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '6x120', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232016X120');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X10', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x10', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X12', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x12', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X16', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x16', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X20', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x20', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X25', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x25', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X25');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X30', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x30', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X35', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x35', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X40', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x40', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X45', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x45', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X50', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x50', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X55', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x55', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X55');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X60', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x60', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X65', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x65', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X65');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X70', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x70', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X70');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X75', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x75', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X75');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X80', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x80', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X80');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X85', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x85', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X85');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X90', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x90', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X90');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X100', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x100', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X100');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X110', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x110', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X110');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '232018X120', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '8x120', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '232018X120');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X12', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x12', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X16', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x16', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X20', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x20', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X25', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x25', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X25');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X30', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x30', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X35', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x35', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X40', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x40', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X45', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x45', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X50', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x50', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X55', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x55', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X55');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X60', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x60', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X65', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x65', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X65');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X70', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x70', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X70');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X75', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x75', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X75');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X80', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x80', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X80');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X90', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x90', '10', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X90');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X100', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x100', '10', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X100');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X110', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x110', '10', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X110');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X120', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x120', '10', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X120');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X130', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x130', '10', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X130');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X140', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x140', '10', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X140');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320110X150', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '10x150', '10', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320110X150');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320112X20', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '12x20', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320112X20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320112X25', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '12x25', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320112X25');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320112X30', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '12x30', '40', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320112X30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320112X35', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '12x35', '60', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320112X35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320112X40', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '12x40', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320112X40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320112X45', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '12x45', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320112X45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320112X50', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '12x50', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320112X50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320112X55', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '12x55', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320112X55');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320112X60', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '12x60', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320112X60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320112X70', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '12x70', '20', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320112X70');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320112X80', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '12x80', '10', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320112X80');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2320112X90', 'Tornillo cabeza cilindrica Allen ISO4762/DIN912 8.8 Cincado', '12x90', '10', f.id, 'https://www.boenfasteners.com/images/a1431/t1-5921.webp', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN912'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2320112X90');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243013X6', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '3x6', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243013X6');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243013X8', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '3x8', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243013X8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243013X10', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '3x10', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243013X10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243013X12', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '3x12', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243013X12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243013X16', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '3x16', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243013X16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243014X10', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '4x10', '1', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243014X10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243014X12', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '4x12', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243014X12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243014X16', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '4x16', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243014X16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243014X20', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '4x20', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243014X20');

-- 600 productos procesados

INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243014X25', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '4x25', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243014X25');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243014X30', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '4x30', '1', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243014X30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243014X40', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '4x40', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243014X40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243015X8', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '5x8', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243015X8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243015X10', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '5x10', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243015X10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243015X12', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '5x12', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243015X12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243015X12', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '5x12', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243015X12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243015X16', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '5x16', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243015X16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243015X20', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '5x20', '1', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243015X20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243015X25', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '5x25', '1', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243015X25');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243015X30', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '5x30', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243015X30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243015X35', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '5x35', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243015X35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243015X40', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '5x40', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243015X40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243015X50', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '5x50', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243015X50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243016X10', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '6x10', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243016X10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243016X12', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '6x12', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243016X12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243016X16', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '6x16', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243016X16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243016X20', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '6x20', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243016X20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243016X25', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '6x25', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243016X25');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243016X30', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '6x30', '1', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243016X30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243016X35', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '6x35', '500', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243016X35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243016X40', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '6x40', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243016X40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243016X45', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '6x45', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243016X45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243016X50', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '6x50', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243016X50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243016X60', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '6x60', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243016X60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243016X70', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '6x70', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243016X70');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243018X12', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '8x12', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243018X12');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243018X16', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '8x16', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243018X16');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243018X20', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '8x20', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243018X20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243018X30', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '8x30', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243018X30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243018X35', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '8x35', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243018X35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243018X40', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '8x40', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243018X40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243018X45', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '8x45', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243018X45');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243018X50', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '8x50', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243018X50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243018X60', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '8x60', '100', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243018X60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243008X70', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '8x70', '100', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243008X70');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '243008X80', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '8x80', '100', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '243008X80');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2430010X20', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '10x20', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2430010X20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2430110X25', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '10x25', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2430110X25');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2430110X30', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '10x30', '200', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2430110X30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2430110X35', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '10x35', '100', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2430110X35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2430110X40', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '10x40', '100', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2430110X40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2430110X50', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '10x50', '100', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2430110X50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2430110X60', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '10x60', '125', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2430110X60');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2430112X20', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '12x20', '100', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2430112X20');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2430112X25', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '12x25', '100', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2430112X25');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2430112X30', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '12x30', '100', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2430112X30');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2430112X35', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '12x35', '100', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2430112X35');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2430112X40', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '12x40', '100', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2430112X40');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2430112X50', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '12x50', '100', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2430112X50');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2430112X70', 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado', '12x70', '50', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/30465/348125/00_SF6_BLKSS_1__11438.1776017724.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tornillo DIN7991'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2430112X70');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '702013', 'Arrandela Plana Normal ISO7089 200HV Cincado', '3', '1', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Plain_washer1.jpg/800px-Plain_washer1.jpg', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Normales'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '702013');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '702014', 'Arrandela Plana Normal ISO7089 200HV Cincado', '4', '2', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Plain_washer1.jpg/800px-Plain_washer1.jpg', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Normales'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '702014');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '702015', 'Arrandela Plana Normal ISO7089 200HV Cincado', '5', '1', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Plain_washer1.jpg/800px-Plain_washer1.jpg', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Normales'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '702015');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '702016', 'Arrandela Plana Normal ISO7089 200HV Cincado', '6', '2', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Plain_washer1.jpg/800px-Plain_washer1.jpg', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Normales'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '702016');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '702018', 'Arrandela Plana Normal ISO7089 200HV Cincado', '8', '1', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Plain_washer1.jpg/800px-Plain_washer1.jpg', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Normales'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '702018');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '7020110', 'Arrandela Plana Normal ISO7089 200HV Cincado', '10', '1', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Plain_washer1.jpg/800px-Plain_washer1.jpg', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Normales'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '7020110');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '7020112', 'Arrandela Plana Normal ISO7089 200HV Cincado', '12', '1', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Plain_washer1.jpg/800px-Plain_washer1.jpg', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Normales'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '7020112');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '702713', 'Arrandela Plana Ancha ISO7093 200HV Cincado', '3', '1', f.id, 'https://monsterbolts.com/cdn/shop/products/M8_Fender_Ind_1024x.JPG?v=1756748798', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Anchas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '702713');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '702714', 'Arrandela Plana Ancha ISO7093 200HV Cincado', '4', '1', f.id, 'https://monsterbolts.com/cdn/shop/products/M8_Fender_Ind_1024x.JPG?v=1756748798', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Anchas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '702714');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '702715', 'Arrandela Plana Ancha ISO7093 200HV Cincado', '5', '1', f.id, 'https://monsterbolts.com/cdn/shop/products/M8_Fender_Ind_1024x.JPG?v=1756748798', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Anchas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '702715');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '702716', 'Arrandela Plana Ancha ISO7093 200HV Cincado', '6', '1', f.id, 'https://monsterbolts.com/cdn/shop/products/M8_Fender_Ind_1024x.JPG?v=1756748798', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Anchas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '702716');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '702718', 'Arrandela Plana Ancha ISO7093 200HV Cincado', '8', '1', f.id, 'https://monsterbolts.com/cdn/shop/products/M8_Fender_Ind_1024x.JPG?v=1756748798', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Anchas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '702718');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '7027110', 'Arrandela Plana Ancha ISO7093 200HV Cincado', '10', '1', f.id, 'https://monsterbolts.com/cdn/shop/products/M8_Fender_Ind_1024x.JPG?v=1756748798', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Anchas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '7027110');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '7027112', 'Arrandela Plana Ancha ISO7093 200HV Cincado', '12', '1', f.id, 'https://monsterbolts.com/cdn/shop/products/M8_Fender_Ind_1024x.JPG?v=1756748798', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Anchas'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '7027112');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '220112', 'Tuerca Hexagonal ISO4032.8 Cincado', '2', '1', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/23999/348696/00_NR_Z_1__14622.1776020285.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tuerca Hexagonal'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '220112');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '220112.5', 'Tuerca Hexagonal ISO4032.8 Cincado', '45414', '1', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/23999/348696/00_NR_Z_1__14622.1776020285.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tuerca Hexagonal'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '220112.5');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '220113', 'Tuerca Hexagonal ISO4032.8 Cincado', '3', '1', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/23999/348696/00_NR_Z_1__14622.1776020285.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tuerca Hexagonal'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '220113');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '220114', 'Tuerca Hexagonal ISO4032.8 Cincado', '4', '1', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/23999/348696/00_NR_Z_1__14622.1776020285.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tuerca Hexagonal'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '220114');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '220115', 'Tuerca Hexagonal ISO4032.8 Cincado', '5', '1', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/23999/348696/00_NR_Z_1__14622.1776020285.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tuerca Hexagonal'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '220115');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '220116', 'Tuerca Hexagonal ISO4032.8 Cincado', '6', '1', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/23999/348696/00_NR_Z_1__14622.1776020285.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tuerca Hexagonal'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '220116');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '220117', 'Tuerca Hexagonal ISO4032.8 Cincado', '7', '1', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/23999/348696/00_NR_Z_1__14622.1776020285.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tuerca Hexagonal'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '220117');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '220118', 'Tuerca Hexagonal ISO4032.8 Cincado', '8', '1', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/23999/348696/00_NR_Z_1__14622.1776020285.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tuerca Hexagonal'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '220118');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2201110', 'Tuerca Hexagonal ISO4032.8 Cincado', '10', '20', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/23999/348696/00_NR_Z_1__14622.1776020285.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tuerca Hexagonal'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2201110');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '2201112', 'Tuerca Hexagonal ISO4032.8 Cincado', '12', '100', f.id, 'https://cdn11.bigcommerce.com/s-ksn435zixx/images/stencil/500x659/products/23999/348696/00_NR_Z_1__14622.1776020285.png?c=1', 1, 0
FROM Families f WHERE f.name = 'Tuerca Hexagonal'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '2201112');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '438012.5', 'Tuerca Freno DIN985 Cincado', '45414', '1', f.id, 'https://monsterbolts.com/cdn/shop/products/Zn_DIN985_Cl8_M10_Banner_1024x.jpg?v=1756748886', 1, 0
FROM Families f WHERE f.name = 'Tuerca Freno'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '438012.5');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '438013', 'Tuerca Freno DIN985 Cincado', '3', '1', f.id, 'https://monsterbolts.com/cdn/shop/products/Zn_DIN985_Cl8_M10_Banner_1024x.jpg?v=1756748886', 1, 0
FROM Families f WHERE f.name = 'Tuerca Freno'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '438013');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '438014', 'Tuerca Freno DIN985 Cincado', '4', '1', f.id, 'https://monsterbolts.com/cdn/shop/products/Zn_DIN985_Cl8_M10_Banner_1024x.jpg?v=1756748886', 1, 0
FROM Families f WHERE f.name = 'Tuerca Freno'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '438014');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '438015', 'Tuerca Freno DIN985 Cincado', '5', '1', f.id, 'https://monsterbolts.com/cdn/shop/products/Zn_DIN985_Cl8_M10_Banner_1024x.jpg?v=1756748886', 1, 0
FROM Families f WHERE f.name = 'Tuerca Freno'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '438015');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '438016', 'Tuerca Freno DIN985 Cincado', '6', '2', f.id, 'https://monsterbolts.com/cdn/shop/products/Zn_DIN985_Cl8_M10_Banner_1024x.jpg?v=1756748886', 1, 0
FROM Families f WHERE f.name = 'Tuerca Freno'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '438016');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '438017', 'Tuerca Freno DIN985 Cincado', '7', '1', f.id, 'https://monsterbolts.com/cdn/shop/products/Zn_DIN985_Cl8_M10_Banner_1024x.jpg?v=1756748886', 1, 0
FROM Families f WHERE f.name = 'Tuerca Freno'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '438017');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '438018', 'Tuerca Freno DIN985 Cincado', '8', '1', f.id, 'https://monsterbolts.com/cdn/shop/products/Zn_DIN985_Cl8_M10_Banner_1024x.jpg?v=1756748886', 1, 0
FROM Families f WHERE f.name = 'Tuerca Freno'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '438018');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '4380110', 'Tuerca Freno DIN985 Cincado', '10', '1', f.id, 'https://monsterbolts.com/cdn/shop/products/Zn_DIN985_Cl8_M10_Banner_1024x.jpg?v=1756748886', 1, 0
FROM Families f WHERE f.name = 'Tuerca Freno'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '4380110');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '4380112', 'Tuerca Freno DIN985 Cincado', '12', '1', f.id, 'https://monsterbolts.com/cdn/shop/products/Zn_DIN985_Cl8_M10_Banner_1024x.jpg?v=1756748886', 1, 0
FROM Families f WHERE f.name = 'Tuerca Freno'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '4380112');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '71001W3', 'Arrandela GROWER W DIN127A Cincado', 'W3', '200', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Wave_washer_22mm-43mm_2016-03-03.jpg/800px-Wave_washer_22mm-43mm_2016-03-03.jpg', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Grower'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '71001W3');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '71001W4', 'Arrandela GROWER W DIN127A Cincado', 'W4', '2', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Wave_washer_22mm-43mm_2016-03-03.jpg/800px-Wave_washer_22mm-43mm_2016-03-03.jpg', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Grower'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '71001W4');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '71001W5', 'Arrandela GROWER W DIN127A Cincado', 'W5', '200', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Wave_washer_22mm-43mm_2016-03-03.jpg/800px-Wave_washer_22mm-43mm_2016-03-03.jpg', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Grower'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '71001W5');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '71001W6', 'Arrandela GROWER W DIN127A Cincado', 'W6', '100', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Wave_washer_22mm-43mm_2016-03-03.jpg/800px-Wave_washer_22mm-43mm_2016-03-03.jpg', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Grower'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '71001W6');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '71001W7', 'Arrandela GROWER W DIN127A Cincado', 'W7', '1', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Wave_washer_22mm-43mm_2016-03-03.jpg/800px-Wave_washer_22mm-43mm_2016-03-03.jpg', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Grower'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '71001W7');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '71001W8', 'Arrandela GROWER W DIN127A Cincado', 'W8', '100', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Wave_washer_22mm-43mm_2016-03-03.jpg/800px-Wave_washer_22mm-43mm_2016-03-03.jpg', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Grower'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '71001W8');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '71001W10', 'Arrandela GROWER W DIN127A Cincado', 'W10', '100', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Wave_washer_22mm-43mm_2016-03-03.jpg/800px-Wave_washer_22mm-43mm_2016-03-03.jpg', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Grower'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '71001W10');
INSERT INTO Products (cmhReference, name, metric, packagingUnit, familyId, image, reorderPoint, hidden)
SELECT '71001W12', 'Arrandela GROWER W DIN127A Cincado', 'W12', '100', f.id, 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Wave_washer_22mm-43mm_2016-03-03.jpg/800px-Wave_washer_22mm-43mm_2016-03-03.jpg', 1, 0
FROM Families f WHERE f.name = 'Arrandelas Grower'
AND NOT EXISTS (SELECT 1 FROM Products WHERE cmhReference = '71001W12');

-- Total: 692 productos insertados
SELECT COUNT(*) AS total_products FROM Products;
