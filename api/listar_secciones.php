<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->prepare("
        SELECT id, arabigo, romano, nombre, color_principal 
        FROM secciones 
        WHERE status = 2 
        ORDER BY arabigo
    ");
    $stmt->execute();
    $secciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'secciones' => $secciones
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en BD: ' . $e->getMessage()]);
}
?>