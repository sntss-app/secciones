<?php
/*
  Dar o quitar like a una noticia.
  Toggle: si ya existe el like, lo quita; si no, lo agrega.
*/
require_once 'config.php';

// Obtener datos del request
$data = json_decode(file_get_contents('php://input'), true);
$noticia_id = isset($data['noticia_id']) ? (int)$data['noticia_id'] : 0;
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';

// Validar datos
if (empty($noticia_id) || empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos.']);
    exit;
}

// Validar que la noticia existe
$checkNoticia = $pdo->prepare("SELECT id FROM noticias WHERE id = :id AND status <> 0");
$checkNoticia->execute([':id' => $noticia_id]);
if (!$checkNoticia->fetch()) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'La noticia no existe o está eliminada.']);
    exit;
}

try {
    // Verificar si ya existe el like
    $check = $pdo->prepare("SELECT id FROM noticias_likes WHERE noticia_id = :noticia_id AND matricula = :matricula");
    $check->execute([':noticia_id' => $noticia_id, ':matricula' => $matricula]);
    
    if ($check->fetch()) {
        // Si ya existe, quitar el like
        $delete = $pdo->prepare("DELETE FROM noticias_likes WHERE noticia_id = :noticia_id AND matricula = :matricula");
        $delete->execute([':noticia_id' => $noticia_id, ':matricula' => $matricula]);
        $action = 'unliked';
    } else {
        // Si no existe, agregar like
        $insert = $pdo->prepare("INSERT INTO noticias_likes (noticia_id, matricula) VALUES (:noticia_id, :matricula)");
        $insert->execute([':noticia_id' => $noticia_id, ':matricula' => $matricula]);
        $action = 'liked';
    }
    
    // Obtener el total de likes actualizado
    $count = $pdo->prepare("SELECT COUNT(*) FROM noticias_likes WHERE noticia_id = :noticia_id");
    $count->execute([':noticia_id' => $noticia_id]);
    $total_likes = (int)$count->fetchColumn();
    
    // Actualizar la columna likes en noticias
    $update = $pdo->prepare("UPDATE noticias SET likes = :likes WHERE id = :id");
    $update->execute([':likes' => $total_likes, ':id' => $noticia_id]);
    
    echo json_encode([
        'success' => true,
        'action' => $action,
        'likes' => $total_likes
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>