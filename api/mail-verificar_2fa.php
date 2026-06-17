<?php
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"), true);
$codigo = isset($data['codigo']) ? trim($data['codigo']) : '';
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';

if (empty($codigo) || empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Código y matrícula requeridos']);
    exit;
}

// Función para decodificar Base32
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

// Función para verificar el código TOTP
function verificarTOTP($secret, $codigo) {
    for ($i = -1; $i <= 1; $i++) {
        $tiempoSlice = floor((time() + ($i * 30)) / 30);
        $contador = pack('N', $tiempoSlice);
        $contador = str_pad($contador, 8, "\0", STR_PAD_LEFT);
        
        $secretDecodificado = base32Decodificar($secret);
        $hmac = hash_hmac('sha1', $contador, $secretDecodificado, true);
        $offset = ord($hmac[strlen($hmac) - 1]) & 0x0F;
        $hashTruncado = (
            (ord($hmac[$offset]) & 0x7F) << 24 |
            (ord($hmac[$offset + 1]) & 0xFF) << 16 |
            (ord($hmac[$offset + 2]) & 0xFF) << 8 |
            (ord($hmac[$offset + 3]) & 0xFF)
        );
        $codigoGenerado = str_pad($hashTruncado % 1000000, 6, '0', STR_PAD_LEFT);
        
        if ($codigoGenerado === $codigo) {
            return true;
        }
    }
    return false;
}

try {
    $stmt = $pdo->prepare("SELECT codigo_2fa FROM usuarios WHERE matricula = :matricula");
    $stmt->execute([':matricula' => $matricula]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || empty($user['codigo_2fa'])) {
        echo json_encode(['success' => false, 'message' => '2FA no configurado']);
        exit;
    }
    
    if (verificarTOTP($user['codigo_2fa'], $codigo)) {
        // Activar el 2FA (por si no estaba)
        $update = $pdo->prepare("UPDATE usuarios SET two_factor_enabled = 1 WHERE matricula = :matricula");
        $update->execute([':matricula' => $matricula]);
        
        echo json_encode(['success' => true, 'message' => 'Código correcto']);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Código incorrecto']);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>