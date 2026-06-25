<?php
/*
  api/recuperar_contraseña.php
  Recupera contraseña de un afiliado.
  Busca por matrícula y correo electrónico.
  Si coinciden, genera una nueva contraseña temporal aleatoria,
  la actualiza hasheada en la base de datos y la envía por correo
  utilizando PHPMailer con SMTP.
*/
require_once 'config.php';

// Incluir PHPMailer
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Obtener datos del cuerpo del request (JSON)
$data = json_decode(file_get_contents("php://input"), true);
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';
$correo = isset($data['correo']) ? trim($data['correo']) : '';

if (empty($matricula) || empty($correo)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La matrícula y el correo electrónico son obligatorios.']);
    exit;
}

try {
    // Buscar al usuario por matrícula y correo (coincidencia exacta)
    $stmt = $pdo->prepare("SELECT id, matricula, nombre, correo, contrasena FROM usuarios WHERE matricula = :matricula AND LOWER(correo) = LOWER(:correo) LIMIT 1");
    $stmt->execute([
        ':matricula' => $matricula,
        ':correo' => $correo
    ]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No se encontró ningún trabajador registrado con esa combinación de matrícula y correo.']);
        exit;
    }

    if (empty($usuario['contrasena'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Esta cuenta aún no tiene contraseña. Por favor, completa tu registro primero.']);
        exit;
    }

    // Generar una contraseña temporal aleatoria de 8 caracteres
    $caracteres = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
    $password_temporal = '';
    for ($i = 0; $i < 8; $i++) {
        $password_temporal .= $caracteres[rand(0, strlen($caracteres) - 1)];
    }

    // Hashear la contraseña temporal
    $password_hashed = password_hash($password_temporal, PASSWORD_DEFAULT);

    // Actualizar la contraseña en la base de datos
    $updateStmt = $pdo->prepare("UPDATE usuarios SET contrasena = :contrasena WHERE id = :id");
    $resultado = $updateStmt->execute([
        ':contrasena' => $password_hashed,
        ':id' => $usuario['id']
    ]);

    if (!$resultado) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'No se pudo restablecer la contraseña en este momento.']);
        exit;
    }

    // ============ ENVÍO DE CORREO CON SMTP ============
    
    $mail = new PHPMailer(true);
    
    try {
        // Configuración del servidor SMTP
        $mail->isSMTP();
        $mail->Host       = 'smtp.ionos.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'soporte@sntss-secciones.org';
        $mail->Password   = 'Espi_neza092';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        
        // Configuración del correo
        $mail->setFrom('soporte@sntss-secciones.org', 'SNTSS Sección XXXIII');
        $mail->addAddress($correo, $usuario['nombre']);
        
        $mail->isHTML(true);
        $mail->Subject = 'Recuperación de Contraseña - SNTSS Sección XXXIII';
        
        // Cuerpo del correo
        $mail->Body = "
        <html>
        <head>
            <title>Recuperación de Contraseña - SNTSS</title>
        </head>
        <body style='font-family: Arial, sans-serif; color: #212529; background-color: #f8f9fa; padding: 20px;'>
            <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 18px rgba(10, 15, 30, 0.06);'>
                <div style='background-color: #0A0F1E; border-bottom: 4px solid #FFD700; padding: 20px; text-align: center; color: #ffffff;'>
                    <h2 style='margin: 0; font-size: 20px;'>SNTSS Sección XXXIII</h2>
                </div>
                <div style='padding: 30px;'>
                    <p>Hola <strong>" . htmlspecialchars($usuario['nombre']) . "</strong>,</p>
                    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta asociada a la matrícula <strong>" . htmlspecialchars($matricula) . "</strong>.</p>
                    <p>Te hemos asignado la siguiente contraseña temporal para que puedas iniciar sesión:</p>
                    
                    <div style='background-color: #f1f3f6; border-left: 4px solid #FFD700; padding: 15px; margin: 20px 0; font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 1px; text-align: center; color: #0A0F1E;'>
                        " . htmlspecialchars($password_temporal) . "
                    </div>
                    
                    <p style='color: #dc3545; font-size: 13px; font-weight: bold;'>* Por seguridad, te recomendamos cambiar esta contraseña temporal desde la sección 'Editar Perfil' una vez que ingreses a tu cuenta.</p>
                    
                    <p style='margin-top: 30px; border-top: 1px solid #e9ecef; padding-top: 20px; font-size: 12px; color: #6c757d;'>
                        Este es un mensaje automático del portal web SNTSS Sección XXXIII. Por favor, no respondas a este correo.
                    </p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        // Enviar correo
        $mail->send();
        
        echo json_encode([
            'success' => true,
            'message' => 'Se ha enviado un correo electrónico con tu contraseña temporal. Revisa tu bandeja de entrada o spam.'
        ]);
        
    } catch (Exception $e) {
        // Si falla el envío, pero la contraseña ya se cambió en BD
        echo json_encode([
            'success' => true,
            'message' => 'Contraseña temporal generada correctamente, pero no se pudo enviar el correo. Error: ' . $mail->ErrorInfo
        ]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>