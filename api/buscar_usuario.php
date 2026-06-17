<?php
/*
  Primer paso del registro.
  Busca matrícula + CURP en el padrón para confirmar que la persona existe
  antes de permitirle crear contraseña y subir documentos.
*/
require_once 'config.php';

function calcularEdadDesdeCurp($curp) {
    if (!$curp || strlen($curp) < 18) {
        return null;
    }

    // Extraer la fecha de la CURP (posiciones 4-9, 6 dígitos)
    $fechaStr = substr($curp, 4, 6);
    if (!preg_match('/^\d{6}$/', $fechaStr)) {
        return null;
    }

    $yy = (int) substr($fechaStr, 0, 2);
    $mm = (int) substr($fechaStr, 2, 2);
    $dd = (int) substr($fechaStr, 4, 2);
    
    // Determinar el año completo (asumiendo años 2000+ para yy <= 24)
    $year = ($yy <= 24) ? 2000 + $yy : 1900 + $yy;
    
    if (!checkdate($mm, $dd, $year)) {
        return null;
    }

    $birthDate = new DateTime(sprintf('%04d-%02d-%02d', $year, $mm, $dd));
    $today = new DateTime();
    return $birthDate->diff($today)->y;
}

// Obtener datos del cuerpo del request (JSON)
$data = json_decode(file_get_contents("php://input"), true);
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';
$curp = isset($data['curp']) ? trim($data['curp']) : '';

if (empty($matricula) || empty($curp)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La matrícula y la CURP son obligatorias.']);
    exit;
}

// Validar que la matrícula sea de hasta 9 dígitos
if (!preg_match('/^\d{8,9}$/', $matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La matrícula debe ser de entre 8 y 9 dígitos.']);
    exit;
}

// Limpiar la CURP: eliminar espacios y caracteres especiales, convertir a mayúsculas
$curp_limpia = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $curp));

// Validar que la CURP tenga exactamente 18 caracteres después de limpiar
if (strlen($curp_limpia) !== 18) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La CURP debe tener exactamente 18 caracteres. Verifica que no tenga espacios.']);
    exit;
}

try {
    // Buscar al usuario por matrícula Y CURP (usando la CURP limpia)
    $stmt = $pdo->prepare("SELECT id, matricula, REPLACE(nombre, '/', ' ') AS nombre, adscripcion, categoria, curp, sexo, antiguedad, contrasena, status FROM usuarios WHERE matricula = :matricula AND UPPER(REPLACE(REPLACE(REPLACE(curp, ' ', ''), '-', ''), '_', '')) = :curp LIMIT 1");
    $stmt->execute([
        ':matricula' => $matricula,
        ':curp' => $curp_limpia
    ]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        echo json_encode(['success' => false, 'message' => 'No se encontró ningún trabajador que coincida con esa matrícula y CURP en la Sección XXXIII.']);
        exit;
    }

    // Si ya tiene contraseña registrada
    if (!empty($usuario['contrasena'])) {
        echo json_encode(['success' => false, 'message' => 'Este usuario ya se encuentra registrado y cuenta con contraseña de acceso.']);
        exit;
    }

    // Ocultamos la contraseña en la respuesta
    unset($usuario['contrasena']);
    $usuario['edad'] = calcularEdadDesdeCurp($usuario['curp']);

    echo json_encode([
        'success' => true,
        'usuario' => $usuario
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al consultar la base de datos: ' . $e->getMessage()]);
}
?>