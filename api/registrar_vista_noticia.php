<?php
/*
  Suma una vista a una noticia visible.
  Se llama cuando el usuario abre el detalle en Noticias.jsx.
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
    $stmt = $pdo->prepare('UPDATE noticias SET vistas = vistas + 1 WHERE id = :id AND status = 1');
    $stmt->execute([':id' => $id]);

    $viewStmt = $pdo->prepare('SELECT vistas FROM noticias WHERE id = :id LIMIT 1');
    $viewStmt->execute([':id' => $id]);
    $row = $viewStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'vistas' => $row ? (int) $row['vistas'] : null]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
