<?php
/*
  Obtener todas las noticias que un usuario ha liked.
*/

// Conectar a la base de datos
require_once 'config.php';

// Obtener la matricula del usuario desde la URL (GET)
$matricula = isset($_GET['matricula']) ? trim($_GET['matricula']) : '';

// Si no llega la matricula, no se puede continuar
if (empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Matricula requerida']);
    exit;
}

try {
    // Consultar todos los likes del usuario en la tabla noticias_likes
    // Solo trae los IDs de las noticias (FETCH_COLUMN devuelve un array simple)
    $stmt = $pdo->prepare("SELECT noticia_id FROM noticias_likes WHERE matricula = :matricula");
    $stmt->execute([':matricula' => $matricula]);
    $likes = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Respuesta: devuelve un array con los IDs de las noticias que le gustan al usuario
    // Ejemplo: [1, 3, 5, 7] = al usuario le gustan las noticias 1, 3, 5 y 7
    echo json_encode([
        'success' => true, 
        'likes' => $likes
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en BD: ' . $e->getMessage()]);
}