<?php
/*
  Publica u oculta una noticia.
  No borra el registro; solo cambia status entre visible y oculto.
*/

// Conectar a la base de datos
require_once 'config.php';

/**
 * Funcion que asegura que la columna "fijada" exista en la tabla noticias.
 * Si no existe, la crea para evitar errores.
 */
function ensurePinnedColumn($pdo) {
    // Obtiene todas las columnas de la tabla noticias
    $columns = [];
    $stmt = $pdo->query("SHOW COLUMNS FROM noticias");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $columns[$row['Field']] = true;
    }

    // Si falta la columna "fijada", la agrega
    if (empty($columns['fijada'])) {
        $pdo->exec("ALTER TABLE noticias ADD COLUMN fijada tinyint DEFAULT '0' AFTER status");
    }
}

// Recibe los datos del frontend (React) en formato JSON
$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? (int) $data['id'] : 0;          // ID de la noticia
$visible = isset($data['visible']) && (bool) $data['visible']; // true = publicar, false = ocultar

// Si no llega el ID, no podemos hacer nada
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El id de la noticia es obligatorio.']);
    exit;
}

try {
    // Asegura que la columna "fijada" exista
    ensurePinnedColumn($pdo);

    // Si el usuario quiere PUBLICAR la noticia (hacerla visible)
    if ($visible) {
        // Verifica si la noticia esta fijada
        $newsStmt = $pdo->prepare('SELECT fijada FROM noticias WHERE id = :id AND status <> 0 LIMIT 1');
        $newsStmt->execute([':id' => $id]);
        $news = $newsStmt->fetch(PDO::FETCH_ASSOC);

        // Si esta fijada y la queremos publicar, validamos que no haya mas de 3 fijadas visibles
        if ($news && (int) ($news['fijada'] ?? 0) === 1) {
            $countStmt = $pdo->prepare('SELECT COUNT(*) FROM noticias WHERE fijada = 1 AND status = 1 AND id <> :id');
            $countStmt->execute([':id' => $id]);
            $totalPinned = (int) $countStmt->fetchColumn();

            // Si ya hay 3 fijadas visibles, no permite publicar esta
            if ($totalPinned >= 3) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Ya hay 3 noticias fijadas visibles. Desfija una antes de publicar esta.']);
                exit;
            }
        }
    }

    // Actualiza el status de la noticia
    // status = 1 = visible, status = 2 = oculta
    // NOTA: Solo actualiza si la noticia NO esta eliminada (status <> 0)
    $stmt = $pdo->prepare('UPDATE noticias SET status = :status WHERE id = :id AND status <> 0');
    $stmt->execute([
        ':status' => $visible ? 1 : 2,
        ':id' => $id,
    ]);

    // Respuesta exitosa: devuelve el nuevo estado de visibilidad
    echo json_encode(['success' => true, 'visible' => $visible]);

} catch (PDOException $e) {
    // Si algo falla en la base de datos, devuelve error 500
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}