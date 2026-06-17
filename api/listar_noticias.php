<?php
/*
  Lista noticias para el dashboard, la pantalla pública y el administrador.
  Cuando includeHidden=1 también manda noticias ocultas para prensa.
*/
require_once 'config.php';

function ensureNewsFileColumns($pdo) {
    // Mantiene la tabla compatible con los nombres de archivos usados por noticias.
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

function filePathForNews($matricula, $newsId, $filename) {
    // Arma la ruta web del archivo guardado para una noticia específica.
    if (empty($filename)) {
        return null;
    }

    $safeFilename = basename($filename);
    $patterns = glob(__DIR__ . "/uploads/*/noticias/{$matricula}/{$newsId}/{$safeFilename}");
    if (!$patterns || count($patterns) === 0) {
        $patterns = glob(__DIR__ . "/uploads/*/noticias/{$matricula}/{$safeFilename}");
    }
    if (!$patterns || count($patterns) === 0) {
        return null;
    }
    rsort($patterns);
    $relativePath = str_replace('\\', '/', str_replace(__DIR__, '', $patterns[0]));
    return '/api' . $relativePath;
}

function filePathForNewsRoot($matricula, $filename) {
    // Videos locales: se buscan en api/uploads/año/noticias/matricula/nombre-del-video.ext.
    if (empty($filename)) {
        return null;
    }

    $safeFilename = basename($filename);
    $patterns = glob(__DIR__ . "/uploads/*/noticias/{$matricula}/{$safeFilename}");
    if (!$patterns || count($patterns) === 0) {
        // Compatibilidad con videos guardados antes del cambio de carpeta.
        $patterns = glob(__DIR__ . "/uploads/*/noticias/{$safeFilename}");
    }
    if (!$patterns || count($patterns) === 0) {
        return null;
    }
    rsort($patterns);
    $relativePath = str_replace('\\', '/', str_replace(__DIR__, '', $patterns[0]));
    return '/api' . $relativePath;
}

function galleryPathsForNews($matricula, $galleryJson) {
    if (empty($galleryJson)) {
        return [];
    }

    $filenames = json_decode($galleryJson, true);
    if (!is_array($filenames)) {
        return [];
    }

    $items = [];
    $videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
    foreach ($filenames as $fileItem) {
        // Compatibilidad: antes se guardaba solo "nombre.ext"; ahora guardamos nombre + tipo.
        $filename = is_array($fileItem) ? ($fileItem['name'] ?? '') : $fileItem;
        $savedType = is_array($fileItem) ? ($fileItem['type'] ?? '') : '';
        $safeFilename = basename($filename);
        if (empty($safeFilename)) {
            continue;
        }
        $patterns = glob(__DIR__ . "/uploads/*/noticias/galerias/{$matricula}/{$safeFilename}");
        if (!$patterns || count($patterns) === 0) {
            continue;
        }
        rsort($patterns);
        $extension = strtolower(pathinfo($safeFilename, PATHINFO_EXTENSION));
        $relativePath = str_replace('\\', '/', str_replace(__DIR__, '', $patterns[0]));
        $items[] = [
            'name' => $safeFilename,
            'path' => '/api' . $relativePath,
            'type' => $savedType ?: (in_array($extension, $videoExtensions, true) ? 'video' : 'image'),
        ];
    }

    return $items;
}

try {
    ensureNewsFileColumns($pdo);

    // El usuario normal solo ve status=1; el administrador puede pedir ocultas también.
    $includeHidden = isset($_GET['includeHidden']) && $_GET['includeHidden'] === '1';
    $where = $includeHidden ? 'WHERE n.status <> 0' : 'WHERE n.status = 1';

    $stmt = $pdo->query(
        "SELECT n.id, n.matricula, n.titulo, n.resumen, n.cuerpo, n.url_video,
                n.imagen_nombre, n.pdf_nombre, n.video_nombre, n.galeria_nombres, n.fecha_publicacion, n.vistas, n.status, n.fijada, u.nombre
         FROM noticias n
         JOIN usuarios u ON u.matricula = n.matricula
         {$where}
         ORDER BY n.fijada DESC, n.fecha_publicacion DESC"
    );

    $noticias = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $noticias[] = [
            'id' => (int) $row['id'],
            'matricula' => $row['matricula'],
            'autor' => $row['nombre'],
            'titulo' => $row['titulo'],
            'resumen' => $row['resumen'],
            'contenido' => $row['cuerpo'],
            'imagen' => filePathForNews($row['matricula'], $row['id'], $row['imagen_nombre'] ?? null),
            'imagenName' => $row['imagen_nombre'] ?? null,
            'youtubeUrl' => $row['url_video'] ?? '',
            'fecha' => $row['fecha_publicacion'] ? date('Y-m-d', strtotime($row['fecha_publicacion'])) : null,
            'vistas' => (int) $row['vistas'],
            'visible' => (int) $row['status'] === 1,
            'fijada' => (int) ($row['fijada'] ?? 0) === 1,
            'pdfPath' => filePathForNews($row['matricula'], $row['id'], $row['pdf_nombre'] ?? null),
            'pdfName' => $row['pdf_nombre'] ?? null,
            'videoPath' => filePathForNewsRoot($row['matricula'], $row['video_nombre'] ?? null),
            'videoName' => $row['video_nombre'] ?? null,
            'galeria' => galleryPathsForNews($row['matricula'], $row['galeria_nombres'] ?? null),
        ];
    }

    echo json_encode(['success' => true, 'noticias' => $noticias]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
