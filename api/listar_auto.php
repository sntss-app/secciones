<?php
/*
  Lista todas las solicitudes de credito de auto.
  Lo usa el panel del validador para ver expedientes pendientes o dictaminados.
*/

// Conectar a la base de datos
require_once 'config.php';

/**
 * Funcion que convierte el numero de status a un texto mas amigable.
 * La base de datos guarda numeros (1, 2, 3, 4, 5), pero el frontend trabaja mejor con palabras.
 * 
 * 1 = preregistro  (recien registrado, esperando validacion)
 * 2 = aprobado     (validado y aceptado)
 * 3 = observaciones (tiene correcciones que hacer)
 * 4 = sinconcluir  (incompleto, falta informacion)
 * 5 = denegado     (rechazado)
 */
function mapStatus($status) {
    $map = [
        1 => 'preregistro',
        2 => 'aprobado',
        3 => 'observaciones',
        4 => 'sinconcluir',
        5 => 'denegado',
    ];
    return $map[(int)$status] ?? 'preregistro';
}

/**
 * Busca la ruta de un documento subido para una solicitud de auto.
 * Los documentos se guardan como: /uploads/*/auto/{matricula}/{documentId}.*
 * El * es el año (ej: 2026)
 * El documentId es 1 para tarjeton, 2 para INE
 */
function findDocumentPath($matricula, $documentId) {
    // Busca cualquier archivo que coincida con el patron
    $patterns = glob(__DIR__ . "/uploads/*/auto/{$matricula}/{$documentId}.*");
    if (!$patterns || count($patterns) === 0) {
        return null; // No encontro el documento
    }
    // Ordena y toma el mas reciente
    rsort($patterns);
    $fullPath = $patterns[0];
    $relativePath = str_replace('\\', '/', str_replace(__DIR__, '', $fullPath));
    return '/api' . $relativePath; // Devuelve la ruta para que el frontend pueda acceder
}

try {
    // Consulta todas las solicitudes de credito de auto
    // JOIN con usuarios para obtener los datos del solicitante
    $stmt = $pdo->query(
        'SELECT a.id, a.matricula, a.fecha_registro, a.status, a.valido, a.observaciones, a.fecha_validado,
                u.nombre, u.adscripcion, u.categoria, u.antiguedad
         FROM auto a
         JOIN usuarios u ON u.matricula = a.matricula
         ORDER BY a.fecha_registro DESC'  // Las mas recientes primero
    );

    $requests = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $requests[] = [
            'id' => isset($row['id']) ? (int)$row['id'] : null,
            'matricula' => $row['matricula'] ?? '',
            'nombre' => $row['nombre'] ?? 'Sin nombre',
            'adscripcion' => $row['adscripcion'] ?? 'N/A',
            'categoria' => $row['categoria'] ?? 'N/A',
            'antiguedad' => $row['antiguedad'] ?? '',
            'estatus' => mapStatus($row['status']), // Convertir numero a texto
            'fecha' => $row['fecha_registro'] ? date('Y-m-d', strtotime($row['fecha_registro'])) : null,
            'observaciones' => $row['observaciones'],
            'valido' => $row['valido'], // Quien valido la solicitud
            'fecha_validado' => $row['fecha_validado'] ? date('Y-m-d', strtotime($row['fecha_validado'])) : null,
            'tarjetonName' => 'Tarjeton de Pago',
            'ineName' => 'Identificacion Oficial INE',
            'tarjetonPath' => findDocumentPath($row['matricula'], 1), // Ruta del tarjeton
            'inePath' => findDocumentPath($row['matricula'], 2),      // Ruta del INE
        ];
    }

    // Respuesta exitosa con la lista de solicitudes
    echo json_encode(['success' => true, 'requests' => $requests]);

} catch (PDOException $e) {
    // Si algo falla en la base de datos, devolver error 500
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}