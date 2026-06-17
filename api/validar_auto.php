<?php
/*
  Guarda el dictamen del validador.
  Cambia el status del crédito en la tabla auto y registra quién validó.
*/
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';
$validatorMatricula = isset($data['validatorMatricula']) ? trim($data['validatorMatricula']) : '';
$validatorNombre = isset($data['validatorNombre']) ? trim($data['validatorNombre']) : '';
$estatus = isset($data['estatus']) ? trim($data['estatus']) : '';
$observaciones = isset($data['observaciones']) ? trim($data['observaciones']) : '';

if (empty($matricula) || empty($validatorMatricula) || empty($validatorNombre) || empty($estatus)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios para validar la solicitud.']);
    exit;
}

$estatusMap = [
    // Equivalencia con la tabla auto:
    // 1 preregistro, 2 validado, 3 observaciones, 4 sin concluir, 5 denegado.
    'preregistro' => 1,
    'aprobado' => 2,
    'observaciones' => 3,
    'sinconcluir' => 4,
    'denegado' => 5,
];

if (!array_key_exists($estatus, $estatusMap)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Estatus inválido.']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT id FROM auto WHERE matricula = :matricula LIMIT 1');
    $stmt->execute([':matricula' => $matricula]);
    $record = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$record) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No existe un registro de crédito de auto para esa matrícula.']);
        exit;
    }

    $validatorInfo = sprintf('%s (%s)', $validatorNombre, $validatorMatricula);
    $update = $pdo->prepare(
        'UPDATE auto
         SET valido = :valido,
             observaciones = :observaciones,
             fecha_validado = NOW(),
             status = :status
         WHERE matricula = :matricula'
    );
    $update->execute([
        ':valido' => $validatorInfo,
        ':observaciones' => $observaciones,
        ':status' => $estatusMap[$estatus],
        ':matricula' => $matricula,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Dictamen de validación guardado correctamente.',
        'status' => $estatus,
        'valido' => $validatorInfo,
        'observaciones' => $observaciones,
        'fecha_validado' => date('Y-m-d H:i:s')
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
