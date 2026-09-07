-- Añade campos opcionales especificos de la familia Tornilleria a Products
-- cabeza, acabado e iso son NULL por defecto (opcionales a nivel de BD);
-- la app los exige solo cuando el producto pertenece a la familia Tornilleria

ALTER TABLE Products ADD COLUMN cabeza VARCHAR(100) NULL;
ALTER TABLE Products ADD COLUMN acabado VARCHAR(100) NULL;
ALTER TABLE Products ADD COLUMN iso VARCHAR(100) NULL;
