<?php
require_once 'config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? (int)$data['id'] : 0;
$estatus = isset($data['estatus']) ? (int)$data['estatus'] : 0;
$observaciones = isset($data['observaciones']) ? trim($data['observaciones']) : '';
$validador_matricula = isset($data['validador_matricula']) ? trim($data['validador_matricula']) : '';

if ($id <= 0 || $estatus <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        UPDATE clausula79bis 
        SET estatus = :estatus, 
            observaciones = :observaciones, 
            validador_matricula = :validador_matricula, 
            fecha_validacion = NOW()
        WHERE id = :id
    ");
    $stmt->execute([
        ':estatus' => $estatus,
        ':observaciones' => $observaciones,
        ':validador_matricula' => $validador_matricula,
        ':id' => $id
    ]);

    echo json_encode(['success' => true, 'message' => 'Validación guardada']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en BD: ' . $e->getMessage()]);
}
?>