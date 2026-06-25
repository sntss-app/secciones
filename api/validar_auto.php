<?php
/*
  Guarda el dictamen del validador.
  Cambia el status del credito en la tabla auto y registra quien valido.
*/

// Conectar a la base de datos
require_once 'config.php';

// Recibir los datos del frontend (React) en formato JSON
$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? (int)$data['id'] : 0;                                // ID del registro en la tabla auto
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';          // Matricula del solicitante
$validatorMatricula = isset($data['validatorMatricula']) ? trim($data['validatorMatricula']) : ''; // Matricula del validador
$validatorNombre = isset($data['validatorNombre']) ? trim($data['validatorNombre']) : '';          // Nombre del validador
$estatus = isset($data['estatus']) ? trim($data['estatus']) : '';                // Nuevo estatus (texto)
$observaciones = isset($data['observaciones']) ? trim($data['observaciones']) : ''; // Observaciones (opcional)

// Validar que lleguen todos los datos obligatorios
if (empty($matricula) || empty($validatorMatricula) || empty($validatorNombre) || empty($estatus)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios para validar la solicitud.']);
    exit;
}

// Mapeo de estatus en texto a numeros para guardar en la base de datos
$estatusMap = [
    'preregistro' => 1,   // Recien registrado
    'aprobado' => 2,      // Validado y aceptado
    'observaciones' => 3, // Tiene correcciones que hacer
    'sinconcluir' => 4,   // Incompleto
    'denegado' => 5,      // Rechazado
];

// Si el estatus no es valido, devolver error
if (!array_key_exists($estatus, $estatusMap)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Estatus invalido.']);
    exit;
}

try {
    // Buscar el registro de auto para esta matricula
    // Si llega ID, lo usa; si no, busca por matricula
    if ($id > 0) {
        $stmt = $pdo->prepare('SELECT id, matricula FROM auto WHERE id = :id AND matricula = :matricula LIMIT 1');
        $stmt->execute([':id' => $id, ':matricula' => $matricula]);
    } else {
        $stmt = $pdo->prepare('SELECT id, matricula FROM auto WHERE matricula = :matricula LIMIT 1');
        $stmt->execute([':matricula' => $matricula]);
    }
    $record = $stmt->fetch(PDO::FETCH_ASSOC);

    // Si no existe el registro, avisar
    if (!$record) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No existe un registro de credito de auto para esa matricula.']);
        exit;
    }

    // Guardar informacion del validador: "Nombre (Matricula)"
    $validatorInfo = sprintf('%s (%s)', $validatorNombre, $validatorMatricula);

    // Actualizar el registro con el nuevo estatus y la informacion del validador
    $update = $pdo->prepare(
        'UPDATE auto
         SET valido = :valido,                // Quien valido
             observaciones = :observaciones,  // Notas del validador
             fecha_validado = NOW(),          // Fecha y hora de la validacion
             status = :status                // Nuevo estatus (numero)
         WHERE id = :id'
    );
    $update->execute([
        ':valido' => $validatorInfo,
        ':observaciones' => $observaciones,
        ':status' => $estatusMap[$estatus],
        ':id' => (int)$record['id'],
    ]);

    // Respuesta exitosa con los datos actualizados
    echo json_encode([
        'success' => true,
        'message' => 'Dictamen de validacion guardado correctamente.',
        'status' => $estatus,
        'valido' => $validatorInfo,
        'observaciones' => $observaciones,
        'fecha_validado' => date('Y-m-d H:i:s')
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}