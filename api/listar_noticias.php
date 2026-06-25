<?php
/*
  Lista noticias para el dashboard, la pantalla publica y el administrador.
  Cuando includeHidden=1 tambien manda noticias ocultas para prensa.
*/

// Conectar a la base de datos
require_once 'config.php';

/**
 * Funcion que asegura que la tabla noticias tenga todas las columnas necesarias
 * para guardar los nombres de los archivos (imagen, PDF, video, galeria, fijada, likes).
 * Si alguna columna falta, la crea automaticamente.
 */
function ensureNewsFileColumns($pdo) {
    // Obtener todas las columnas de la tabla noticias
    $columns = [];
    $stmt = $pdo->query("SHOW COLUMNS FROM noticias");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $columns[$row['Field']] = true;
    }

    // Si falta alguna columna, crearla
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

    // Columna para los likes (agregada recientemente)
    if (empty($columns['likes'])) {
        $pdo->exec("ALTER TABLE noticias ADD COLUMN likes INT(11) NOT NULL DEFAULT 0 AFTER vistas");
    }
}

/**
 * Arma la ruta web de un archivo guardado para una noticia especifica.
 * Busca en: /uploads/*/noticias/{matricula}/{newsId}/{filename}
 * Si no lo encuentra, busca en: /uploads/*/noticias/{matricula}/{filename}
 */
function filePathForNews($matricula, $newsId, $filename) {
    if (empty($filename)) {
        return null;
    }

    $safeFilename = basename($filename);
    // Primero busca en la carpeta con el ID de la noticia
    $patterns = glob(__DIR__ . "/uploads/*/noticias/{$matricula}/{$newsId}/{$safeFilename}");
    if (!$patterns || count($patterns) === 0) {
        // Si no lo encuentra, busca en la raiz de la matricula (para compatibilidad)
        $patterns = glob(__DIR__ . "/uploads/*/noticias/{$matricula}/{$safeFilename}");
    }
    if (!$patterns || count($patterns) === 0) {
        return null;
    }
    rsort($patterns);
    $relativePath = str_replace('\\', '/', str_replace(__DIR__, '', $patterns[0]));
    return '/api' . $relativePath;
}

/**
 * Arma la ruta web de un video local guardado para una noticia.
 * Los videos se guardan en: /uploads/*/noticias/{matricula}/{filename}
 * (no usan la carpeta con ID de noticia como otros archivos)
 */
function filePathForNewsRoot($matricula, $filename) {
    if (empty($filename)) {
        return null;
    }

    $safeFilename = basename($filename);
    // Buscar en la carpeta de la matricula
    $patterns = glob(__DIR__ . "/uploads/*/noticias/{$matricula}/{$safeFilename}");
    if (!$patterns || count($patterns) === 0) {
        // Compatibilidad con videos guardados antes del cambio de carpeta
        $patterns = glob(__DIR__ . "/uploads/*/noticias/{$safeFilename}");
    }
    if (!$patterns || count($patterns) === 0) {
        return null;
    }
    rsort($patterns);
    $relativePath = str_replace('\\', '/', str_replace(__DIR__, '', $patterns[0]));
    return '/api' . $relativePath;
}

/**
 * Procesa el JSON de la galeria y devuelve un array con las rutas de cada archivo.
 * La galeria se guarda como JSON en la columna galeria_nombres.
 * Cada archivo puede ser imagen o video.
 */
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
        // Compatibilidad: antes se guardaba solo "nombre.ext"; ahora guardamos nombre + tipo
        $filename = is_array($fileItem) ? ($fileItem['name'] ?? '') : $fileItem;
        $savedType = is_array($fileItem) ? ($fileItem['type'] ?? '') : '';
        $safeFilename = basename($filename);
        if (empty($safeFilename)) {
            continue;
        }
        // Buscar el archivo en la carpeta de galerias
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
    // Asegurar que la tabla tenga las columnas necesarias
    ensureNewsFileColumns($pdo);

    // El usuario normal solo ve status=1; el administrador puede pedir ocultas con includeHidden=1
    $includeHidden = isset($_GET['includeHidden']) && $_GET['includeHidden'] === '1';
    $where = $includeHidden ? 'WHERE n.status <> 0' : 'WHERE n.status = 1';

    // Consulta principal: obtener todas las noticias con JOIN a usuarios para el nombre del autor
    $stmt = $pdo->query(
        "SELECT n.id, n.matricula, n.titulo, n.resumen, n.cuerpo, n.url_video,
                n.imagen_nombre, n.pdf_nombre, n.video_nombre, n.galeria_nombres, 
                n.fecha_publicacion, n.vistas, n.status, n.fijada, n.likes,
                u.nombre
         FROM noticias n
         JOIN usuarios u ON u.matricula = n.matricula
         {$where}
         ORDER BY n.fijada DESC, n.fecha_publicacion DESC" // Fijadas primero, luego por fecha
    );

    // Recorrer los resultados y construir el array de noticias
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
            'likes' => (int) ($row['likes'] ?? 0),
            'pdfPath' => filePathForNews($row['matricula'], $row['id'], $row['pdf_nombre'] ?? null),
            'pdfName' => $row['pdf_nombre'] ?? null,
            'videoPath' => filePathForNewsRoot($row['matricula'], $row['video_nombre'] ?? null),
            'videoName' => $row['video_nombre'] ?? null,
            'galeria' => galleryPathsForNews($row['matricula'], $row['galeria_nombres'] ?? null),
        ];
    }

    // Devolver las noticias en formato JSON
    echo json_encode(['success' => true, 'noticias' => $noticias]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}