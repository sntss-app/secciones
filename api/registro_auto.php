<?php
/*
  Registro de credito de auto.
  Recibe tarjeton e INE, guarda archivos en uploads/año/auto/matricula
  y crea o reinicia el registro en la tabla auto con status 1.
*/

// Conectar a la base de datos
require_once 'config.php';

// Recibir los datos del frontend (React) - vienen por POST porque se suben archivos
$matricula = isset($_POST['matricula']) ? trim($_POST['matricula']) : '';
$tarjetonFile = $_FILES['tarjeton'] ?? null; // Archivo del tarjeton de pago
$ineFile = $_FILES['ine'] ?? null;           // Archivo del INE

// Validar que la matricula sea obligatoria
if (empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La matricula es obligatoria.']);
    exit;
}

// Validar que ambos documentos sean obligatorios
if (!$tarjetonFile || !$ineFile) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Se requieren tarjeton y documento de INE.']);
    exit;
}

// Configuracion de archivos permitidos
$allowedTarjeton = ['pdf'];                       // Tarjeton solo PDF
$allowedIne = ['pdf', 'jpg', 'jpeg', 'png', 'webp']; // INE puede ser PDF o imagen
$maxSize = 5 * 1024 * 1024; // 5MB maximo por archivo

try {
    // Verificar que la matricula existe en la tabla usuarios
    $userStmt = $pdo->prepare('SELECT matricula FROM usuarios WHERE matricula = :matricula LIMIT 1');
    $userStmt->execute([':matricula' => $matricula]);
    if (!$userStmt->fetch(PDO::FETCH_ASSOC)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No se encontro la matricula en el padron.']);
        exit;
    }

    // Obtener los nombres de los documentos desde la tabla documentos
    // id 1 = tarjeton, id 2 = INE
    $docStmt = $pdo->prepare('SELECT id, nombre_documento FROM documentos WHERE id IN (1,2) AND status = 2');
    $docStmt->execute();
    $documentos = [];
    while ($doc = $docStmt->fetch(PDO::FETCH_ASSOC)) {
        $documentos[(int)$doc['id']] = $doc['nombre_documento'];
    }
    // Si falta alguno, no se puede continuar
    if (empty($documentos[1]) || empty($documentos[2])) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'No se encontro la configuracion de documentos para el registro de auto.']);
        exit;
    }
    $tarjetonDocumentId = 1;
    $ineDocumentId = 2;
    $tarjetonDocumentLabel = $documentos[$tarjetonDocumentId];
    $ineDocumentLabel = $documentos[$ineDocumentId];

    // Crear carpeta donde se guardaran los documentos
    // Estructura: /uploads/2026/auto/97158643/
    $year = date('Y');
    $targetDir = __DIR__ . "/uploads/$year/auto/$matricula";
    if (!is_dir($targetDir) && !mkdir($targetDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'No se pudo crear la carpeta de destino.']);
        exit;
    }

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
    // Si ya existe, borrarlo y sobrescribir
    if (file_exists($tarjetonPath)) {
        unlink($tarjetonPath);
    }
    if (!move_uploaded_file($tarjetonFile['tmp_name'], $tarjetonPath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'No se pudo guardar el tarjeton.']);
        exit;
    }

    // === PROCESAR INE ===
    if ($ineFile['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Error al recibir el INE.']);
        exit;
    }
    if ($ineFile['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El INE supera el tamaño maximo de 5MB.']);
        exit;
    }
    $ineExt = strtolower(pathinfo($ineFile['name'], PATHINFO_EXTENSION));
    if (!in_array($ineExt, $allowedIne, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El INE debe ser un PDF, JPG, PNG o WEBP.']);
        exit;
    }
    // Guardar el INE con el nombre "2.pdf" (2 = id del documento)
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

    // === GUARDAR REGISTRO EN LA BASE DE DATOS ===
    // Verificar si ya existe un registro de auto para esta matricula
    $stmt = $pdo->prepare('SELECT id FROM auto WHERE matricula = :matricula LIMIT 1');
    $stmt->execute([':matricula' => $matricula]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        // Si existe, actualizarlo (reiniciar status a 1 y limpiar validaciones)
        $update = $pdo->prepare(
            'UPDATE auto
             SET fecha_registro = NOW(), valido = NULL, observaciones = NULL, fecha_validado = NULL, status = 1
             WHERE matricula = :matricula'
        );
        $update->execute([':matricula' => $matricula]);
    } else {
        // Si no existe, insertar un nuevo registro
        $insert = $pdo->prepare(
            'INSERT INTO auto (matricula, fecha_registro, status) VALUES (:matricula, NOW(), 1)'
        );
        $insert->execute([':matricula' => $matricula]);
    }

    // Respuesta exitosa con las rutas de los documentos guardados
    echo json_encode([
        'success' => true,
        'message' => 'Registro de credito de auto guardado con exito.',
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