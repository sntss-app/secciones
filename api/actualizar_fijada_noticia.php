<?php
/*
  Fija o desfija una noticia en la parte superior.
  Permite máximo 3 noticias fijadas para que la portada no se sature.
*/
require_once 'config.php';

function ensurePinnedColumn($pdo) {
    $columns = [];
    $stmt = $pdo->query("SHOW COLUMNS FROM noticias");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $columns[$row['Field']] = true;
    }

    if (empty($columns['fijada'])) {
        $pdo->exec("ALTER TABLE noticias ADD COLUMN fijada tinyint DEFAULT '0' AFTER status");
    }
}

$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? (int) $data['id'] : 0;
$fijada = isset($data['fijada']) && (bool) $data['fijada'];

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El id de la noticia es obligatorio.']);
    exit;
}

try {
    ensurePinnedColumn($pdo);

    if ($fijada) {
        $countStmt = $pdo->prepare('SELECT COUNT(*) FROM noticias WHERE fijada = 1 AND status = 1 AND id <> :id');
        $countStmt->execute([':id' => $id]);
        $totalPinned = (int) $countStmt->fetchColumn();

        if ($totalPinned >= 3) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Solo puedes fijar hasta 3 noticias. Desfija una antes de fijar otra.']);
            exit;
        }
    }

    $stmt = $pdo->prepare('UPDATE noticias SET fijada = :fijada WHERE id = :id AND status <> 0');
    $stmt->execute([
        ':fijada' => $fijada ? 1 : 0,
        ':id' => $id,
    ]);

    echo json_encode(['success' => true, 'fijada' => $fijada]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
