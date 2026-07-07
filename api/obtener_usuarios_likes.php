<?php
/*
  Obtener los usuarios que han dado like a una noticia específica.
  Devuelve nombres y matrículas de los usuarios que dieron like.
*/
require_once 'config.php';

$noticia_id = isset($_GET['noticia_id']) ? (int)$_GET['noticia_id'] : 0;

if ($noticia_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de noticia requerido']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT u.matricula, REPLACE(u.nombre, '/', ' ') AS nombre
        FROM noticias_likes nl
        JOIN usuarios u ON nl.matricula = u.matricula
        WHERE nl.noticia_id = :noticia_id
        ORDER BY nl.fecha_hora DESC  /* ← CAMBIADO de fecha_like a fecha_hora */
        LIMIT 50
    ");
    $stmt->execute([':noticia_id' => $noticia_id]);
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'usuarios' => $usuarios,
        'total' => count($usuarios)
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en BD: ' . $e->getMessage()]);
}
?>