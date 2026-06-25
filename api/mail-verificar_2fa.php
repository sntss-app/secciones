<?php
// Este archivo verifica el codigo de 6 digitos que el usuario ingresa desde Google Authenticator
// Es el segundo paso para activar el 2FA (despues de escanear el QR)

// Conectar a la base de datos
require_once 'config.php';

// Recibir los datos del frontend (React) en formato JSON
$data = json_decode(file_get_contents("php://input"), true);
$codigo = isset($data['codigo']) ? trim($data['codigo']) : '';        // Codigo de 6 digitos que escribio el usuario
$matricula = isset($data['matricula']) ? trim($data['matricula']) : ''; // Matricula del usuario

// Validar que lleguen ambos datos
if (empty($codigo) || empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Codigo y matricula requeridos']);
    exit;
}

/**
 * Funcion para decodificar un codigo en formato Base32 a texto plano
 * Base32 es el formato que usa Google Authenticator para guardar el secreto
 * Convierte algo como "JBSWY3DPEHPK3PXP" a texto plano que PHP puede usar
 */
function base32Decodificar($input) {
    $alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $output = '';
    $buffer = 0;
    $bits = 0;
    
    $input = strtoupper($input);
    for ($i = 0; $i < strlen($input); $i++) {
        $char = $input[$i];
        if ($char === '=') break;
        $val = strpos($alfabeto, $char);
        if ($val === false) continue;
        
        $buffer = ($buffer << 5) | $val;
        $bits += 5;
        
        if ($bits >= 8) {
            $bits -= 8;
            $output .= chr(($buffer >> $bits) & 0xFF);
        }
    }
    return $output;
}

/**
 * Funcion para verificar si el codigo ingresado es correcto
 * TOTP = Time-based One-Time Password (codigo de un solo uso basado en tiempo)
 * El codigo cambia cada 30 segundos, por eso se verifica el tiempo actual
 */
function verificarTOTP($secret, $codigo) {
    // Revisa el codigo actual, uno antes y uno despues (ventana de 90 segundos)
    for ($i = -1; $i <= 1; $i++) {
        // Calcular el slice de tiempo (cada 30 segundos)
        $tiempoSlice = floor((time() + ($i * 30)) / 30);
        $contador = pack('N', $tiempoSlice);
        $contador = str_pad($contador, 8, "\0", STR_PAD_LEFT);
        
        // Decodificar el secreto y calcular el HMAC con SHA1
        $secretDecodificado = base32Decodificar($secret);
        $hmac = hash_hmac('sha1', $contador, $secretDecodificado, true);
        
        // Extraer un codigo de 6 digitos del HMAC (metodo de Google Authenticator)
        $offset = ord($hmac[strlen($hmac) - 1]) & 0x0F;
        $hashTruncado = (
            (ord($hmac[$offset]) & 0x7F) << 24 |
            (ord($hmac[$offset + 1]) & 0xFF) << 16 |
            (ord($hmac[$offset + 2]) & 0xFF) << 8 |
            (ord($hmac[$offset + 3]) & 0xFF)
        );
        $codigoGenerado = str_pad($hashTruncado % 1000000, 6, '0', STR_PAD_LEFT);
        
        // Si el codigo generado coincide con el que ingreso el usuario, es correcto
        if ($codigoGenerado === $codigo) {
            return true;
        }
    }
    return false;
}

try {
    // Obtener el codigo secreto del usuario desde la base de datos
    $stmt = $pdo->prepare("SELECT codigo_2fa FROM usuarios WHERE matricula = :matricula");
    $stmt->execute([':matricula' => $matricula]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Si el usuario no tiene codigo 2FA, no puede verificar
    if (!$user || empty($user['codigo_2fa'])) {
        echo json_encode(['success' => false, 'message' => '2FA no configurado']);
        exit;
    }
    
    // Verificar si el codigo es correcto
    if (verificarTOTP($user['codigo_2fa'], $codigo)) {
        // Si el codigo es correcto, activar el 2FA en la base de datos
        $update = $pdo->prepare("UPDATE usuarios SET two_factor_enabled = 1 WHERE matricula = :matricula");
        $update->execute([':matricula' => $matricula]);
        
        echo json_encode(['success' => true, 'message' => 'Codigo correcto']);
    } else {
        // Si el codigo es incorrecto, devolver error
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Codigo incorrecto']);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}