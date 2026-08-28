<?php
/*
  Actualizar registro de trabajador para la Cláusula 79Bis
  También actualiza teléfono y correo en la tabla registros
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
    // Iniciar transacción
    $pdo->beginTransaction();

    // ✅ 1. ACTUALIZAR TELÉFONO Y CORREO EN registros
    // Verificar si existe registro en registros
    $checkRegistro = $pdo->prepare("SELECT id FROM registros WHERE matricula = :matricula");
    $checkRegistro->execute([':matricula' => $matricula]);
    $existeRegistro = $checkRegistro->fetch();

    if ($existeRegistro) {
        // Actualizar registros existentes
        $updateRegistro = $pdo->prepare("
            UPDATE registros 
            SET telefono = :telefono, 
                correo = :correo 
            WHERE matricula = :matricula
        ");
        $updateRegistro->execute([
            ':telefono' => $telefono,
            ':correo' => $correo,
            ':matricula' => $matricula
        ]);
    } else {
        // Insertar en registros si no existe
        $insertRegistro = $pdo->prepare("
            INSERT INTO registros (
                matricula, 
                telefono, 
                correo,
                status
            ) VALUES (
                :matricula,
                :telefono,
                :correo,
                2
            )
        ");
        $insertRegistro->execute([
            ':matricula' => $matricula,
            ':telefono' => $telefono,
            ':correo' => $correo
        ]);
    }

    // ✅ 2. ACTUALIZAR REGISTRO EN clausula79bis
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

    // Confirmar transacción
    $pdo->commit();

    echo json_encode([
        'success' => true, 
        'message' => 'Registro actualizado correctamente'
    ]);

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en BD: ' . $e->getMessage()]);
}
?>