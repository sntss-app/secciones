<?php
/*
  Obtiene el crédito de auto de una sola matrícula.
  Lo usa el Dashboard, RegistroCredito y EstatusCredito al cargar o recargar sesión.
*/
require_once 'config.php';

function mapStatus($status) {
    // La BD guarda números; React trabaja mejor con palabras claras.
    $map = [
        1 => 'preregistro',
        2 => 'aprobado',
        3 => 'observaciones',
        4 => 'sinconcluir',
        5 => 'denegado',
    ];
    return $map[(int)$status] ?? 'preregistro';
}

function findDocumentPath($matricula, $documentId) {
    // Busca el archivo subido sin importar el año exacto de la carpeta.
    $patterns = glob(__DIR__ . "/uploads/*/auto/{$matricula}/{$documentId}.*");
    if (!$patterns || count($patterns) === 0) {
        return null;
    }
    $fullPath = $patterns[0];
    $relativePath = str_replace('\\', '/', str_replace(__DIR__, '', $fullPath));
    return '/api' . $relativePath;
}

$matricula = isset($_GET['matricula']) ? trim($_GET['matricula']) : '';
if (empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La matrícula es obligatoria.']);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'SELECT a.id, a.matricula, a.fecha_registro, a.status, a.valido, a.observaciones, a.fecha_validado,
                u.nombre, u.categoria, u.antiguedad
         FROM auto a
         JOIN usuarios u ON u.matricula = a.matricula
         WHERE a.matricula = :matricula
         LIMIT 1'
    );
    $stmt->execute([':matricula' => $matricula]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        echo json_encode(['success' => false, 'message' => 'No existe un registro de crédito de auto para esta matrícula.']);
        exit;
    }

    $credit = [
        'id' => isset($row['id']) ? (int)$row['id'] : null,
        'matricula' => $row['matricula'],
        'nombre' => $row['nombre'],
        'categoria' => $row['categoria'] ?? '',
        'antiguedad' => $row['antiguedad'] ?? '',
        'estatus' => mapStatus($row['status']),
        'fecha' => $row['fecha_registro'] ? date('Y-m-d', strtotime($row['fecha_registro'])) : null,
        'observaciones' => $row['observaciones'],
        'valido' => $row['valido'],
        'fecha_validado' => $row['fecha_validado'] ? date('Y-m-d', strtotime($row['fecha_validado'])) : null,
        'tarjetonName' => 'Tarjetón de Pago',
        'ineName' => 'Identificación Oficial INE',
        'tarjetonPath' => findDocumentPath($row['matricula'], 1),
        'inePath' => findDocumentPath($row['matricula'], 2),
    ];

    echo json_encode(['success' => true, 'credit' => $credit]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
