<?php
/*
  Perfil completo del trabajador.
  Lee datos actuales de usuarios, calcula edad desde CURP y busca documentos
  subidos durante el registro inicial.
*/

// Conectar a la base de datos
require_once 'config.php';

/**
 * Calcula la edad de una persona a partir de su CURP
 * Extrae la fecha de nacimiento de la CURP y la resta a la fecha actual
 */
function calcularEdadDesdeCurp($curp) {
    if (!$curp || strlen($curp) < 10) {
        return null;
    }

    $fecha = substr($curp, 4, 6); // Extrae la fecha de la CURP (posiciones 4 a 9)
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

/**
 * Busca un documento subido por el usuario durante el registro inicial
 * El documentId identifica el tipo: 1 = tarjeton, 6 = foto de perfil
 * Busca en: /uploads/*/registro/{matricula}/{documentId}.*
 */
function findUploadedDocument($matricula, $documentId) {
    $patterns = glob(__DIR__ . "/uploads/*/registro/{$matricula}/{$documentId}.*");
    if (!$patterns || count($patterns) === 0) {
        return null;
    }
    rsort($patterns);
    $relativePath = str_replace('\\', '/', str_replace(__DIR__, '', $patterns[0]));
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
    // Consultar todos los datos del usuario en la tabla usuarios
    $stmt = $pdo->prepare(
        'SELECT id, matricula, nombre, adscripcion, categoria, curp, sexo,
                telefono, correo, idRol, fecha_registro, status, antiguedad
         FROM usuarios
         WHERE matricula = :matricula
         LIMIT 1'
    );
    $stmt->execute([':matricula' => $matricula]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Si no se encuentra el usuario, avisar
    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No se encontro el usuario.']);
        exit;
    }

    // Convertir valores a numeros enteros
    $usuario['id'] = (int) $usuario['id'];
    $usuario['status'] = (int) $usuario['status'];

    // Calcular la edad desde la CURP
    $usuario['edad'] = calcularEdadDesdeCurp($usuario['curp']);

    // Buscar las rutas de los documentos del usuario (tarjeton y foto)
    $usuario['tarjeton_path'] = findUploadedDocument($matricula, 1); // 1 = tarjeton
    $usuario['foto_path'] = findUploadedDocument($matricula, 6);     // 6 = foto de perfil

    // Devolver todos los datos del usuario
    echo json_encode(['success' => true, 'usuario' => $usuario]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}