<?php
/*
  Restaura una noticia de la papelera (cambia status de 0 a 2 - oculta).
*/
require_once 'config.php';

// Recibir los datos del frontend (React) en formato JSON
$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? (int) $data['id'] : 0;

// Validar que el ID sea valido
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El id de la noticia es obligatorio.']);
    exit;
}

try {
    // Cambiar status de 0 a 2 (oculta)
    // Solo actualiza si la noticia existe y esta eliminada (status = 0)
    $stmt = $pdo->prepare('UPDATE noticias SET status = 2 WHERE id = :id AND status = 0');
    $stmt->execute([':id' => $id]);

    // Verificar si se actualizo alguna fila
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Noticia restaurada correctamente.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se encontró la noticia en la papelera.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}