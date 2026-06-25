<?php
/*
  Fija o desfija una noticia en la parte superior.
  Permite máximo 3 noticias fijadas para que la portada no se sature.
*/

// Conexión a la base de datos (config.php tiene las credenciales)
require_once 'config.php';

/**
 * Función que se asegura de que la columna "fijada" exista en la tabla noticias.
 * Si no existe, la crea automáticamente para evitar errores en el sistema.
 */
function ensurePinnedColumn($pdo) {
    // 1. Pregunta a la base de datos qué columnas tiene la tabla "noticias"
    $columns = [];
    $stmt = $pdo->query("SHOW COLUMNS FROM noticias");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $columns[$row['Field']] = true;
    }

    // 2. Si la columna "fijada" NO existe, la crea con valor por defecto 0 (no fijada)
    if (empty($columns['fijada'])) {
        $pdo->exec("ALTER TABLE noticias ADD COLUMN fijada tinyint DEFAULT '0' AFTER status");
    }
}

// Recibe los datos que envió el frontend (React) en formato JSON
$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? (int) $data['id'] : 0;          // ID de la noticia
$fijada = isset($data['fijada']) && (bool) $data['fijada']; // true = fijar, false = desfijar

// Validación: si no llega el ID, no podemos hacer nada
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El id de la noticia es obligatorio.']);
    exit;
}

try {
    // 🔧 Asegura que la columna "fijada" existe antes de hacer cualquier cosa
    ensurePinnedColumn($pdo);

    // Si el usuario quiere FIJAR la noticia, validamos que no haya más de 3 fijadas
    if ($fijada) {
        // Contamos cuántas noticias están actualmente fijadas (excluyendo la que vamos a modificar)
        $countStmt = $pdo->prepare('SELECT COUNT(*) FROM noticias WHERE fijada = 1 AND status = 1 AND id <> :id');
        $countStmt->execute([':id' => $id]);
        $totalPinned = (int) $countStmt->fetchColumn();

        // Si ya hay 3 fijadas, no dejamos fijar otra más
        if ($totalPinned >= 3) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Solo puedes fijar hasta 3 noticias. Desfija una antes de fijar otra.']);
            exit;
        }
    }

    // Actualiza la columna "fijada" en la noticia específica (1 = fijada, 0 = no fijada)
    // NOTA: Solo actualiza si la noticia NO está eliminada (status <> 0)
    $stmt = $pdo->prepare('UPDATE noticias SET fijada = :fijada WHERE id = :id AND status <> 0');
    $stmt->execute([
        ':fijada' => $fijada ? 1 : 0,
        ':id' => $id,
    ]);

    // Respuesta exitosa: devuelve el nuevo estado de "fijada"
    echo json_encode(['success' => true, 'fijada' => $fijada]);

} catch (PDOException $e) {
    // Si algo sale mal con la base de datos, devolvemos un error 500
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}