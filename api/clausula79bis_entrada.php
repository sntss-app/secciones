<?php
/*
  Registrar entrada para Cláusula 79Bis
  Trabajador o Acompañante
*/
require_once 'config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? (int)$data['id'] : 0;
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';
$tipo = isset($data['tipo']) ? trim($data['tipo']) : ''; // 'trabajador' o 'acompanante'

if ($id <= 0 || empty($matricula) || empty($tipo)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

try {
    // Verificar que el registro existe
    $check = $pdo->prepare("SELECT id, estatus, tiene_acompanante, entrada_trabajador, entrada_acompanante FROM clausula79bis WHERE id = :id AND matricula = :matricula");
    $check->execute([':id' => $id, ':matricula' => $matricula]);
    $registro = $check->fetch(PDO::FETCH_ASSOC);

    if (!$registro) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Registro no encontrado']);
        exit;
    }

    // Verificar que esté aprobado (estatus 2)
    if ($registro['estatus'] != 2) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El registro no está aprobado']);
        exit;
    }

    $hora = date('Y-m-d H:i:s');

    if ($tipo === 'trabajador') {
        // Verificar si ya tiene entrada
        if ($registro['entrada_trabajador']) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'El trabajador ya registró su entrada']);
            exit;
        }

        // Registrar entrada del trabajador
        $stmt = $pdo->prepare("UPDATE clausula79bis SET entrada_trabajador = :hora WHERE id = :id");
        $stmt->execute([':hora' => $hora, ':id' => $id]);

        echo json_encode([
            'success' => true,
            'message' => 'Entrada de trabajador registrada',
            'hora' => $hora
        ]);

    } elseif ($tipo === 'acompanante') {
        // Verificar que tenga acompañante
        if ($registro['tiene_acompanante'] != 1) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Este registro no tiene acompañante']);
            exit;
        }

        // Verificar si ya tiene entrada
        if ($registro['entrada_acompanante']) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'El acompañante ya registró su entrada']);
            exit;
        }

        // Registrar entrada del acompañante
        $stmt = $pdo->prepare("UPDATE clausula79bis SET entrada_acompanante = :hora WHERE id = :id");
        $stmt->execute([':hora' => $hora, ':id' => $id]);

        echo json_encode([
            'success' => true,
            'message' => 'Entrada de acompañante registrada',
            'hora' => $hora
        ]);

    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Tipo de entrada inválido']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en BD: ' . $e->getMessage()]);
}
?>