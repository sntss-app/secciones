<?php
require_once 'config.php';

header('Content-Type: application/json');

$estatus = isset($_GET['estatus']) ? (int)$_GET['estatus'] : 0;
$matricula = isset($_GET['matricula']) ? trim($_GET['matricula']) : '';

try {
    $sql = "SELECT * FROM clausula79bis WHERE 1=1";
    $params = [];

    if ($estatus > 0) {
        $sql .= " AND estatus = :estatus";
        $params[':estatus'] = $estatus;
    }

    if (!empty($matricula)) {
        $sql .= " AND matricula LIKE :matricula";
        $params[':matricula'] = "%$matricula%";
    }

    $sql .= " ORDER BY fecha_registro DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'registros' => $registros,
        'total' => count($registros)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en BD: ' . $e->getMessage()]);
}
?>