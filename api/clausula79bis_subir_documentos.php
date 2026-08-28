<?php
require_once 'config.php';

header('Content-Type: application/json');

$matricula = isset($_POST['matricula']) ? trim($_POST['matricula']) : '';
$tipo = isset($_POST['tipo']) ? (int)$_POST['tipo'] : 0;

if (empty($matricula) || $tipo === 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

try {
    // Validar que existe el registro
    $check = $pdo->prepare("SELECT id FROM clausula79bis WHERE matricula = :matricula");
    $check->execute([':matricula' => $matricula]);
    if (!$check->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Registro no encontrado']);
        exit;
    }

    $nombreArchivo = $tipo === 1 ? 'tarjeton' : 'ine';
    $nombreCampo = $tipo === 1 ? 'tarjeton' : 'ine';
    $columna = $tipo === 1 ? 'tarjeton_ruta' : 'ine_ruta';

    if (!isset($_FILES[$nombreCampo])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Archivo ' . $nombreArchivo . ' requerido']);
        exit;
    }

    $file = $_FILES[$nombreCampo];
    if ($file['type'] !== 'application/pdf') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El ' . $nombreArchivo . ' debe ser PDF']);
        exit;
    }

    if ($file['size'] > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El ' . $nombreArchivo . ' no debe superar los 5MB']);
        exit;
    }

    // Crear directorio
    $year = date('Y');
    $uploadDir = __DIR__ . "/uploads/{$year}/clausula79bis/{$matricula}/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $path = $uploadDir . "{$tipo}.pdf";
    move_uploaded_file($file['tmp_name'], $path);

    // Guardar ruta en BD
    $dbPath = "/api/uploads/{$year}/clausula79bis/{$matricula}/{$tipo}.pdf";
    $update = $pdo->prepare("UPDATE clausula79bis SET $columna = :path WHERE matricula = :matricula");
    $update->execute([':path' => $dbPath, ':matricula' => $matricula]);

    echo json_encode(['success' => true, 'message' => $nombreArchivo . ' subido correctamente']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en BD: ' . $e->getMessage()]);
}
?>