<?php
/*
  Actualiza datos editables del perfil:
  - Telefono
  - Correo
  - Foto de perfil (opcional)
*/

// Conectar a la base de datos
require_once 'config.php';

// Detecta si la peticion viene con archivos (FormData) o solo datos (JSON)
$esFormData = isset($_FILES) && !empty($_FILES);

if ($esFormData) {
    // Si viene con archivos, los datos llegan por POST (no JSON)
    $matricula = isset($_POST['matricula']) ? trim($_POST['matricula']) : '';
    $telefono = isset($_POST['telefono']) ? trim($_POST['telefono']) : '';
    $correo = isset($_POST['correo']) ? trim($_POST['correo']) : '';
    $fotoFile = isset($_FILES['foto']) ? $_FILES['foto'] : null;
} else {
    // Si no hay archivos, los datos llegan como JSON
    $data = json_decode(file_get_contents('php://input'), true);
    $matricula = isset($data['matricula']) ? trim($data['matricula']) : '';
    $telefono = isset($data['telefono']) ? trim($data['telefono']) : '';
    $correo = isset($data['correo']) ? trim($data['correo']) : '';
    $fotoFile = null;
}

// Validacion: los tres campos son obligatorios
if (empty($matricula) || empty($telefono) || empty($correo)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Matricula, telefono y correo son obligatorios.']);
    exit;
}

// Validar que el correo tenga formato valido
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El correo no tiene un formato valido.']);
    exit;
}

try {
    // Inicia una transaccion: si algo falla, no se guarda nada
    $pdo->beginTransaction();

    // 1. Actualizar telefono y correo en la tabla de usuarios
    $stmt = $pdo->prepare(
        'UPDATE usuarios SET telefono = :telefono, correo = :correo WHERE matricula = :matricula'
    );
    $stmt->execute([
        ':telefono' => $telefono,
        ':correo' => $correo,
        ':matricula' => $matricula,
    ]);

    // 2. Si el usuario envio una foto, procesarla
    $fotoActualizada = false;
    if ($fotoFile && $fotoFile['error'] === UPLOAD_ERR_OK) {
        // Solo permitir JPG, PNG o WEBP
        $fotoTipos = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($fotoFile['type'], $fotoTipos)) {
            throw new Exception('La foto debe ser JPG, PNG o WEBP.');
        }

        // Tamaño maximo 5MB
        if ($fotoFile['size'] > 5 * 1024 * 1024) {
            throw new Exception('La foto no debe superar los 5MB.');
        }

        // Crear la carpeta donde se guardara la foto
        // Ejemplo: /uploads/2026/registro/97158643/
        $year = date('Y');
        $targetDir = __DIR__ . "/uploads/$year/registro/$matricula/";
        
        // Si la carpeta no existe, la crea
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        // Borrar fotos anteriores del usuario (si existen)
        // El numero 6 significa "foto de perfil" en la tabla documentos
        $patrones = glob($targetDir . "6.*");
        foreach ($patrones as $archivo) {
            if (is_file($archivo)) {
                unlink($archivo);
            }
        }

        // Guardar la nueva foto con el nombre "6.extension"
        // Ejemplo: 6.jpg, 6.png, 6.webp
        $extension = strtolower(pathinfo($fotoFile['name'], PATHINFO_EXTENSION));
        $nombreArchivo = "6." . $extension;
        $rutaCompleta = $targetDir . $nombreArchivo;

        // Mover el archivo temporal a su ubicacion final
        if (!move_uploaded_file($fotoFile['tmp_name'], $rutaCompleta)) {
            throw new Exception('No se pudo guardar la foto.');
        }

        $fotoActualizada = true;
    }

    // Confirma los cambios en la base de datos
    $pdo->commit();

    // Mensaje de exito
    $mensaje = 'Perfil actualizado correctamente.';
    if ($fotoActualizada) {
        $mensaje .= ' Foto de perfil actualizada.';
    }

    echo json_encode([
        'success' => true,
        'message' => $mensaje,
        'foto_actualizada' => $fotoActualizada
    ]);

} catch (PDOException $e) {
    // Si falla la base de datos, cancela todo
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    // Si falla la validacion o la foto, cancela todo
    $pdo->rollBack();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}