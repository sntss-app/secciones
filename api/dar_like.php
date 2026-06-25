<?php
/*
  Dar o quitar like a una noticia.
  Toggle: si ya existe el like, lo quita; si no, lo agrega.
*/

// Conectar a la base de datos
require_once 'config.php';

// Recibe los datos del frontend (React) en formato JSON
$data = json_decode(file_get_contents('php://input'), true);
$noticia_id = isset($data['noticia_id']) ? (int)$data['noticia_id'] : 0;  // ID de la noticia
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';     // Matricula del usuario

// Validacion: ambos campos son obligatorios
if (empty($noticia_id) || empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos.']);
    exit;
}

// Verificar que la noticia existe y no esta eliminada (status <> 0)
$checkNoticia = $pdo->prepare("SELECT id FROM noticias WHERE id = :id AND status <> 0");
$checkNoticia->execute([':id' => $noticia_id]);
if (!$checkNoticia->fetch()) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'La noticia no existe o esta eliminada.']);
    exit;
}

try {
    // Verificar si el usuario ya dio like a esta noticia
    $check = $pdo->prepare("SELECT id FROM noticias_likes WHERE noticia_id = :noticia_id AND matricula = :matricula");
    $check->execute([':noticia_id' => $noticia_id, ':matricula' => $matricula]);
    
    if ($check->fetch()) {
        // Si YA existe el like, lo QUITAMOS (toggle off)
        $delete = $pdo->prepare("DELETE FROM noticias_likes WHERE noticia_id = :noticia_id AND matricula = :matricula");
        $delete->execute([':noticia_id' => $noticia_id, ':matricula' => $matricula]);
        $action = 'unliked';  // Accion: quitar like
    } else {
        // Si NO existe, lo AGREGAMOS (toggle on)
        $insert = $pdo->prepare("INSERT INTO noticias_likes (noticia_id, matricula) VALUES (:noticia_id, :matricula)");
        $insert->execute([':noticia_id' => $noticia_id, ':matricula' => $matricula]);
        $action = 'liked';  // Accion: dar like
    }
    
    // Contar cuantos likes tiene la noticia ahora
    $count = $pdo->prepare("SELECT COUNT(*) FROM noticias_likes WHERE noticia_id = :noticia_id");
    $count->execute([':noticia_id' => $noticia_id]);
    $total_likes = (int)$count->fetchColumn();
    
    // Actualizar el contador de likes en la tabla noticias
    // Esto mantiene el campo "likes" sincronizado con la tabla noticias_likes
    $update = $pdo->prepare("UPDATE noticias SET likes = :likes WHERE id = :id");
    $update->execute([':likes' => $total_likes, ':id' => $noticia_id]);
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'action' => $action,           // 'liked' o 'unliked' para que el frontend sepa que hacer
        'likes' => $total_likes        // Total actualizado de likes
    ]);
    
} catch (PDOException $e) {
    // Si algo falla en la base de datos, devolver error 500
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}