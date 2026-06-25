<?php
/*
  Cambiar contraseña del usuario desde el perfil.
  Solo requiere la nueva contraseña (no pide la actual porque se asume que es temporal o el usuario está logueado).
*/
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"), true);
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';
$password_nueva = isset($data['password_nueva']) ? trim($data['password_nueva']) : '';

if (empty($matricula) || empty($password_nueva)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
    exit;
}

if (strlen($password_nueva) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La nueva contraseña debe tener al menos 8 caracteres.']);
    exit;
}

try {
    $password_hashed = password_hash($password_nueva, PASSWORD_DEFAULT);
    $update = $pdo->prepare("UPDATE usuarios SET contrasena = :password WHERE matricula = :matricula");
    $resultado = $update->execute([
        ':password' => $password_hashed,
        ':matricula' => $matricula
    ]);

    if ($resultado) {
        echo json_encode(['success' => true, 'message' => 'Contraseña actualizada correctamente.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al actualizar la contraseña.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>