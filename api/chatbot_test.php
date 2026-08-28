<?php
// api/chatbot_test.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';

$query = $_GET['q'] ?? '';

if (strlen($query) < 3) {
    echo json_encode(['error' => 'Mínimo 3 caracteres']);
    exit;
}

try {
    $like = '%' . $query . '%';
    $sql = "SELECT titulo, contenido FROM nodos_estatutos 
            WHERE status = 1 AND contenido LIKE ? 
            LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$like]);
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($resultado) {
        echo json_encode([
            'success' => true,
            'titulo' => $resultado['titulo'],
            'contenido' => $resultado['contenido']
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No encontrado'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}