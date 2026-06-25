<?php
/*
  Actualiza datos editables del perfil:
  - Teléfono
  - Correo
  - Foto de perfil (opcional)
*/
require_once 'config.php';

// Verificar si es una petición con FormData (archivos) o JSON
$esFormData = isset($_FILES) && !empty($_FILES);

if ($esFormData) {
    // 📸 Petición con archivos (FormData)
    $matricula = isset($_POST['matricula']) ? trim($_POST['matricula']) : '';
    $telefono = isset($_POST['telefono']) ? trim($_POST['telefono']) : '';
    $correo = isset($_POST['correo']) ? trim($_POST['correo']) : '';
    $fotoFile = isset($_FILES['foto']) ? $_FILES['foto'] : null;
} else {
    // 📝 Petición JSON (solo datos)
    $data = json_decode(file_get_contents('php://input'), true);
    $matricula = isset($data['matricula']) ? trim($data['matricula']) : '';
    $telefono = isset($data['telefono']) ? trim($data['telefono']) : '';
    $correo = isset($data['correo']) ? trim($data['correo']) : '';
    $fotoFile = null;
}

if (empty($matricula) || empty($telefono) || empty($correo)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Matrícula, teléfono y correo son obligatorios.']);
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El correo no tiene un formato válido.']);
    exit;
}

try {
    // Iniciar transacción
    $pdo->beginTransaction();

    // 1. Actualizar teléfono y correo
    $stmt = $pdo->prepare(
        'UPDATE usuarios SET telefono = :telefono, correo = :correo WHERE matricula = :matricula'
    );
    $stmt->execute([
        ':telefono' => $telefono,
        ':correo' => $correo,
        ':matricula' => $matricula,
    ]);

    // 2. Si hay foto, procesarla
    $fotoActualizada = false;
    if ($fotoFile && $fotoFile['error'] === UPLOAD_ERR_OK) {
        // Validar tipo de archivo
        $fotoTipos = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($fotoFile['type'], $fotoTipos)) {
            throw new Exception('La foto debe ser JPG, PNG o WEBP.');
        }

        // Validar tamaño (5MB)
        if ($fotoFile['size'] > 5 * 1024 * 1024) {
            throw new Exception('La foto no debe superar los 5MB.');
        }

        // Buscar año y carpeta de registro
        $year = date('Y');
        $targetDir = __DIR__ . "/uploads/$year/registro/$matricula/";
        
        // Crear carpeta si no existe
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        // Eliminar fotos anteriores (cualquier archivo que sea 6.*)
        $patrones = glob($targetDir . "6.*");
        foreach ($patrones as $archivo) {
            if (is_file($archivo)) {
                unlink($archivo);
            }
        }

        // Guardar la nueva foto con extensión correcta
        $extension = strtolower(pathinfo($fotoFile['name'], PATHINFO_EXTENSION));
        $nombreArchivo = "6." . $extension;
        $rutaCompleta = $targetDir . $nombreArchivo;

        if (!move_uploaded_file($fotoFile['tmp_name'], $rutaCompleta)) {
            throw new Exception('No se pudo guardar la foto.');
        }

        $fotoActualizada = true;
    }

    $pdo->commit();

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
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>