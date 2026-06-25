<?php
// Este archivo configura la autenticacion de dos pasos (2FA) para un usuario
// Genera un codigo secreto (llave) que el usuario escane con Google Authenticator

// Conectar a la base de datos
require_once 'config.php';

// Buscar la matricula del usuario (puede venir por GET, POST o JSON)
$matricula = '';
if (isset($_GET['matricula'])) {
    $matricula = trim($_GET['matricula']);
} elseif (isset($_POST['matricula'])) {
    $matricula = trim($_POST['matricula']);
} else {
    $input = json_decode(file_get_contents("php://input"), true);
    if ($input && isset($input['matricula'])) {
        $matricula = trim($input['matricula']);
    }
}

// Si no llega la matricula, no se puede continuar
if (empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Matricula requerida']);
    exit;
}

/**
 * Genera un codigo secreto en formato Base32 (el que usa Google Authenticator)
 * El codigo se ve como: JBSWY3DPEHPK3PXP
 * Es una cadena de 16 caracteres con letras mayusculas y numeros (excluyendo 0,1,8,9 para evitar confusion)
 */
function generarSecretBase32($longitud = 16) {
    $alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $secret = '';
    for ($i = 0; $i < $longitud; $i++) {
        $secret .= $alfabeto[random_int(0, strlen($alfabeto) - 1)];
    }
    return $secret;
}

try {
    // Verificar si el usuario ya tiene un codigo 2FA guardado
    $stmt = $pdo->prepare("SELECT codigo_2fa, two_factor_enabled FROM usuarios WHERE matricula = :matricula");
    $stmt->execute([':matricula' => $matricula]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Si no tiene codigo 2FA, generarle uno nuevo
    if (empty($user['codigo_2fa'])) {
        $secret = generarSecretBase32(16);
        $update = $pdo->prepare("UPDATE usuarios SET codigo_2fa = :secret WHERE matricula = :matricula");
        $update->execute([':secret' => $secret, ':matricula' => $matricula]);
    } else {
        // Si ya tiene, usar el existente
        $secret = $user['codigo_2fa'];
    }
    
    // Construir la URL del codigo QR para Google Authenticator
    // Formato: otpauth://totp/NombreApp:usuario?secret=CODIGO&issuer=NombreApp
    $issuer = "SNTSS_Seccion_XXXIII";
    $qrUrl = "otpauth://totp/{$issuer}:{$matricula}?secret={$secret}&issuer={$issuer}&algorithm=SHA1&digits=6&period=30";
    
    // Respuesta: el codigo secreto y la URL del QR
    // already_enabled indica si el usuario ya activo el 2FA
    echo json_encode([
        'success' => true,
        'secret' => $secret,
        'qrUrl' => $qrUrl,
        'already_enabled' => ($user['two_factor_enabled'] == 1)
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}