<?php
/*
  Primer paso del registro.
  Busca matrícula + CURP en el padrón para confirmar que la persona existe
  antes de permitirle crear contraseña y subir documentos.
  Ahora busca en todas las tablas de usuarios (activos, jubilados, confianza)
  y verifica si ya tiene contraseña en la tabla registros.
*/
require_once 'config.php';

function calcularEdadDesdeCurp($curp) {
    if (!$curp || strlen($curp) < 18) {
        return null;
    }

    $fechaStr = substr($curp, 4, 6);
    if (!preg_match('/^\d{6}$/', $fechaStr)) {
        return null;
    }

    $yy = (int) substr($fechaStr, 0, 2);
    $mm = (int) substr($fechaStr, 2, 2);
    $dd = (int) substr($fechaStr, 4, 2);
    
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

// ✅ Validar que todos los campos estén presentes (SOLO matrícula y CURP)
if (empty($matricula) || empty($curp)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La matrícula y CURP son obligatorias.']);
    exit;
}

// ✅ Validar que la matrícula sea de 8 a 9 dígitos
if (!preg_match('/^\d{8,9}$/', $matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La matrícula debe ser de entre 8 y 9 dígitos.']);
    exit;
}

// Limpiar la CURP: eliminar espacios y caracteres especiales, convertir a mayúsculas
$curp_limpia = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $curp));

// ✅ Validar que la CURP tenga exactamente 18 caracteres
if (strlen($curp_limpia) !== 18) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La CURP debe tener exactamente 18 caracteres. Verifica que no tenga espacios.']);
    exit;
}

try {
    // ✅ BUSCAR EN TODAS LAS TABLAS DE USUARIOS
    // Primero en usuarios (activos)
    $stmt = $pdo->prepare("
        SELECT 
            u.id, 
            u.matricula, 
            REPLACE(u.nombre, '/', ' ') AS nombre, 
            u.adscripcion, 
            u.categoria, 
            u.curp, 
            u.sexo, 
            u.antiguedad, 
            u.status,
            u.idSeccion,
            u.idTipo,
            r.contrasena AS contrasena_registro,
            s.romano AS seccion_romano,
            s.nombre AS seccion_nombre,
            s.color_principal AS seccion_color,
            s.arabigo AS seccion_arabigo
        FROM usuarios u
        LEFT JOIN registros r ON u.matricula = r.matricula
        LEFT JOIN secciones s ON u.idSeccion = s.id
        WHERE u.matricula = :matricula 
        AND UPPER(REPLACE(REPLACE(REPLACE(u.curp, ' ', ''), '-', ''), '_', '')) = :curp 
        LIMIT 1
    ");
    $stmt->execute([
        ':matricula' => $matricula,
        ':curp' => $curp_limpia
    ]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Si no se encuentra en usuarios, buscar en usuariosJ (jubilados)
    if (!$usuario) {
        $stmt = $pdo->prepare("
            SELECT 
                u.id, 
                u.matricula, 
                REPLACE(u.nombre, '/', ' ') AS nombre, 
                NULL AS adscripcion, 
                NULL AS categoria, 
                u.curp, 
                u.sexo, 
                NULL AS antiguedad, 
                u.status,
                u.idSeccion,
                u.idTipo,
                r.contrasena AS contrasena_registro,
                s.romano AS seccion_romano,
                s.nombre AS seccion_nombre,
                s.color_principal AS seccion_color,
                s.arabigo AS seccion_arabigo
            FROM usuariosJ u
            LEFT JOIN registros r ON u.matricula = r.matricula
            LEFT JOIN secciones s ON u.idSeccion = s.id
            WHERE u.matricula = :matricula 
            AND UPPER(REPLACE(REPLACE(REPLACE(u.curp, ' ', ''), '-', ''), '_', '')) = :curp 
            LIMIT 1
        ");
        $stmt->execute([
            ':matricula' => $matricula,
            ':curp' => $curp_limpia
        ]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Si no se encuentra en usuariosJ, buscar en usuariosC (confianza)
    if (!$usuario) {
        $stmt = $pdo->prepare("
            SELECT 
                u.id, 
                u.matricula, 
                REPLACE(u.nombre, '/', ' ') AS nombre, 
                u.adscripcion, 
                u.categoria, 
                u.curp, 
                u.sexo, 
                u.antiguedad, 
                u.status,
                u.idSeccion,
                u.idTipo,
                r.contrasena AS contrasena_registro,
                s.romano AS seccion_romano,
                s.nombre AS seccion_nombre,
                s.color_principal AS seccion_color,
                s.arabigo AS seccion_arabigo
            FROM usuariosC u
            LEFT JOIN registros r ON u.matricula = r.matricula
            LEFT JOIN secciones s ON u.idSeccion = s.id
            WHERE u.matricula = :matricula 
            AND UPPER(REPLACE(REPLACE(REPLACE(u.curp, ' ', ''), '-', ''), '_', '')) = :curp 
            LIMIT 1
        ");
        $stmt->execute([
            ':matricula' => $matricula,
            ':curp' => $curp_limpia
        ]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // ✅ Si no se encuentra el usuario en ninguna tabla
    if (!$usuario) {
        echo json_encode([
            'success' => false, 
            'message' => 'No se encontró ningún trabajador con esa matrícula y CURP. Verifica tus datos.'
        ]);
        exit;
    }

    // ✅ Verificar que el usuario tenga una sección asignada en el padrón
    if (empty($usuario['idSeccion'])) {
        echo json_encode([
            'success' => false, 
            'message' => 'Este usuario no tiene una sección asignada en el padrón. Contacta a soporte@sntss-secciones.org'
        ]);
        exit;
    }

    // ✅ Verificar que la sección exista y esté activa (por si acaso)
    if (empty($usuario['seccion_romano'])) {
        // Si la sección no existe en la tabla secciones, intentamos obtenerla
        $stmtSeccion = $pdo->prepare("SELECT id, romano, nombre, color_principal FROM secciones WHERE id = :idSeccion AND status = 2");
        $stmtSeccion->execute([':idSeccion' => $usuario['idSeccion']]);
        $seccion = $stmtSeccion->fetch(PDO::FETCH_ASSOC);
        
        if (!$seccion) {
            echo json_encode([
                'success' => false, 
                'message' => 'La sección asignada a este usuario no está activa o no existe. Contacta a soporte@sntss-secciones.org'
            ]);
            exit;
        }
        
        // Si encontramos la sección, la agregamos al usuario
        $usuario['seccion_romano'] = $seccion['romano'];
        $usuario['seccion_nombre'] = $seccion['nombre'];
        $usuario['seccion_color'] = $seccion['color_principal'];
        $usuario['seccion_arabigo'] = $seccion['arabigo'];
    }

    // ✅ Si ya tiene contraseña registrada (usuario ya registrado)
    if (!empty($usuario['contrasena_registro'])) {
        echo json_encode([
            'success' => false, 
            'message' => 'Este usuario ya se encuentra registrado y cuenta con contraseña de acceso. Por favor, inicia sesión.'
        ]);
        exit;
    }

    // ✅ Eliminar campos que no necesitamos en la respuesta
    unset($usuario['contrasena_registro']);
    
    // ✅ Calculamos la edad desde la CURP
    $usuario['edad'] = calcularEdadDesdeCurp($usuario['curp']);

    // ✅ Respuesta exitosa con todos los datos del usuario y su sección
    echo json_encode([
        'success' => true,
        'usuario' => $usuario,
        'seccion' => [
            'id' => $usuario['idSeccion'],
            'romano' => $usuario['seccion_romano'],
            'nombre' => $usuario['seccion_nombre'],
            'color' => $usuario['seccion_color'],
            'arabigo' => $usuario['seccion_arabigo']
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'El usuario no se encontró en la base de datos: Favor de comunicarse a su sección'
    ]);
}
?>