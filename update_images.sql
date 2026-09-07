-- =============================================
-- ASIGNAR IMAGENES A PRODUCTOS SIN IMAGEN
-- Abrir phpMyAdmin > base de datos > pestana SQL
-- Pegar todo esto y hacer clic en Continuar
-- =============================================

UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Pasador-cilíndrico-DIN-6325-1788333458769.jpg' WHERE name = 'Pasador cilíndrico DIN 6325' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Pasador-elástico-ISO-8752-1788333461862.jpg' WHERE name = 'Pasador elástico ISO 8752' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Tornillo-cabeza-cilíndrica-Allen-ISO4762-DIN912-8.8-Cincado-1788333464058.jpg' WHERE name = 'Tornillo cabeza cilíndrica Allen ISO4762/DIN912 8.8 Cincado' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Tornillo-cabeza-cónica-Allen-ISO10642-DIN7991-10.9-Cincado-1788333466544.jpg' WHERE name = 'Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Pasador-extraible-DIN-7979-1788333469176.jpg' WHERE name = 'Pasador extraible DIN 7979' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Junta-tórica-NBR70º-Shore-A-1788333471621.jpg' WHERE name = 'Junta tórica NBR70º Shore A' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Circlips-Exterior-DIN-471-1788333474125.jpg' WHERE name = 'Circlips Exterior DIN 471' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Circlips-Interior-DIN-472-1788333476769.jpg' WHERE name = 'Circlips Interior DIN 472' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Chaveta-DIN-6885A-1788333479241.jpg' WHERE name = 'Chaveta DIN 6885A' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Tuerca-Hexagonal-ISO4032.8-Cincado-1788333481716.jpg' WHERE name = 'Tuerca Hexagonal ISO4032.8 Cincado' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Tuerca-Freno-DIN985-Cincado-1788333484128.jpg' WHERE name = 'Tuerca Freno DIN985 Cincado' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Arrandela-GROWER-W-DIN127A-Cincado-1788333486454.jpg' WHERE name = 'Arrandela GROWER W DIN127A Cincado' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Arrandela-Plana-Normal-ISO7089-200HV-Cincado-1788333489043.jpg' WHERE name = 'Arrandela Plana Normal ISO7089 200HV Cincado' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Arrandela-Plana-Ancha-ISO7093-200HV-Cincado-1788333491667.jpg' WHERE name = 'Arrandela Plana Ancha ISO7093 200HV Cincado' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Tornillo-de-presión-con-tetón-1788333495632.jpg' WHERE name = 'Tornillo de presión con tetón' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Varilla-roscada-1-metro-DIN976-8.8-Cincado-1788333502128.jpg' WHERE name = 'Varilla roscada 1 metro DIN976 8.8 Cincado' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Inserto-autorroscante-Cincado-1788333511521.jpg' WHERE name = 'Inserto autorroscante Cincado' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Varilla-roscada-1-metro-DIN976-4.8-1788333525622.jpg' WHERE name = 'Varilla roscada 1 metro DIN976 4.8' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Tornillo-de-presión-con-bola-1788333685663.jpg' WHERE name = 'Tornillo de presión con bola' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Racord-Instantaneo-1788333693569.jpg' WHERE name = 'Racord Instantaneo' AND (image IS NULL OR image = '');

-- VERIFICACION: deberia devolver 0
SELECT COUNT(*) AS sin_imagen FROM Products WHERE image IS NULL OR image = '';
