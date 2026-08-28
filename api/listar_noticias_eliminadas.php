<?php
/*
  Lista noticias que están en la papelera (status = 0).
  Solo para administradores.
*/
require_once 'config.php';

// Función para armar la ruta de archivos de una noticia
function filePathForNews($matricula, $newsId, $filename) {
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

// Función para armar la ruta de videos locales
function filePathForNewsRoot($matricula, $filename) {
    if (empty($filename)) {
        return null;
    }

    $safeFilename = basename($filename);
    $patterns = glob(__DIR__ . "/uploads/*/noticias/{$matricula}/{$safeFilename}");
    if (!$patterns || count($patterns) === 0) {
        $patterns = glob(__DIR__ . "/uploads/*/noticias/{$safeFilename}");
    }
    if (!$patterns || count($patterns) === 0) {
        return null;
    }
    rsort($patterns);
    $relativePath = str_replace('\\', '/', str_replace(__DIR__, '', $patterns[0]));
    return '/api' . $relativePath;
}

// Función para armar la galería
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
    // 🔥 Solo noticias con status = 0 (eliminadas)
    $where = 'WHERE n.status = 0';

    $stmt = $pdo->query(
        "SELECT n.id, n.matricula, n.titulo, n.resumen, n.cuerpo, n.url_video,
                n.imagen_nombre, n.pdf_nombre, n.video_nombre, n.galeria_nombres, 
                n.fecha_publicacion, n.vistas, n.status, n.fijada, n.likes,
                u.nombre
         FROM noticias n
         JOIN usuarios u ON u.matricula = n.matricula
         {$where}
         ORDER BY n.fecha_publicacion DESC"
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
            'visible' => false,
            'fijada' => false,
            'likes' => (int) ($row['likes'] ?? 0),
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