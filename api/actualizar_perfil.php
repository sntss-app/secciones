<?php
/*
  Actualiza datos editables del perfil.
  Se limita a teléfono y correo para no alterar información de padrón.
*/
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';
$telefono = isset($data['telefono']) ? trim($data['telefono']) : '';
$correo = isset($data['correo']) ? trim($data['correo']) : '';

if (empty($matricula) || empty($telefono) || empty($correo)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Matrícula, teléfono y correo son obligatorios.']);
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El correo no tiene un formato válido.']);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'UPDATE usuarios
         SET telefono = :telefono, correo = :correo
         WHERE matricula = :matricula'
    );
    $stmt->execute([
        ':telefono' => $telefono,
        ':correo' => $correo,
        ':matricula' => $matricula,
    ]);

    echo json_encode(['success' => true, 'message' => 'Perfil actualizado correctamente.']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
