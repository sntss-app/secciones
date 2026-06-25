<?php
/*
  Eliminación lógica de noticia.
  En lugar de borrar la fila, deja status=0 para que ya no aparezca.
*/

// Conectar a la base de datos
require_once 'config.php';

// Recibe los datos del frontend (React) en formato JSON
$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? (int) $data['id'] : 0;  // ID de la noticia a eliminar

// Validacion: el ID es obligatorio
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El id de la noticia es obligatorio.']);
    exit;
}

try {
    // "Eliminar" la noticia cambiando su status a 0
    // No se borra fisicamente de la base de datos, solo se oculta
    // status = 0 significa "eliminada" (no se muestra en ningun lado)
    $stmt = $pdo->prepare('UPDATE noticias SET status = 0 WHERE id = :id');
    $stmt->execute([':id' => $id]);

    // Respuesta exitosa (sin datos adicionales)
    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    // Si algo falla en la base de datos, devolver error 500
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}