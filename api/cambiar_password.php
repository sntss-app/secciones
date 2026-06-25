<?php
/*
  Cambiar contraseña del usuario desde el perfil.
  Solo requiere la nueva contraseña (no pide la actual porque se asume que es temporal o el usuario esta logueado).
*/

// Conectar a la base de datos
require_once 'config.php';

// Recibe los datos del frontend (React) en formato JSON
$data = json_decode(file_get_contents("php://input"), true);
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';
$password_nueva = isset($data['password_nueva']) ? trim($data['password_nueva']) : '';

// Validacion: ambos campos son obligatorios
if (empty($matricula) || empty($password_nueva)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
    exit;
}

// Validar que la nueva contraseña tenga al menos 8 caracteres
if (strlen($password_nueva) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La nueva contraseña debe tener al menos 8 caracteres.']);
    exit;
}

try {
    // Encriptar la nueva contraseña antes de guardarla
    // password_hash genera un hash seguro (no se puede revertir a texto plano)
    $password_hashed = password_hash($password_nueva, PASSWORD_DEFAULT);
    
    // Actualizar la contraseña en la base de datos
    $update = $pdo->prepare("UPDATE usuarios SET contrasena = :password WHERE matricula = :matricula");
    $resultado = $update->execute([
        ':password' => $password_hashed,
        ':matricula' => $matricula
    ]);

    // Respuesta segun el resultado
    if ($resultado) {
        echo json_encode(['success' => true, 'message' => 'Contraseña actualizada correctamente.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al actualizar la contraseña.']);
    }

} catch (PDOException $e) {
    // Si algo falla en la base de datos, devolver error 500
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}