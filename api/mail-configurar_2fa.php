<?php
require_once 'config.php';

// Obtener matrícula desde GET o POST
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

if (empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Matrícula requerida']);
    exit;
}

function generarSecretBase32($longitud = 16) {
    $alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $secret = '';
    for ($i = 0; $i < $longitud; $i++) {
        $secret .= $alfabeto[random_int(0, strlen($alfabeto) - 1)];
    }
    return $secret;
}

try {
    $stmt = $pdo->prepare("SELECT codigo_2fa, two_factor_enabled FROM usuarios WHERE matricula = :matricula");
    $stmt->execute([':matricula' => $matricula]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (empty($user['codigo_2fa'])) {
        $secret = generarSecretBase32(16);
        $update = $pdo->prepare("UPDATE usuarios SET codigo_2fa = :secret WHERE matricula = :matricula");
        $update->execute([':secret' => $secret, ':matricula' => $matricula]);
    } else {
        $secret = $user['codigo_2fa'];
    }
    
    $issuer = "SNTSS_Seccion_XXXIII";
    $qrUrl = "otpauth://totp/{$issuer}:{$matricula}?secret={$secret}&issuer={$issuer}&algorithm=SHA1&digits=6&period=30";
    
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
?>