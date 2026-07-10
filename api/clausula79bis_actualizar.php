<?php
/*
  Actualizar registro de trabajador para la Cláusula 79Bis
*/
require_once 'config.php';

header('Content-Type: application/json');

// 🔥 OBTENER LOS DATOS DEL REQUEST
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// 🔥 LOG PARA DEBUG (lo quitas después)
error_log("=== clausula79bis_actualizar.php ===");
error_log("Input recibido: " . $input);

$id = isset($data['id']) ? (int)$data['id'] : 0;
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';
$telefono = isset($data['telefono']) ? trim($data['telefono']) : '';
$correo = isset($data['correo']) ? trim($data['correo']) : '';
$tiene_acompanante = isset($data['tiene_acompanante']) ? (int)$data['tiene_acompanante'] : 0;
$nombre_acompanante = isset($data['nombre_acompanante']) ? trim($data['nombre_acompanante']) : '';

// 🔥 LOG PARA DEBUG
error_log("ID: $id, Matricula: $matricula");

if ($id <= 0 || empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos: id o matrícula faltante']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        UPDATE clausula79bis 
        SET telefono = :telefono, 
            correo = :correo, 
            tiene_acompanante = :tiene_acompanante,
            nombre_acompanante = :nombre_acompanante,
            estatus = 2,
            observaciones = NULL,
            fecha_validacion = NOW()
        WHERE id = :id AND matricula = :matricula
    ");

    $stmt->execute([
        ':telefono' => $telefono,
        ':correo' => $correo,
        ':tiene_acompanante' => $tiene_acompanante,
        ':nombre_acompanante' => $nombre_acompanante,
        ':id' => $id,
        ':matricula' => $matricula
    ]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No se encontró el registro con ese ID']);
        exit;
    }

    // Actualizar teléfono y correo en usuarios
    $updateUsuario = $pdo->prepare("
        UPDATE usuarios 
        SET telefono = :telefono, 
            correo = :correo 
        WHERE matricula = :matricula
    ");
    $updateUsuario->execute([
        ':telefono' => $telefono,
        ':correo' => $correo,
        ':matricula' => $matricula
    ]);

    echo json_encode([
        'success' => true, 
        'message' => 'Registro actualizado correctamente'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en BD: ' . $e->getMessage()]);
}
?>