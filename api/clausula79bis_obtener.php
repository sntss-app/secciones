<?php
require_once 'config.php';

header('Content-Type: application/json');

$matricula = isset($_GET['matricula']) ? trim($_GET['matricula']) : '';

if (empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Matrícula requerida']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM clausula79bis WHERE matricula = :matricula");
    $stmt->execute([':matricula' => $matricula]);
    $registro = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($registro) {
        echo json_encode(['success' => true, 'registro' => $registro]);
    } else {
        echo json_encode(['success' => true, 'registro' => null, 'message' => 'Sin registro']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en BD: ' . $e->getMessage()]);
}
?>