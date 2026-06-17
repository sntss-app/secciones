<?php
/*
  Registro de crédito de auto.
  Recibe tarjetón e INE, guarda archivos en uploads/año/auto/matrícula
  y crea o reinicia el registro en la tabla auto con status 1.
*/
require_once 'config.php';

$matricula = isset($_POST['matricula']) ? trim($_POST['matricula']) : '';
$tarjetonFile = $_FILES['tarjeton'] ?? null;
$ineFile = $_FILES['ine'] ?? null;

if (empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La matrícula es obligatoria.']);
    exit;
}

if (!$tarjetonFile || !$ineFile) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Se requieren tarjetón y documento de INE.']);
    exit;
}

$allowedTarjeton = ['pdf'];
$allowedIne = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
$maxSize = 5 * 1024 * 1024;

try {
    $userStmt = $pdo->prepare('SELECT matricula FROM usuarios WHERE matricula = :matricula LIMIT 1');
    $userStmt->execute([':matricula' => $matricula]);
    if (!$userStmt->fetch(PDO::FETCH_ASSOC)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No se encontró la matrícula en el padrón.']);
        exit;
    }

    $docStmt = $pdo->prepare('SELECT id, nombre_documento FROM documentos WHERE id IN (1,2) AND status = 2');
    $docStmt->execute();
    $documentos = [];
    while ($doc = $docStmt->fetch(PDO::FETCH_ASSOC)) {
        $documentos[(int)$doc['id']] = $doc['nombre_documento'];
    }
    if (empty($documentos[1]) || empty($documentos[2])) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'No se encontró la configuración de documentos para el registro de auto.']);
        exit;
    }
    $tarjetonDocumentId = 1;
    $ineDocumentId = 2;
    $tarjetonDocumentLabel = $documentos[$tarjetonDocumentId];
    $ineDocumentLabel = $documentos[$ineDocumentId];

    $year = date('Y');
    $targetDir = __DIR__ . "/uploads/$year/auto/$matricula";
    if (!is_dir($targetDir) && !mkdir($targetDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'No se pudo crear la carpeta de destino.']);
        exit;
    }

    // Tarjetón
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

    // INE
    if ($ineFile['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Error al recibir el INE.']);
        exit;
    }
    if ($ineFile['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El INE supera el tamaño máximo de 5MB.']);
        exit;
    }
    $ineExt = strtolower(pathinfo($ineFile['name'], PATHINFO_EXTENSION));
    if (!in_array($ineExt, $allowedIne, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El INE debe ser un PDF, JPG, PNG o WEBP.']);
        exit;
    }
    $ineFilename = $ineDocumentId . '.' . $ineExt;
    $inePath = "$targetDir/$ineFilename";
    if (file_exists($inePath)) {
        unlink($inePath);
    }
    if (!move_uploaded_file($ineFile['tmp_name'], $inePath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'No se pudo guardar el INE.']);
        exit;
    }

    // Insertar o actualizar registro en la tabla auto
    $stmt = $pdo->prepare('SELECT id FROM auto WHERE matricula = :matricula LIMIT 1');
    $stmt->execute([':matricula' => $matricula]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $update = $pdo->prepare(
            'UPDATE auto
             SET fecha_registro = NOW(), valido = NULL, observaciones = NULL, fecha_validado = NULL, status = 1
             WHERE matricula = :matricula'
        );
        $update->execute([':matricula' => $matricula]);
    } else {
        $insert = $pdo->prepare(
            'INSERT INTO auto (matricula, fecha_registro, status) VALUES (:matricula, NOW(), 1)'
        );
        $insert->execute([':matricula' => $matricula]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Registro de crédito de auto guardado con éxito.',
        'paths' => [
            'tarjeton' => "/api/uploads/$year/auto/$matricula/$tarjetonFilename",
            'ine' => "/api/uploads/$year/auto/$matricula/$ineFilename"
        ],
        'documentNames' => [
            'tarjeton' => $tarjetonDocumentLabel,
            'ine' => $ineDocumentLabel
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
