<?php
/*
  Obtiene el catálogo de conceptos del tarjetón.
  Filtra por categoría si se especifica.
*/
require_once 'config.php';

$categoria = isset($_GET['categoria']) ? trim($_GET['categoria']) : '';

try {
    if ($categoria === 'aportacion' || $categoria === 'descuento') {
        $stmt = $pdo->prepare("SELECT id, numero, titulo, descripcion FROM conceptos WHERE categoria = :categoria AND activo = 1 ORDER BY CAST(numero AS UNSIGNED)");
        $stmt->execute([':categoria' => $categoria]);
    } else {
        $stmt = $pdo->query("SELECT id, numero, titulo, descripcion, categoria FROM conceptos WHERE activo = 1 ORDER BY categoria, CAST(numero AS UNSIGNED)");
    }
    
    $conceptos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'conceptos' => $conceptos]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}