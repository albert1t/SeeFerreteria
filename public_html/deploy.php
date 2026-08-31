<?php
header('Content-Type: text/plain; charset=utf-8');
echo "=== Deploy + Migracion 013 ===\n\n";

// 1. Git pull
echo "--- git pull ---\n";
chdir('/home/cmhautomacion/repositories/SeeFerreteria');
$pull = shell_exec('git pull origin main 2>&1');
echo $pull . "\n";

// 2. Ejecutar migracion SQL
echo "\n--- Migracion 013 ---\n";
$sqlPath = 'database/013_import_material_ferreteria.sql';
if (!file_exists($sqlPath)) {
    die("ERROR: $sqlPath no encontrado\n");
}
$sql = file_get_contents($sqlPath);
echo "SQL leido: " . strlen($sql) . " bytes\n";

try {
    $pdo = new PDO(
        'mysql:host=cm1291904-002.eu.clouddb.ovh.net;port=35996;dbname=db_ferreteria;charset=utf8mb4',
        'operario', 'Admin123',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES => false]
    );
    echo "BD conectada\n\n";

    $lines = explode("\n", $sql);
    $stmts = []; $cur = '';
    foreach ($lines as $l) {
        $t = trim($l);
        if ($t === '' || str_starts_with($t, '--')) continue;
        $cur .= $l . "\n";
        if (str_ends_with($t, ';')) { $stmts[] = trim($cur); $cur = ''; }
    }
    if (trim($cur) !== '') $stmts[] = trim($cur);

    echo "Statements: " . count($stmts) . "\n";
    $ok = 0; $err = 0;
    foreach ($stmts as $i => $s) {
        try {
            $pdo->exec($s);
            $ok++;
            if ($ok % 100 === 0) echo "  ... $ok OK\n";
        } catch (PDOException $e) {
            $err++;
            echo "  ERR[$i]: " . substr($e->getMessage(), 0, 100) . "\n";
        }
    }
    echo "\nOK: $ok | Errores: $err\n";

    $total = $pdo->query("SELECT COUNT(*) FROM Products")->fetchColumn();
    $fams = $pdo->query("SELECT COUNT(*) FROM Families")->fetchColumn();
    echo "Productos en BD: $total\n";
    echo "Familias en BD: $fams\n";
} catch (PDOException $e) {
    echo "ERROR BD: " . $e->getMessage() . "\n";
}

// 3. npm install backend
echo "\n--- npm install backend ---\n";
$npm = shell_exec('cd backend && /opt/alt/alt-nodejs24/root/usr/bin/node /opt/alt/alt-nodejs24/root/usr/lib/node_modules/npm/bin/npm-cli.js install --omit=dev 2>&1');
echo $npm . "\n";

// 4. Reiniciar app
echo "\n--- Reiniciar app ---\n";
$pid = shell_exec("ps aux | grep 'lsnode:/home/cmhautomacion/repositories/SeeFerreteria/backend/' | grep -v grep | awk '{print \$2}'");
$pid = trim($pid);
if ($pid) {
    shell_exec("kill -9 $pid");
    echo "Proceso $pid eliminado\n";
}
$start = shell_exec('/usr/sbin/cloudlinux-selector start --json --interpreter nodejs --domain cmhautomacion.com --app-root /home/cmhautomacion/repositories/SeeFerreteria/backend 2>&1');
echo $start . "\n";

echo "\n=== COMPLETADO ===\n";
