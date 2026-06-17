<?php
/*
  Lista todas las solicitudes de crédito de auto.
  Lo usa el panel del validador para ver expedientes pendientes o dictaminados.
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

try {
    $stmt = $pdo->query(
        'SELECT a.id, a.matricula, a.fecha_registro, a.status, a.valido, a.observaciones, a.fecha_validado,
                u.nombre, u.categoria, u.antiguedad
         FROM auto a
         JOIN usuarios u ON u.matricula = a.matricula
         ORDER BY a.fecha_registro DESC'
    );

    $requests = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $requests[] = [
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
    }

    echo json_encode(['success' => true, 'requests' => $requests]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
