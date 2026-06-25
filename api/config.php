<?php
/*
  Configuracion comun de la API.
  Todos los archivos PHP hacen require_once de este archivo para:
  - permitir llamadas desde React,
  - contestar JSON,
  - abrir la conexion PDO a MySQL.
*/

// Configurar las cabeceras para que el navegador entienda que la respuesta es JSON
header("Content-Type: application/json");

// Permite que cualquier origen (dominio) pueda hacer peticiones a esta API
// Esto es necesario porque React corre en un puerto diferente (ej: localhost:5173)
header("Access-Control-Allow-Origin: *");

// Permite los metodos POST, GET y OPTIONS
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

// Permite enviar el header Content-Type en las peticiones
header("Access-Control-Allow-Headers: Content-Type");

// Si la peticion es OPTIONS (pre-vuelo de CORS), termina aqui sin procesar
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Datos de conexion a la base de datos en IONOS
$host = 'db5020055703.hosting-data.io';   // Direccion del servidor de BD
$port = 3306;                              // Puerto de MySQL (el estandar)
$dbname = 'dbs15462976';                   // Nombre de la base de datos
$user = 'dbu2387642';                      // Usuario de la base de datos
$pass = 'B@l@zu971_M@rEsp092D@n';          // Contraseña de la base de datos

try {
    // Crear la conexion a la base de datos usando PDO
    // PDO es una libreria de PHP que permite interactuar con bases de datos de forma segura
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8", $user, $pass);
    
    // Configurar PDO para que lance excepciones cuando ocurra un error
    // Esto permite usar try/catch para manejar errores de BD
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
catch (PDOException $e) {
    // Si no se puede conectar a la base de datos, devolver un error 500
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexion a la base de datos']);
    exit;
}