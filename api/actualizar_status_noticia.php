<?php
/*
  Publica u oculta una noticia.
  No borra el registro; solo cambia status entre visible y oculto.
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
$visible = isset($data['visible']) && (bool) $data['visible'];

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El id de la noticia es obligatorio.']);
    exit;
}

try {
    ensurePinnedColumn($pdo);

    if ($visible) {
        // Si una noticia fijada vuelve a ser visible, también debe respetar el máximo de 3.
        $newsStmt = $pdo->prepare('SELECT fijada FROM noticias WHERE id = :id AND status <> 0 LIMIT 1');
        $newsStmt->execute([':id' => $id]);
        $news = $newsStmt->fetch(PDO::FETCH_ASSOC);

        if ($news && (int) ($news['fijada'] ?? 0) === 1) {
            $countStmt = $pdo->prepare('SELECT COUNT(*) FROM noticias WHERE fijada = 1 AND status = 1 AND id <> :id');
            $countStmt->execute([':id' => $id]);
            $totalPinned = (int) $countStmt->fetchColumn();

            if ($totalPinned >= 3) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Ya hay 3 noticias fijadas visibles. Desfija una antes de publicar esta.']);
                exit;
            }
        }
    }

    $stmt = $pdo->prepare('UPDATE noticias SET status = :status WHERE id = :id AND status <> 0');
    $stmt->execute([
        ':status' => $visible ? 1 : 2,
        ':id' => $id,
    ]);

    echo json_encode(['success' => true, 'visible' => $visible]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
