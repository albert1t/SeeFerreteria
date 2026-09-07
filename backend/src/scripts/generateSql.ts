import { writeFileSync } from 'fs';

const map: Record<string, string> = {
  "Pasador cilíndrico DIN 6325": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Pasador-cilíndrico-DIN-6325-1788333458769.jpg",
  "Pasador elástico ISO 8752": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Pasador-elástico-ISO-8752-1788333461862.jpg",
  "Tornillo cabeza cilíndrica Allen ISO4762/DIN912 8.8 Cincado": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Tornillo-cabeza-cilíndrica-Allen-ISO4762-DIN912-8.8-Cincado-1788333464058.jpg",
  "Tornillo cabeza cónica Allen ISO10642/DIN7991 10.9 Cincado": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Tornillo-cabeza-cónica-Allen-ISO10642-DIN7991-10.9-Cincado-1788333466544.jpg",
  "Pasador extraible DIN 7979": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Pasador-extraible-DIN-7979-1788333469176.jpg",
  "Junta tórica NBR70º Shore A": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Junta-tórica-NBR70º-Shore-A-1788333471621.jpg",
  "Circlips Exterior DIN 471": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Circlips-Exterior-DIN-471-1788333474125.jpg",
  "Circlips Interior DIN 472": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Circlips-Interior-DIN-472-1788333476769.jpg",
  "Chaveta DIN 6885A": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Chaveta-DIN-6885A-1788333479241.jpg",
  "Tuerca Hexagonal ISO4032.8 Cincado": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Tuerca-Hexagonal-ISO4032.8-Cincado-1788333481716.jpg",
  "Tuerca Freno DIN985 Cincado": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Tuerca-Freno-DIN985-Cincado-1788333484128.jpg",
  "Arrandela GROWER W DIN127A Cincado": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Arrandela-GROWER-W-DIN127A-Cincado-1788333486454.jpg",
  "Arrandela Plana Normal ISO7089 200HV Cincado": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Arrandela-Plana-Normal-ISO7089-200HV-Cincado-1788333489043.jpg",
  "Arrandela Plana Ancha ISO7093 200HV Cincado": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Arrandela-Plana-Ancha-ISO7093-200HV-Cincado-1788333491667.jpg",
  "Tornillo de presión con tetón": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Tornillo-de-presión-con-tetón-1788333495632.jpg",
  "Varilla roscada 1 metro DIN976 8.8 Cincado": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Varilla-roscada-1-metro-DIN976-8.8-Cincado-1788333502128.jpg",
  "Inserto autorroscante Cincado": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Inserto-autorroscante-Cincado-1788333511521.jpg",
  "Varilla roscada 1 metro DIN976 4.8": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Varilla-roscada-1-metro-DIN976-4.8-1788333525622.jpg",
  "Tornillo de presión con bola": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Tornillo-de-presión-con-bola-1788333685663.jpg",
  "Racord Instantaneo": "https://ferreteriastorageacc.blob.core.windows.net/simpleblob/product-image/Racord-Instantaneo-1788333693569.jpg",
};

let sql = `-- =============================================\n`;
sql += `-- ASIGNAR IMAGENES A PRODUCTOS SIN IMAGEN\n`;
sql += `-- Abrir phpMyAdmin > base de datos > pestana SQL\n`;
sql += `-- Pegar todo esto y hacer clic en Continuar\n`;
sql += `-- =============================================\n\n`;

for (const [name, url] of Object.entries(map)) {
  const eName = name.replace(/'/g, "''");
  const eUrl = url.replace(/'/g, "''");
  sql += `UPDATE Products SET image = '${eUrl}' WHERE name = '${eName}' AND (image IS NULL OR image = '');\n`;
}

sql += `\n-- VERIFICACION: deberia devolver 0\n`;
sql += `SELECT COUNT(*) AS sin_imagen FROM Products WHERE image IS NULL OR image = '';\n`;

writeFileSync('C:/Users/thedu/OneDrive/Escritorio/SEE_Ferreteria/update_images.sql', sql);
console.log(`SQL generado: ${Object.keys(map).length} UPDATE statements`);
console.log('Archivo: update_images.sql');
