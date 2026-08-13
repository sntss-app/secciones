<?php
/*
  Subida de documentos del registro inicial.
  Guarda tarjetón y foto de perfil en carpetas por año/tipo/sección/usuario,
  usando la configuración de la tabla documentos cuando existe.
  Tipos: a=activo, j=jubilado, c=confianza
  Ahora busca en todas las tablas de usuarios (activos, jubilados, confianza).
*/
require_once 'config.php';

$matricula = isset($_POST['matricula']) ? trim($_POST['matricula']) : '';
$idSeccion = isset($_POST['idSeccion']) ? (int)$_POST['idSeccion'] : 0;
$idTipo = isset($_POST['idTipo']) ? (int)$_POST['idTipo'] : 0;

if (empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La matrícula es obligatoria.']);
    exit;
}

if (empty($idSeccion)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La sección es obligatoria.']);
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
    // ✅ BUSCAR LA MATRÍCULA EN TODAS LAS TABLAS
    $usuario = null;
    $tablaOrigen = '';

    // 1. Buscar en usuarios (activos)
    $userStmt = $pdo->prepare('SELECT matricula, idSeccion, idTipo FROM usuarios WHERE matricula = :matricula LIMIT 1');
    $userStmt->execute([':matricula' => $matricula]);
    $usuario = $userStmt->fetch(PDO::FETCH_ASSOC);
    $tablaOrigen = 'usuarios';

    // 2. Si no se encuentra, buscar en usuariosJ (jubilados)
    if (!$usuario) {
        $userStmt = $pdo->prepare('SELECT matricula, idSeccion, idTipo FROM usuariosJ WHERE matricula = :matricula LIMIT 1');
        $userStmt->execute([':matricula' => $matricula]);
        $usuario = $userStmt->fetch(PDO::FETCH_ASSOC);
        $tablaOrigen = 'usuariosJ';
    }

    // 3. Si no se encuentra, buscar en usuariosC (confianza)
    if (!$usuario) {
        $userStmt = $pdo->prepare('SELECT matricula, idSeccion, idTipo FROM usuariosC WHERE matricula = :matricula LIMIT 1');
        $userStmt->execute([':matricula' => $matricula]);
        $usuario = $userStmt->fetch(PDO::FETCH_ASSOC);
        $tablaOrigen = 'usuariosC';
    }

    // ✅ Si no se encuentra en ninguna tabla
    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No se encontró la matrícula en el padrón.']);
        exit;
    }

    // ✅ Verificar que la sección coincida con la del usuario
    if ($usuario['idSeccion'] != $idSeccion) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'La sección no coincide con la del usuario.']);
        exit;
    }

    // ✅ Obtener el tipo del usuario (prioridad: POST > BD > default 1)
    $idTipo = $idTipo > 0 ? $idTipo : ($usuario['idTipo'] ?? 1);

    // ✅ Mapear idTipo a letra de carpeta
    $tipoMap = [
        1 => 'a',  // activo
        2 => 'j',  // jubilado
        3 => 'c'   // confianza
    ];
    $carpetaTipo = $tipoMap[$idTipo] ?? 'a';

    $tarjetonDocumentId = getDocumentTypeId($pdo, ['tarjetón', 'tarjeton', 'Tarjetón', 'Tarjeton'], 1);
    $fotoDocumentId = getDocumentTypeId($pdo, ['foto de usuario', 'foto', 'busto', 'imagen'], 6);

    $year = date('Y');
    $process = isset($_POST['process']) ? trim($_POST['process']) : (isset($_POST['proceso']) ? trim($_POST['proceso']) : 'registro');
    $process = preg_replace('/[^a-z0-9_-]/', '', strtolower($process));
    if ($process === '') {
        $process = 'registro';
    }
    
    // ✅ CARPETA CON TIPO + SECCIÓN + MATRÍCULA
    $targetDir = __DIR__ . "/uploads/$year/$process/$carpetaTipo/$idSeccion/$matricula";
    if (!is_dir($targetDir) && !mkdir($targetDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'No se pudo crear la carpeta de destino.']);
        exit;
    }

    $uploaded = [];

    // ===== PROCESAR TARJETÓN =====
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
    // ✅ RUTA DEL TARJETÓN CON TIPO + SECCIÓN
    $uploaded['tarjeton'] = "/api/uploads/$year/$process/$carpetaTipo/$idSeccion/$matricula/$tarjetonFilename";

    // ===== PROCESAR FOTO =====
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
    // ✅ RUTA DE LA FOTO CON TIPO + SECCIÓN
    $uploaded['foto'] = "/api/uploads/$year/$process/$carpetaTipo/$idSeccion/$matricula/$fotoFilename";

    echo json_encode([
        'success' => true,
        'message' => 'Documentos guardados correctamente.',
        'paths' => $uploaded,
        'tipo' => $carpetaTipo,
        'idTipo' => $idTipo,
        'tablaOrigen' => $tablaOrigen
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>