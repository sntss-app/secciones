<?php
/*
  Obtiene el credito de auto de una sola matricula.
  Lo usa el Dashboard, RegistroCredito y EstatusCredito al cargar o recargar sesion.
*/

// Conectar a la base de datos
require_once 'config.php';

/**
 * Convierte el numero de status a texto para que React lo entienda mejor
 * La base de datos guarda numeros, pero el frontend trabaja mejor con palabras
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
 * Busca la ruta de un documento subido para una solicitud de auto
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
    $fullPath = $patterns[0];
    $relativePath = str_replace('\\', '/', str_replace(__DIR__, '', $fullPath));
    return '/api' . $relativePath;
}

// Obtener la matricula desde la URL (GET)
$matricula = isset($_GET['matricula']) ? trim($_GET['matricula']) : '';

// Si no llega la matricula, no se puede continuar
if (empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La matricula es obligatoria.']);
    exit;
}

try {
    // Consultar el credito de auto para la matricula especifica
    // JOIN con usuarios para obtener los datos del solicitante (nombre, categoria, antiguedad)
    $stmt = $pdo->prepare(
        'SELECT a.id, a.matricula, a.fecha_registro, a.status, a.valido, a.observaciones, a.fecha_validado,
                u.nombre, u.categoria, u.antiguedad
         FROM auto a
         JOIN usuarios u ON u.matricula = a.matricula
         WHERE a.matricula = :matricula
         LIMIT 1' // Solo una solicitud por usuario
    );
    $stmt->execute([':matricula' => $matricula]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    // Si no hay registro, avisar
    if (!$row) {
        echo json_encode(['success' => false, 'message' => 'No existe un registro de credito de auto para esta matricula.']);
        exit;
    }

    // Armar el array con los datos del credito para el frontend
    $credit = [
        'id' => isset($row['id']) ? (int)$row['id'] : null,
        'matricula' => $row['matricula'],
        'nombre' => $row['nombre'],
        'categoria' => $row['categoria'] ?? '',
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

    // Respuesta exitosa con los datos del credito
    echo json_encode(['success' => true, 'credit' => $credit]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}