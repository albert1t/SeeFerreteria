<?php
// run_migration_014.php
// Ejecuta la migracion 014 en la BD
// Subir a public_html/ y acceder una vez

header('Content-Type: text/plain; charset=utf-8');

$host = 'cm1291904-002.eu.clouddb.ovh.net';
$port = 35996;
$db   = 'db_ferreteria';
$user = 'operario';
$pass = 'Admin123';

echo "=== Migracion 014: Campos Tornilleria (cabeza, acabado, iso) ===\n\n";

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    echo "Conectado a la BD\n\n";
} catch (PDOException $e) {
    die("Error de conexion: " . $e->getMessage() . "\n");
}

// Buscar el archivo SQL
$sqlPath = '/home/cmhautomacion/repositories/SeeFerreteria/database/014_add_tornilleria_fields.sql';
if (!file_exists($sqlPath)) {
    die("Archivo no encontrado: $sqlPath\n");
}

$sql = file_get_contents($sqlPath);
echo "Archivo leido: " . strlen($sql) . " bytes\n\n";

// Eliminar comentarios y lineas vacias
$lines = explode("\n", $sql);
$statements = [];
$current = '';

foreach ($lines as $line) {
    $trimmed = trim($line);
    if ($trimmed === '' || str_starts_with($trimmed, '--')) {
        continue;
    }
    $current .= $line . "\n";
    if (str_ends_with($trimmed, ';')) {
        $statements[] = trim($current);
        $current = '';
    }
}
if (trim($current) !== '') {
    $statements[] = trim($current);
}

echo "Statements a ejecutar: " . count($statements) . "\n\n";

$success = 0;
$errors = 0;

foreach ($statements as $i => $stmt) {
    try {
        $pdo->exec($stmt);
        $success++;
        echo "  OK [$i]: " . substr($stmt, 0, 80) . "...\n";
    } catch (PDOException $e) {
        $errors++;
        $short = substr($stmt, 0, 120);
        echo "  ERROR [$i]: " . $e->getMessage() . "\n  Stmt: $short...\n\n";
    }
}

echo "\n=== RESUMEN ===\n";
echo "Ejecutados OK: $success\n";
echo "Errores: $errors\n";
echo "Total statements: " . count($statements) . "\n";

// Verificar columnas
$cols = $pdo->query("SHOW COLUMNS FROM Products LIKE 'cabeza'")->fetchAll();
echo "Columna 'cabeza' presente: " . (count($cols) > 0 ? 'SI' : 'NO') . "\n";
