<?php
/*
  Primer paso del registro.
  Busca matricula + CURP en el padron para confirmar que la persona existe
  antes de permitirle crear contraseña y subir documentos.
*/

// Conectar a la base de datos
require_once 'config.php';

/**
 * Funcion que calcula la edad de una persona a partir de su CURP.
 * Recibe la CURP y devuelve los años cumplidos.
 */
function calcularEdadDesdeCurp($curp) {
    // Si la CURP es muy corta, no se puede calcular
    if (!$curp || strlen($curp) < 18) {
        return null;
    }

    // Extraer la fecha de nacimiento de la CURP (posiciones 4 a 9)
    // Ejemplo: EICI000318MMCSRLA3 -> 000318 = 3 de enero de 2018?
    $fechaStr = substr($curp, 4, 6);
    if (!preg_match('/^\d{6}$/', $fechaStr)) {
        return null;
    }

    // Separar año, mes y dia
    $yy = (int) substr($fechaStr, 0, 2);
    $mm = (int) substr($fechaStr, 2, 2);
    $dd = (int) substr($fechaStr, 4, 2);
    
    // Determinar el año completo (2000+ si los dos digitos son <= 24)
    $year = ($yy <= 24) ? 2000 + $yy : 1900 + $yy;
    
    // Verificar que la fecha sea valida
    if (!checkdate($mm, $dd, $year)) {
        return null;
    }

    // Calcular la edad restando la fecha de nacimiento a la fecha actual
    $birthDate = new DateTime(sprintf('%04d-%02d-%02d', $year, $mm, $dd));
    $today = new DateTime();
    return $birthDate->diff($today)->y;
}

// Recibe los datos del frontend (React) en formato JSON
$data = json_decode(file_get_contents("php://input"), true);
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';
$curp = isset($data['curp']) ? trim($data['curp']) : '';

// Validacion: ambos campos son obligatorios
if (empty($matricula) || empty($curp)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La matricula y la CURP son obligatorias.']);
    exit;
}

// Validar que la matricula tenga entre 8 y 9 digitos
if (!preg_match('/^\d{8,9}$/', $matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La matricula debe ser de entre 8 y 9 digitos.']);
    exit;
}

// Limpiar la CURP: eliminar espacios y caracteres especiales, convertir a mayusculas
$curp_limpia = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $curp));

// Validar que la CURP tenga exactamente 18 caracteres despues de limpiar
if (strlen($curp_limpia) !== 18) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La CURP debe tener exactamente 18 caracteres. Verifica que no tenga espacios.']);
    exit;
}

try {
    // Buscar al usuario por matricula Y CURP
    // REPLACE(nombre, '/', ' ') -> cambia las diagonales por espacios en el nombre
    // UPPER(REPLACE(...)) -> compara la CURP sin espacios, guiones ni guiones bajos
    $stmt = $pdo->prepare("SELECT id, matricula, REPLACE(nombre, '/', ' ') AS nombre, adscripcion, categoria, curp, sexo, antiguedad, contrasena, status FROM usuarios WHERE matricula = :matricula AND UPPER(REPLACE(REPLACE(REPLACE(curp, ' ', ''), '-', ''), '_', '')) = :curp LIMIT 1");
    $stmt->execute([
        ':matricula' => $matricula,
        ':curp' => $curp_limpia
    ]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Si no existe el usuario, avisar
    if (!$usuario) {
        echo json_encode(['success' => false, 'message' => 'No se encontro ningun trabajador que coincida con esa matricula y CURP en la Seccion XXXIII.']);
        exit;
    }

    // Si ya tiene contraseña registrada, significa que ya se registro antes
    if (!empty($usuario['contrasena'])) {
        echo json_encode(['success' => false, 'message' => 'Este usuario ya se encuentra registrado y cuenta con contraseña de acceso.']);
        exit;
    }

    // Quitar la contraseña de la respuesta para no exponerla
    unset($usuario['contrasena']);
    // Calcular la edad desde la CURP
    $usuario['edad'] = calcularEdadDesdeCurp($usuario['curp']);

    // Responder con los datos del usuario para que el frontend los muestre
    echo json_encode([
        'success' => true,
        'usuario' => $usuario
    ]);

} catch (PDOException $e) {
    // Si algo falla en la base de datos, devolver error 500
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al consultar la base de datos: ' . $e->getMessage()]);
}