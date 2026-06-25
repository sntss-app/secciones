<?php
/*
  Subida de documentos del registro inicial.
  Guarda tarjeton y foto de perfil en carpetas por año/usuario,
  usando la configuracion de la tabla documentos cuando existe.
*/

// Conectar a la base de datos
require_once 'config.php';

// Recibir los datos del frontend (React) - vienen por POST porque se suben archivos
$matricula = isset($_POST['matricula']) ? trim($_POST['matricula']) : '';

// Validar que la matricula sea obligatoria
if (empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La matricula es obligatoria.']);
    exit;
}

// Obtener los archivos subidos
$tarjetonFile = $_FILES['tarjeton'] ?? null; // Archivo del tarjeton de pago
$fotoFile = $_FILES['foto'] ?? null;         // Archivo de la foto de perfil

// Validar que ambos documentos sean obligatorios
if (!$tarjetonFile || !$fotoFile) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Se requieren tarjeton y foto de busto.']);
    exit;
}

// Configuracion de archivos permitidos
$maxSize = 5 * 1024 * 1024; // 5MB maximo por archivo
$allowedTarjeton = ['pdf'];                       // Tarjeton solo PDF
$allowedFoto = ['jpg', 'jpeg', 'png', 'webp'];    // Foto puede ser JPG, PNG o WEBP

/**
 * Funcion que busca el ID del documento en la tabla documentos
 * Busca por coincidencia de nombre (ej: "tarjeton", "foto de usuario")
 * Si no encuentra, usa un ID por defecto (fallback)
 */
function getDocumentTypeId(PDO $pdo, array $patterns, int $fallback): int {
    foreach ($patterns as $pattern) {
        $stmt = $pdo->prepare('SELECT id FROM documentos WHERE nombre_documento LIKE :pattern LIMIT 1');
        $stmt->execute([':pattern' => "%$pattern%"]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            return (int) $row['id'];
        }
    }
    return $fallback;
}

try {
    // Verificar que la matricula existe en la tabla usuarios
    $userStmt = $pdo->prepare('SELECT matricula FROM usuarios WHERE matricula = :matricula LIMIT 1');
    $userStmt->execute([':matricula' => $matricula]);
    if (!$userStmt->fetch(PDO::FETCH_ASSOC)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No se encontro la matricula en el padron.']);
        exit;
    }

    // Buscar los IDs de los documentos en la tabla documentos
    $tarjetonDocumentId = getDocumentTypeId($pdo, ['tarjeton', 'tarjeton', 'Tarjeton', 'Tarjeton'], 1);
    $fotoDocumentId = getDocumentTypeId($pdo, ['foto de usuario', 'foto', 'busto', 'imagen'], 6);

    // Crear carpeta donde se guardaran los documentos
    // Estructura: /uploads/2026/registro/97158643/
    $year = date('Y');
    $process = isset($_POST['process']) ? trim($_POST['process']) : (isset($_POST['proceso']) ? trim($_POST['proceso']) : 'registro');
    $process = preg_replace('/[^a-z0-9_-]/', '', strtolower($process)); // Limpiar nombre
    if ($process === '') {
        $process = 'registro';
    }
    $targetDir = __DIR__ . "/uploads/$year/$process/$matricula";
    if (!is_dir($targetDir) && !mkdir($targetDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'No se pudo crear la carpeta de destino.']);
        exit;
    }

    $uploaded = [];

    // === PROCESAR TARJETON ===
    if ($tarjetonFile['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Error al recibir el tarjeton.']);
        exit;
    }
    if ($tarjetonFile['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El tarjeton supera el tamaño maximo de 5MB.']);
        exit;
    }
    $tarjetonExt = strtolower(pathinfo($tarjetonFile['name'], PATHINFO_EXTENSION));
    if (!in_array($tarjetonExt, $allowedTarjeton, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El tarjeton debe ser un archivo PDF.']);
        exit;
    }
    // Guardar el tarjeton con el nombre "1.pdf" (1 = id del documento)
    $tarjetonFilename = $tarjetonDocumentId . '.' . $tarjetonExt;
    $tarjetonPath = "$targetDir/$tarjetonFilename";
    if (file_exists($tarjetonPath)) {
        unlink($tarjetonPath); // Si ya existe, borrarlo
    }
    if (!move_uploaded_file($tarjetonFile['tmp_name'], $tarjetonPath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'No se pudo guardar el tarjeton.']);
        exit;
    }
    $uploaded['tarjeton'] = "/api/uploads/$year/$process/$matricula/$tarjetonFilename";

    // === PROCESAR FOTO DE PERFIL ===
    if ($fotoFile['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Error al recibir la foto.']);
        exit;
    }
    if ($fotoFile['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'La foto supera el tamaño maximo de 5MB.']);
        exit;
    }
    $fotoExt = strtolower(pathinfo($fotoFile['name'], PATHINFO_EXTENSION));
    if (!in_array($fotoExt, $allowedFoto, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'La foto debe ser JPG, PNG o WEBP.']);
        exit;
    }
    // Guardar la foto con el nombre "6.jpg" (6 = id del documento para foto de perfil)
    $fotoFilename = $fotoDocumentId . '.' . $fotoExt;
    $fotoPath = "$targetDir/$fotoFilename";
    if (file_exists($fotoPath)) {
        unlink($fotoPath); // Si ya existe, borrarlo
    }
    if (!move_uploaded_file($fotoFile['tmp_name'], $fotoPath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'No se pudo guardar la foto.']);
        exit;
    }
    $uploaded['foto'] = "/api/uploads/$year/$process/$matricula/$fotoFilename";

    // Respuesta exitosa con las rutas de los documentos guardados
    echo json_encode([
        'success' => true,
        'message' => 'Documentos guardados correctamente.',
        'paths' => $uploaded
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}