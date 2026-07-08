<?php
/*
  Completa el registro de un trabajador.
  Guarda antigüedad, teléfono, correo, sexo (desde CURP) y contraseña en la tabla usuarios.
  Los documentos iniciales se suben después desde subir_documentos.php.
*/
require_once 'config.php';

// Obtener datos del cuerpo del request (JSON)
$data = json_decode(file_get_contents("php://input"), true);
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';
$antiguedad = isset($data['antiguedad']) ? trim($data['antiguedad']) : '';
$telefono = isset($data['telefono']) ? trim($data['telefono']) : '';
$correo = isset($data['correo']) ? trim($data['correo']) : '';
$password = isset($data['password']) ? trim($data['password']) : '';

if (empty($matricula) || empty($antiguedad) || empty($telefono) || empty($correo) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
    exit;
}

// Validar antigüedad (solo números)
if (!preg_match('/^\d+$/', $antiguedad)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La antigüedad debe ser un número válido.']);
    exit;
}

// Validar matrícula
if (!preg_match('/^\d{8,9}$/', $matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La matrícula debe tener entre 8 y 9 dígitos.']);
    exit;
}

// Validar teléfono
if (!preg_match('/^\d{10}$/', $telefono)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El teléfono debe tener exactamente 10 dígitos numéricos.']);
    exit;
}

// Validar correo
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El correo electrónico ingresado no es válido.']);
    exit;
}

// Validar contraseña
if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La contraseña debe tener un mínimo de 6 caracteres.']);
    exit;
}

try {
    // Verificar si el usuario existe y obtener su CURP
    $stmt = $pdo->prepare("SELECT contrasena, status, curp FROM usuarios WHERE matricula = :matricula LIMIT 1");
    $stmt->execute([':matricula' => $matricula]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'La matrícula no existe en el sistema.']);
        exit;
    }

    if (!empty($usuario['contrasena'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Esta matrícula ya se encuentra registrada en el sistema.']);
        exit;
    }

    // 🔥 OBTENER SEXO DESDE LA CURP (M, F, O)
    $curp = $usuario['curp'];
    $sexo = 'O'; // Default: Otro
    
    if (!empty($curp) && strlen($curp) >= 11) {
        // El carácter 11 de la CURP (posición 10 en índice 0) indica el sexo
        // H = Hombre, M = Mujer
        $sexoChar = substr($curp, 10, 1);
        if ($sexoChar === 'H') {
            $sexo = 'M'; // 'H' en CURP = Masculino = 'M' en BD
        } elseif ($sexoChar === 'M') {
            $sexo = 'F'; // 'M' en CURP = Femenino = 'F' en BD
        } else {
            $sexo = 'O'; // Otro
        }
    }

    // Hashear la contraseña
    $password_hashed = password_hash($password, PASSWORD_DEFAULT);

    // 🔥 Actualizar datos del usuario
    $updateStmt = $pdo->prepare("
        UPDATE usuarios 
        SET antiguedad = :antiguedad, 
            telefono = :telefono, 
            correo = :correo, 
            contrasena = :password, 
            sexo = :sexo,
            status = 2, 
            fecha_registro = NOW() 
        WHERE matricula = :matricula
    ");
    
    $resultado = $updateStmt->execute([
        ':antiguedad' => (int)$antiguedad,
        ':telefono' => $telefono,
        ':correo' => $correo,
        ':password' => $password_hashed,
        ':sexo' => $sexo,
        ':matricula' => $matricula
    ]);

    if ($resultado) {
        echo json_encode([
            'success' => true, 
            'message' => '¡Pre-registro sindical completado exitosamente!',
            'sexo' => $sexo
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Ocurrió un error al intentar guardar los datos en el servidor.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>