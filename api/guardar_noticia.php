<?php
/*
  Crea o edita una noticia.
  Recibe texto, imagen, PDF, video y galería desde CrearNoticia.jsx.
  Los archivos se guardan por año, proceso y matrícula para ubicarlos fácil en el hosting.
*/
require_once 'config.php';

function sanitizeFilename($filename) {
    // Limpia el nombre del archivo para evitar espacios raros o caracteres problemáticos en servidor.
    $filename = basename($filename);
    $filename = preg_replace('/[^A-Za-z0-9._-]/', '_', $filename);
    return $filename ?: 'documento.pdf';
}

function uniqueFilename($dir, $filename) {
    // Conserva el nombre original cuando se puede; si ya existe, evita pisar otro archivo.
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

function ensureNewsFileColumns($pdo) {
    // Si la tabla noticias todavía no tiene columnas para los nombres de archivos,
    // las agrega automáticamente para que el hosting quede compatible.
    $columns = [];
    $stmt = $pdo->query("SHOW COLUMNS FROM noticias");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $columns[$row['Field']] = true;
    }

    if (empty($columns['imagen_nombre'])) {
        $pdo->exec("ALTER TABLE noticias ADD COLUMN imagen_nombre varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL AFTER url_video");
    }

    if (empty($columns['pdf_nombre'])) {
        $pdo->exec("ALTER TABLE noticias ADD COLUMN pdf_nombre varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL AFTER imagen_nombre");
    }

    if (empty($columns['video_nombre'])) {
        $pdo->exec("ALTER TABLE noticias ADD COLUMN video_nombre varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL AFTER pdf_nombre");
    }

    if (empty($columns['galeria_nombres'])) {
        $pdo->exec("ALTER TABLE noticias ADD COLUMN galeria_nombres text COLLATE utf8mb4_general_ci DEFAULT NULL AFTER video_nombre");
    }

    if (empty($columns['fijada'])) {
        $pdo->exec("ALTER TABLE noticias ADD COLUMN fijada tinyint DEFAULT '0' AFTER status");
    }
}

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

if (empty($matricula) || empty($titulo) || empty($resumen) || empty($cuerpo)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Matrícula, título, resumen y contenido son obligatorios.']);
    exit;
}

$allowedImages = ['jpg', 'jpeg', 'png', 'webp'];
$allowedVideos = ['mp4', 'webm', 'ogg', 'mov'];
$maxImageSize = 5 * 1024 * 1024;
$maxPdfSize = 10 * 1024 * 1024;
$maxVideoSize = 100 * 1024 * 1024;

try {
    ensureNewsFileColumns($pdo);

    // Confirmamos que quien publica exista en usuarios.
    $userStmt = $pdo->prepare('SELECT matricula FROM usuarios WHERE matricula = :matricula LIMIT 1');
    $userStmt->execute([':matricula' => $matricula]);
    if (!$userStmt->fetch(PDO::FETCH_ASSOC)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No se encontró la matrícula del usuario que publica.']);
        exit;
    }

    if ($id) {
        // Si llega id, es edición de una noticia existente.
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
        // Si no llega id, es una noticia nueva.
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
        $id = (int) $pdo->lastInsertId();
    }

    $imageFilename = null;
    $pdfFilename = null;
    $videoFilename = null;
    $galleryFilenames = null;
    $year = date('Y');
    $targetDir = __DIR__ . "/uploads/$year/noticias/$matricula/$id";
    if (!is_dir($targetDir) && !mkdir($targetDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'No se pudo crear la carpeta de destino.']);
        exit;
    }

    if ($imagenFile && $imagenFile['error'] !== UPLOAD_ERR_NO_FILE) {
        // Imagen destacada de la noticia.
        if ($imagenFile['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Error al recibir la imagen.']);
            exit;
        }
        if ($imagenFile['size'] > $maxImageSize) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'La imagen supera el tamaño máximo de 5MB.']);
            exit;
        }
        $imageExt = strtolower(pathinfo($imagenFile['name'], PATHINFO_EXTENSION));
        if (!in_array($imageExt, $allowedImages, true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'La imagen debe ser JPG, PNG o WEBP.']);
            exit;
        }
        $imageFilename = sanitizeFilename($imagenFile['name']);
        if (strtolower(pathinfo($imageFilename, PATHINFO_EXTENSION)) !== $imageExt) {
            $imageFilename .= ".$imageExt";
        }
        if (!move_uploaded_file($imagenFile['tmp_name'], "$targetDir/$imageFilename")) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'No se pudo guardar la imagen.']);
            exit;
        }
    }

    if ($pdfFile && $pdfFile['error'] !== UPLOAD_ERR_NO_FILE) {
        // PDF descargable que acompaña la noticia.
        if ($pdfFile['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Error al recibir el PDF.']);
            exit;
        }
        if ($pdfFile['size'] > $maxPdfSize) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'El PDF supera el tamaño máximo de 10MB.']);
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

    if ($videoFile && $videoFile['error'] !== UPLOAD_ERR_NO_FILE) {
        // Video local de la noticia. Va en api/uploads/año/noticias/matricula.
        if ($videoFile['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Error al recibir el video local.']);
            exit;
        }
        if ($videoFile['size'] > $maxVideoSize) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'El video supera el tamaño máximo de 100MB.']);
            exit;
        }
        $videoExt = strtolower(pathinfo($videoFile['name'], PATHINFO_EXTENSION));
        if (!in_array($videoExt, $allowedVideos, true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'El video debe ser MP4, WEBM, OGG o MOV.']);
            exit;
        }

        $videoDir = __DIR__ . "/uploads/$year/noticias/$matricula";
        if (!is_dir($videoDir) && !mkdir($videoDir, 0777, true)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'No se pudo crear la carpeta del video.']);
            exit;
        }

        $videoFilename = uniqueFilename($videoDir, $videoFile['name']);
        if (strtolower(pathinfo($videoFilename, PATHINFO_EXTENSION)) !== $videoExt) {
            $videoFilename .= ".$videoExt";
        }

        if (!move_uploaded_file($videoFile['tmp_name'], "$videoDir/$videoFilename")) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'No se pudo guardar el video local.']);
            exit;
        }
    }

    if ($galleryFiles && isset($galleryFiles['name']) && is_array($galleryFiles['name'])) {
        // Galería de la noticia: hasta 10 fotos o videos arrastrados desde CrearNoticia.
        $validGalleryIndexes = [];
        foreach ($galleryFiles['name'] as $index => $name) {
            if (($galleryFiles['error'][$index] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                $validGalleryIndexes[] = $index;
            }
        }

        if (count($validGalleryIndexes) > 10) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'La galería permite máximo 10 elementos.']);
            exit;
        }

        $galleryDir = __DIR__ . "/uploads/$year/noticias/galerias/$matricula";
        if (!is_dir($galleryDir) && !mkdir($galleryDir, 0777, true)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'No se pudo crear la carpeta de galería.']);
            exit;
        }

        $galleryFilenames = [];
        foreach ($validGalleryIndexes as $position => $index) {
            if ($galleryFiles['error'][$index] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Error al recibir un archivo de galería.']);
                exit;
            }

            $galleryExt = strtolower(pathinfo($galleryFiles['name'][$index], PATHINFO_EXTENSION));
            $galleryType = in_array($galleryExt, $allowedVideos, true) ? 'video' : 'image';
            if (!in_array($galleryExt, $allowedImages, true) && !in_array($galleryExt, $allowedVideos, true)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'La galería acepta JPG, PNG, WEBP, MP4, WEBM, OGG o MOV.']);
                exit;
            }

            if ($galleryType === 'image' && $galleryFiles['size'][$index] > $maxImageSize) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Una imagen de galería supera el tamaño máximo de 5MB.']);
                exit;
            }

            if ($galleryType === 'video' && $galleryFiles['size'][$index] > $maxVideoSize) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Un video de galería supera el tamaño máximo de 100MB.']);
                exit;
            }

            $galleryFilename = uniqueFilename($galleryDir, $galleryFiles['name'][$index]);
            if (strtolower(pathinfo($galleryFilename, PATHINFO_EXTENSION)) !== $galleryExt) {
                $galleryFilename .= ".$galleryExt";
            }

            if (!move_uploaded_file($galleryFiles['tmp_name'][$index], "$galleryDir/$galleryFilename")) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'No se pudo guardar una imagen de galería.']);
                exit;
            }

            $galleryFilenames[] = [
                'name' => $galleryFilename,
                'type' => $galleryType,
            ];
        }
    }

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

    echo json_encode([
        'success' => true,
        'message' => 'Noticia guardada correctamente.',
        'id' => $id,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
