<?php
/*
  Subida de documentos del registro inicial.
  Guarda tarjetón y foto de perfil en carpetas por año/usuario,
  usando la configuración de la tabla documentos cuando existe.
*/
require_once 'config.php';

$matricula = isset($_POST['matricula']) ? trim($_POST['matricula']) : '';
if (empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La matrícula es obligatoria.']);
    exit;
}

$tarjetonFile = $_FILES['tarjeton'] ?? null;
$fotoFile = $_FILES['foto'] ?? null;
if (!$tarjetonFile || !$fotoFile) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Se requieren tarjetón y foto de busto.']);
    exit;
}

$maxSize = 5 * 1024 * 1024;
$allowedTarjeton = ['pdf'];
$allowedFoto = ['jpg', 'jpeg', 'png', 'webp'];

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
    $userStmt = $pdo->prepare('SELECT matricula FROM usuarios WHERE matricula = :matricula LIMIT 1');
    $userStmt->execute([':matricula' => $matricula]);
    if (!$userStmt->fetch(PDO::FETCH_ASSOC)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No se encontró la matrícula en el padrón.']);
        exit;
    }

    $tarjetonDocumentId = getDocumentTypeId($pdo, ['tarjetón', 'tarjeton', 'Tarjetón', 'Tarjeton'], 1);
    $fotoDocumentId = getDocumentTypeId($pdo, ['foto de usuario', 'foto', 'busto', 'imagen'], 6);

    $year = date('Y');
    $process = isset($_POST['process']) ? trim($_POST['process']) : (isset($_POST['proceso']) ? trim($_POST['proceso']) : 'registro');
    $process = preg_replace('/[^a-z0-9_-]/', '', strtolower($process));
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

    if ($tarjetonFile['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Error al recibir el tarjetón.']);
        exit;
    }
    if ($tarjetonFile['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El tarjetón supera el tamaño máximo de 5MB.']);
        exit;
    }
    $tarjetonExt = strtolower(pathinfo($tarjetonFile['name'], PATHINFO_EXTENSION));
    if (!in_array($tarjetonExt, $allowedTarjeton, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El tarjetón debe ser un archivo PDF.']);
        exit;
    }
    $tarjetonFilename = $tarjetonDocumentId . '.' . $tarjetonExt;
    $tarjetonPath = "$targetDir/$tarjetonFilename";
    if (file_exists($tarjetonPath)) {
        unlink($tarjetonPath);
    }
    if (!move_uploaded_file($tarjetonFile['tmp_name'], $tarjetonPath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'No se pudo guardar el tarjetón.']);
        exit;
    }
    $uploaded['tarjeton'] = "/api/uploads/$year/$process/$matricula/$tarjetonFilename";

    if ($fotoFile['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Error al recibir la foto.']);
        exit;
    }
    if ($fotoFile['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'La foto supera el tamaño máximo de 5MB.']);
        exit;
    }
    $fotoExt = strtolower(pathinfo($fotoFile['name'], PATHINFO_EXTENSION));
    if (!in_array($fotoExt, $allowedFoto, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'La foto debe ser JPG, PNG o WEBP.']);
        exit;
    }
    $fotoFilename = $fotoDocumentId . '.' . $fotoExt;
    $fotoPath = "$targetDir/$fotoFilename";
    if (file_exists($fotoPath)) {
        unlink($fotoPath);
    }
    if (!move_uploaded_file($fotoFile['tmp_name'], $fotoPath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'No se pudo guardar la foto.']);
        exit;
    }
    $uploaded['foto'] = "/api/uploads/$year/$process/$matricula/$fotoFilename";

    echo json_encode([
        'success' => true,
        'message' => 'Documentos guardados correctamente.',
        'paths' => $uploaded
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
