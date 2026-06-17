<?php
/*
  Eliminación lógica de noticia.
  En lugar de borrar la fila, deja status=0 para que ya no aparezca.
*/
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? (int) $data['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El id de la noticia es obligatorio.']);
    exit;
}

try {
    $stmt = $pdo->prepare('UPDATE noticias SET status = 0 WHERE id = :id');
    $stmt->execute([':id' => $id]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
