<?php
/*
  Crea o edita una noticia.
  Recibe texto, imagen, PDF, video y galeria desde CrearNoticia.jsx.
  Los archivos se guardan por año, proceso y matricula para ubicarlos facil en el hosting.
*/

// Conectar a la base de datos
require_once 'config.php';

/**
 * Limpia el nombre del archivo para evitar caracteres problematicos en el servidor.
 * Ejemplo: "mi archivo.jpg" -> "mi_archivo.jpg"
 */
function sanitizeFilename($filename) {
    $filename = basename($filename);
    $filename = preg_replace('/[^A-Za-z0-9._-]/', '_', $filename);
    return $filename ?: 'documento.pdf';
}

/**
 * Genera un nombre unico para un archivo.
 * Si ya existe un archivo con el mismo nombre, agrega un numero al final.
 * Ejemplo: si ya existe "foto.jpg", guarda "foto_2.jpg"
 */
function uniqueFilename($dir, $filename) {
    $safeFilename = sanitizeFilename($filename);
    $extension = pathinfo($safeFilename, PATHINFO_EXTENSION);
    $baseName = pathinfo($safeFilename, PATHINFO_FILENAME);
    $candidate = $safeFilename;
    $counter = 2;

    while (file_exists("$dir/$candidate")) {
        $candidate = $baseName . '_' . $counter . ($extension ? ".$extension" : '');
        $counter++;
    }

    return $candidate;
}

/**
 * Asegura que la tabla noticias tenga las columnas necesarias para guardar archivos.
 * Si alguna columna falta, la crea automaticamente.
 */
function ensureNewsFileColumns($pdo) {
    $columns = [];
    $stmt = $pdo->query("SHOW COLUMNS FROM noticias");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $columns[$row['Field']] = true;
    }

    // Columnas que necesita la tabla para guardar nombres de archivos
    $columnasNecesarias = [
        'imagen_nombre' => "ALTER TABLE noticias ADD COLUMN imagen_nombre varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL AFTER url_video",
        'pdf_nombre' => "ALTER TABLE noticias ADD COLUMN pdf_nombre varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL AFTER imagen_nombre",
        'video_nombre' => "ALTER TABLE noticias ADD COLUMN video_nombre varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL AFTER pdf_nombre",
        'galeria_nombres' => "ALTER TABLE noticias ADD COLUMN galeria_nombres text COLLATE utf8mb4_general_ci DEFAULT NULL AFTER video_nombre",
        'fijada' => "ALTER TABLE noticias ADD COLUMN fijada tinyint DEFAULT '0' AFTER status"
    ];

    foreach ($columnasNecesarias as $columna => $sql) {
        if (empty($columns[$columna])) {
            $pdo->exec($sql);
        }
    }
}

// Recibe los datos del frontend (React)
// NOTA: Como se envian archivos, los datos vienen por $_POST (no JSON)
$id = isset($_POST['id']) && $_POST['id'] !== '' ? (int) $_POST['id'] : null;
$matricula = isset($_POST['matricula']) ? trim($_POST['matricula']) : '';
$titulo = isset($_POST['titulo']) ? trim($_POST['titulo']) : '';
$resumen = isset($_POST['resumen']) ? trim($_POST['resumen']) : '';
$cuerpo = isset($_POST['contenido']) ? trim($_POST['contenido']) : '';
$urlVideo = isset($_POST['youtubeUrl']) ? trim($_POST['youtubeUrl']) : '';
$visible = isset($_POST['visible']) && $_POST['visible'] === '1';
$imagenFile = $_FILES['imagen'] ?? null;
$pdfFile = $_FILES['pdf'] ?? null;
$videoFile = $_FILES['video'] ?? null;
$galleryFiles = $_FILES['galeria'] ?? null;

// Validacion: campos obligatorios de la noticia
if (empty($matricula) || empty($titulo) || empty($resumen) || empty($cuerpo)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Matricula, titulo, resumen y contenido son obligatorios.']);
    exit;
}

// Tipos de archivos permitidos y tamaños maximos
$allowedImages = ['jpg', 'jpeg', 'png', 'webp'];
$allowedVideos = ['mp4', 'webm', 'ogg', 'mov'];
$maxImageSize = 5 * 1024 * 1024;   // 5MB
$maxPdfSize = 10 * 1024 * 1024;    // 10MB
$maxVideoSize = 100 * 1024 * 1024; // 100MB

try {
    // Asegurar que la tabla tenga las columnas necesarias
    ensureNewsFileColumns($pdo);

    // Verificar que el usuario que publica existe en la base de datos
    $userStmt = $pdo->prepare('SELECT matricula FROM usuarios WHERE matricula = :matricula LIMIT 1');
    $userStmt->execute([':matricula' => $matricula]);
    if (!$userStmt->fetch(PDO::FETCH_ASSOC)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No se encontro la matricula del usuario que publica.']);
        exit;
    }

    // === GUARDAR O EDITAR LA NOTICIA EN LA BASE DE DATOS ===
    if ($id) {
        // Si llega ID, es una EDICION de una noticia existente
        $stmt = $pdo->prepare(
            'UPDATE noticias
             SET titulo = :titulo, resumen = :resumen, cuerpo = :cuerpo, url_video = :url_video, status = :status
             WHERE id = :id AND status <> 0'
        );
        $stmt->execute([
            ':titulo' => $titulo,
            ':resumen' => $resumen,
            ':cuerpo' => $cuerpo,
            ':url_video' => $urlVideo,
            ':status' => $visible ? 1 : 2,
            ':id' => $id,
        ]);
    } else {
        // Si NO llega ID, es una NOTICIA NUEVA
        $stmt = $pdo->prepare(
            'INSERT INTO noticias (matricula, titulo, resumen, cuerpo, url_video, fecha_publicacion, vistas, status)
             VALUES (:matricula, :titulo, :resumen, :cuerpo, :url_video, NOW(), 0, :status)'
        );
        $stmt->execute([
            ':matricula' => $matricula,
            ':titulo' => $titulo,
            ':resumen' => $resumen,
            ':cuerpo' => $cuerpo,
            ':url_video' => $urlVideo,
            ':status' => $visible ? 1 : 2,
        ]);
        $id = (int) $pdo->lastInsertId(); // Obtener el ID de la noticia recien creada
    }

    // === CREAR CARPETA PARA LOS ARCHIVOS DE LA NOTICIA ===
    // Estructura: /uploads/2026/noticias/97158643/1/
    $year = date('Y');
    $targetDir = __DIR__ . "/uploads/$year/noticias/$matricula/$id";
    if (!is_dir($targetDir) && !mkdir($targetDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'No se pudo crear la carpeta de destino.']);
        exit;
    }

    // === PROCESAR IMAGEN DESTACADA ===
    $imageFilename = null;
    if ($imagenFile && $imagenFile['error'] !== UPLOAD_ERR_NO_FILE) {
        // Validar que no haya error, que no exceda el tamaño y que sea un formato permitido
        if ($imagenFile['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Error al recibir la imagen.']);
            exit;
        }
        if ($imagenFile['size'] > $maxImageSize) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'La imagen supera el tamaño maximo de 5MB.']);
            exit;
        }
        $imageExt = strtolower(pathinfo($imagenFile['name'], PATHINFO_EXTENSION));
        if (!in_array($imageExt, $allowedImages, true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'La imagen debe ser JPG, PNG o WEBP.']);
            exit;
        }
        // Guardar la imagen en la carpeta de la noticia
        $imageFilename = sanitizeFilename($imagenFile['name']);
        if (!move_uploaded_file($imagenFile['tmp_name'], "$targetDir/$imageFilename")) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'No se pudo guardar la imagen.']);
            exit;
        }
    }

    // === PROCESAR PDF ===
    $pdfFilename = null;
    if ($pdfFile && $pdfFile['error'] !== UPLOAD_ERR_NO_FILE) {
        if ($pdfFile['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Error al recibir el PDF.']);
            exit;
        }
        if ($pdfFile['size'] > $maxPdfSize) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'El PDF supera el tamaño maximo de 10MB.']);
            exit;
        }
        $pdfExt = strtolower(pathinfo($pdfFile['name'], PATHINFO_EXTENSION));
        if ($pdfExt !== 'pdf') {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'El documento adjunto debe ser PDF.']);
            exit;
        }
        $pdfFilename = sanitizeFilename($pdfFile['name']);
        if (!move_uploaded_file($pdfFile['tmp_name'], "$targetDir/$pdfFilename")) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'No se pudo guardar el PDF.']);
            exit;
        }
    }

    // === PROCESAR VIDEO LOCAL ===
    $videoFilename = null;
    if ($videoFile && $videoFile['error'] !== UPLOAD_ERR_NO_FILE) {
        if ($videoFile['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Error al recibir el video local.']);
            exit;
        }
        if ($videoFile['size'] > $maxVideoSize) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'El video supera el tamaño maximo de 100MB.']);
            exit;
        }
        $videoExt = strtolower(pathinfo($videoFile['name'], PATHINFO_EXTENSION));
        if (!in_array($videoExt, $allowedVideos, true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'El video debe ser MP4, WEBM, OGG o MOV.']);
            exit;
        }

        // El video se guarda en una carpeta diferente: /uploads/año/noticias/matricula/
        $videoDir = __DIR__ . "/uploads/$year/noticias/$matricula";
        if (!is_dir($videoDir) && !mkdir($videoDir, 0777, true)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'No se pudo crear la carpeta del video.']);
            exit;
        }

        $videoFilename = uniqueFilename($videoDir, $videoFile['name']);
        if (!move_uploaded_file($videoFile['tmp_name'], "$videoDir/$videoFilename")) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'No se pudo guardar el video local.']);
            exit;
        }
    }

    // === PROCESAR GALERIA ===
    $galleryFilenames = null;
    if ($galleryFiles && isset($galleryFiles['name']) && is_array($galleryFiles['name'])) {
        // Filtrar solo los archivos que realmente se subieron
        $validGalleryIndexes = [];
        foreach ($galleryFiles['name'] as $index => $name) {
            if (($galleryFiles['error'][$index] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                $validGalleryIndexes[] = $index;
            }
        }

        // Limite de 10 archivos en la galeria
        if (count($validGalleryIndexes) > 10) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'La galeria permite maximo 10 elementos.']);
            exit;
        }

        // Carpeta de galeria: /uploads/año/noticias/galerias/matricula/
        $galleryDir = __DIR__ . "/uploads/$year/noticias/galerias/$matricula";
        if (!is_dir($galleryDir) && !mkdir($galleryDir, 0777, true)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'No se pudo crear la carpeta de galeria.']);
            exit;
        }

        $galleryFilenames = [];
        foreach ($validGalleryIndexes as $index) {
            // Validar cada archivo de galeria
            if ($galleryFiles['error'][$index] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Error al recibir un archivo de galeria.']);
                exit;
            }

            $galleryExt = strtolower(pathinfo($galleryFiles['name'][$index], PATHINFO_EXTENSION));
            $galleryType = in_array($galleryExt, $allowedVideos, true) ? 'video' : 'image';
            
            // Validar formato
            if (!in_array($galleryExt, $allowedImages, true) && !in_array($galleryExt, $allowedVideos, true)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'La galeria acepta JPG, PNG, WEBP, MP4, WEBM, OGG o MOV.']);
                exit;
            }

            // Validar tamaño
            if ($galleryType === 'image' && $galleryFiles['size'][$index] > $maxImageSize) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Una imagen de galeria supera el tamaño maximo de 5MB.']);
                exit;
            }
            if ($galleryType === 'video' && $galleryFiles['size'][$index] > $maxVideoSize) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Un video de galeria supera el tamaño maximo de 100MB.']);
                exit;
            }

            // Guardar el archivo de galeria
            $galleryFilename = uniqueFilename($galleryDir, $galleryFiles['name'][$index]);
            if (!move_uploaded_file($galleryFiles['tmp_name'][$index], "$galleryDir/$galleryFilename")) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'No se pudo guardar un archivo de galeria.']);
                exit;
            }

            $galleryFilenames[] = [
                'name' => $galleryFilename,
                'type' => $galleryType,
            ];
        }
    }

    // === ACTUALIZAR NOMBRES DE ARCHIVOS EN LA BASE DE DATOS ===
    if ($imageFilename || $pdfFilename || $videoFilename || $galleryFilenames !== null) {
        $fields = [];
        $params = [':id' => $id];
        if ($imageFilename) {
            $fields[] = 'imagen_nombre = :imagen_nombre';
            $params[':imagen_nombre'] = $imageFilename;
        }
        if ($pdfFilename) {
            $fields[] = 'pdf_nombre = :pdf_nombre';
            $params[':pdf_nombre'] = $pdfFilename;
        }
        if ($videoFilename) {
            $fields[] = 'video_nombre = :video_nombre';
            $params[':video_nombre'] = $videoFilename;
        }
        if ($galleryFilenames !== null) {
            $fields[] = 'galeria_nombres = :galeria_nombres';
            $params[':galeria_nombres'] = json_encode($galleryFilenames);
        }

        $fileUpdate = $pdo->prepare('UPDATE noticias SET ' . implode(', ', $fields) . ' WHERE id = :id');
        $fileUpdate->execute($params);
    }

    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Noticia guardada correctamente.',
        'id' => $id,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}