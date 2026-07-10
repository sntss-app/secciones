<?php
/*
  Guardar registro de trabajador para la Cláusula 79Bis
  También actualiza teléfono y correo en la tabla usuarios
*/
require_once 'config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';
$telefono = isset($data['telefono']) ? trim($data['telefono']) : '';
$correo = isset($data['correo']) ? trim($data['correo']) : '';
$tiene_acompanante = isset($data['tiene_acompanante']) ? (int)$data['tiene_acompanante'] : 0;
$nombre_acompanante = isset($data['nombre_acompanante']) ? trim($data['nombre_acompanante']) : '';

if (empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Matrícula requerida']);
    exit;
}

try {
    // Verificar si ya tiene registro
    $check = $pdo->prepare("SELECT id, estatus FROM clausula79bis WHERE matricula = :matricula");
    $check->execute([':matricula' => $matricula]);
    $existing = $check->fetch();

    if ($existing) {
        echo json_encode([
            'success' => false, 
            'message' => 'Ya tienes un registro en proceso',
            'estatus' => $existing['estatus']
        ]);
        exit;
    }

    // Obtener datos del usuario
    $user = $pdo->prepare("SELECT nombre, adscripcion, categoria FROM usuarios WHERE matricula = :matricula");
    $user->execute([':matricula' => $matricula]);
    $usuario = $user->fetch();

    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
        exit;
    }

    // 🔥 ACTUALIZAR TELÉFONO Y CORREO EN LA TABLA USUARIOS
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

    // 🔥 Insertar registro con estatus 2 (Aprobado) en lugar de 1
    $stmt = $pdo->prepare("
        INSERT INTO clausula79bis (
            matricula, nombre, adscripcion, categoria, telefono, correo,
            tiene_acompanante, nombre_acompanante, estatus, fecha_registro
        ) VALUES (
            :matricula, :nombre, :adscripcion, :categoria, :telefono, :correo,
            :tiene_acompanante, :nombre_acompanante, 2, NOW()
        )
    ");

    $stmt->execute([
        ':matricula' => $matricula,
        ':nombre' => $usuario['nombre'],
        ':adscripcion' => $usuario['adscripcion'],
        ':categoria' => $usuario['categoria'],
        ':telefono' => $telefono,
        ':correo' => $correo,
        ':tiene_acompanante' => $tiene_acompanante,
        ':nombre_acompanante' => $nombre_acompanante
    ]);

    echo json_encode([
        'success' => true, 
        'message' => '¡Registro aprobado! Tu solicitud ha sido aceptada.'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en BD: ' . $e->getMessage()]);
}
?>