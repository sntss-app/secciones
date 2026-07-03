<?php
/*
  Perfil completo del trabajador.
  Lee datos actuales de usuarios, calcula edad desde CURP y busca documentos
  subidos durante el registro inicial.
*/
require_once 'config.php';

function calcularEdadDesdeCurp($curp) {
    if (!$curp || strlen($curp) < 10) {
        return null;
    }

    $fecha = substr($curp, 4, 6);
    if (!preg_match('/^\d{6}$/', $fecha)) {
        return null;
    }

    $yy = (int) substr($fecha, 0, 2);
    $mm = (int) substr($fecha, 2, 2);
    $dd = (int) substr($fecha, 4, 2);
    $currentYearTwoDigits = (int) date('y');
    $year = $yy <= $currentYearTwoDigits ? 2000 + $yy : 1900 + $yy;

    if (!checkdate($mm, $dd, $year)) {
        return null;
    }

    $birthDate = new DateTime(sprintf('%04d-%02d-%02d', $year, $mm, $dd));
    return $birthDate->diff(new DateTime())->y;
}

function findUploadedDocument($matricula, $documentId) {
    $patterns = glob(__DIR__ . "/uploads/*/registro/{$matricula}/{$documentId}.*");
    if (!$patterns || count($patterns) === 0) {
        return null;
    }
    rsort($patterns);
    $relativePath = str_replace('\\', '/', str_replace(__DIR__, '', $patterns[0]));
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
        'SELECT id, matricula, nombre, adscripcion, categoria, curp, sexo,
                telefono, correo, idRol, fecha_registro, status, antiguedad
         FROM usuarios
         WHERE matricula = :matricula
         LIMIT 1'
    );
    $stmt->execute([':matricula' => $matricula]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No se encontró el usuario.']);
        exit;
    }

    $usuario['id'] = (int) $usuario['id'];
    $usuario['status'] = (int) $usuario['status'];
    $usuario['edad'] = calcularEdadDesdeCurp($usuario['curp']);
    $usuario['tarjeton_path'] = findUploadedDocument($matricula, 1);
    $usuario['foto_path'] = findUploadedDocument($matricula, 6);

    echo json_encode(['success' => true, 'usuario' => $usuario]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
