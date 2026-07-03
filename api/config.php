<?php
/*
  Configuración común de la API.
  Todos los archivos PHP hacen require_once de este archivo para:
  - permitir llamadas desde React,
  - contestar JSON,
  - abrir la conexión PDO a MySQL.
*/
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$host = 'db5020055703.hosting-data.io';
$port = 3306;
$dbname = 'dbs15462976';
$user = 'dbu2387642';
$pass = 'B@l@zu971_M@rEsp092D@n';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit;
}
?>
