<?php
/*
  Obtener todas las noticias que un usuario ha liked.
*/
require_once 'config.php';

$matricula = isset($_GET['matricula']) ? trim($_GET['matricula']) : '';

if (empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Matrícula requerida']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT noticia_id FROM noticias_likes WHERE matricula = :matricula");
    $stmt->execute([':matricula' => $matricula]);
    $likes = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo json_encode([
        'success' => true, 
        'likes' => $likes
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en BD: ' . $e->getMessage()]);
}
?>