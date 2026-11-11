<?php
/*
  Script para verificar los datos de correo y teléfono en la tabla secciones
*/
require_once 'config.php';

try {
    $stmt = $pdo->prepare("
        SELECT 
            id,
            romano,
            nombre,
            correo,
            telefono,
            status
        FROM secciones
        ORDER BY id ASC
    ");
    $stmt->execute();
    $secciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'total_secciones' => count($secciones),
        'secciones' => $secciones
    ], JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
