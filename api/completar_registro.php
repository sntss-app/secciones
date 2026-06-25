<?php
/*
  Completa el registro de un trabajador.
  Guarda telefono, correo y contraseña en la tabla usuarios.
  Los documentos iniciales se suben despues desde subir_documentos.php.
*/

// Conectar a la base de datos
require_once 'config.php';

// Recibe los datos del frontend (React) en formato JSON
$data = json_decode(file_get_contents("php://input"), true);
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';
$telefono = isset($data['telefono']) ? trim($data['telefono']) : '';
$correo = isset($data['correo']) ? trim($data['correo']) : '';
$password = isset($data['password']) ? trim($data['password']) : '';

// Validacion: todos los campos son obligatorios
if (empty($matricula) || empty($telefono) || empty($correo) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Todos los campos (correo y contraseña) son obligatorios.']);
    exit;
}

// Validar que la matricula tenga entre 8 y 9 digitos
if (!preg_match('/^\d{8,9}$/', $matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La matricula debe tener entre 8 y 9 digitos.']);
    exit;
}

// Validar que el telefono tenga exactamente 10 digitos
if (!preg_match('/^\d{10}$/', $telefono)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El telefono debe tener exactamente 10 digitos numericos.']);
    exit;
}

// Validar que el correo tenga formato valido
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El correo electronico ingresado no es valido.']);
    exit;
}

// Validar que la contraseña tenga al menos 6 caracteres
if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La contraseña debe tener un minimo de 6 caracteres.']);
    exit;
}

try {
    // Verificar si el usuario existe en la base de datos
    $stmt = $pdo->prepare("SELECT contrasena, status FROM usuarios WHERE matricula = :matricula LIMIT 1");
    $stmt->execute([':matricula' => $matricula]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Si no existe, no se puede completar el registro
    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'La matricula no existe en el sistema.']);
        exit;
    }

    // Si ya tiene contraseña, ya esta registrado
    if (!empty($usuario['contrasena'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Esta matricula ya se encuentra registrada en el sistema.']);
        exit;
    }

    // Encriptar la contraseña antes de guardarla
    $password_hashed = password_hash($password, PASSWORD_DEFAULT);

    // Actualizar los datos del usuario (telefono, correo, contraseña)
    // status = 2 significa "registro completado"
    // fecha_registro = NOW() guarda la fecha y hora actual
    $updateStmt = $pdo->prepare("UPDATE usuarios SET telefono = :telefono, correo = :correo, contrasena = :password, status = 2, fecha_registro = NOW() WHERE matricula = :matricula");
    $resultado = $updateStmt->execute([
        ':telefono' => $telefono,
        ':correo' => $correo,
        ':password' => $password_hashed,
        ':matricula' => $matricula
    ]);

    // Respuesta segun el resultado
    if ($resultado) {
        echo json_encode(['success' => true, 'message' => '¡Pre-registro sindical completado exitosamente!']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Ocurrio un error al intentar guardar los datos en el servidor.']);
    }

} catch (PDOException $e) {
    // Si algo falla en la base de datos, devolver error 500
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}