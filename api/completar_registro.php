<?php
/*
  Completa el registro de un trabajador.
  Guarda teléfono, correo, sexo (desde CURP) y contraseña en la tabla registros.
  La sección se obtiene de la base de datos (ya está asignada al usuario).
  Los documentos iniciales se suben después desde subir_documentos.php.
  Ahora busca en todas las tablas de usuarios (activos, jubilados, confianza).
*/
require_once 'config.php';

// Obtener datos del cuerpo del request (JSON)
$data = json_decode(file_get_contents("php://input"), true);
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';
$antiguedad = isset($data['antiguedad']) ? trim($data['antiguedad']) : '';
$telefono = isset($data['telefono']) ? trim($data['telefono']) : '';
$correo = isset($data['correo']) ? trim($data['correo']) : '';
$password = isset($data['password']) ? trim($data['password']) : '';

// ✅ Validar que todos los campos estén presentes
if (empty($matricula) || empty($antiguedad) || empty($telefono) || empty($correo) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
    exit;
}

// Validar antigüedad (solo números)
if (!preg_match('/^\d+$/', $antiguedad)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La antigüedad debe ser un número válido.']);
    exit;
}

// Validar matrícula
if (!preg_match('/^\d{8,9}$/', $matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La matrícula debe tener entre 8 y 9 dígitos.']);
    exit;
}

// Validar teléfono
if (!preg_match('/^\d{10}$/', $telefono)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El teléfono debe tener exactamente 10 dígitos numéricos.']);
    exit;
}

// Validar correo
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El correo electrónico ingresado no es válido.']);
    exit;
}

// Validar contraseña (8 caracteres como en el frontend)
if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La contraseña debe tener un mínimo de 8 caracteres.']);
    exit;
}

try {
    // Iniciar transacción
    $pdo->beginTransaction();

    // ✅ BUSCAR EL USUARIO EN TODAS LAS TABLAS
    $usuario = null;
    $tablaOrigen = '';

    // 1. Buscar en usuarios (activos)
    $stmt = $pdo->prepare("
        SELECT id, curp, idSeccion, idTipo, 'activo' AS tipo
        FROM usuarios 
        WHERE matricula = :matricula 
        LIMIT 1
    ");
    $stmt->execute([':matricula' => $matricula]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    $tablaOrigen = 'usuarios';

    // 2. Si no se encuentra, buscar en usuariosJ (jubilados)
    if (!$usuario) {
        $stmt = $pdo->prepare("
            SELECT id, curp, idSeccion, idTipo, 'jubilado' AS tipo
            FROM usuariosJ 
            WHERE matricula = :matricula 
            LIMIT 1
        ");
        $stmt->execute([':matricula' => $matricula]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        $tablaOrigen = 'usuariosJ';
    }

    // 3. Si no se encuentra, buscar en usuariosC (confianza)
    if (!$usuario) {
        $stmt = $pdo->prepare("
            SELECT id, curp, idSeccion, idTipo, 'confianza' AS tipo
            FROM usuariosC 
            WHERE matricula = :matricula 
            LIMIT 1
        ");
        $stmt->execute([':matricula' => $matricula]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        $tablaOrigen = 'usuariosC';
    }

    // ✅ Verificar que el usuario existe
    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'La matrícula no existe en el sistema.']);
        exit;
    }

    // ✅ Verificar que la matrícula tenga sección asignada
    if (empty($usuario['idSeccion'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Este usuario no tiene una sección asignada en el padrón. Contacta a soporte@sntss-secciones.org'
        ]);
        exit;
    }

    // ✅ VERIFICAR QUE LA SECCIÓN EXISTA Y ESTÉ ACTIVA
    $stmtSeccion = $pdo->prepare("
        SELECT id, romano, nombre, color_principal 
        FROM secciones 
        WHERE id = :idSeccion AND status = 2
    ");
    $stmtSeccion->execute([':idSeccion' => $usuario['idSeccion']]);
    $seccion = $stmtSeccion->fetch(PDO::FETCH_ASSOC);

    if (!$seccion) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'La sección asignada a este usuario no está activa o no existe. Contacta a soporte@sntss-secciones.org'
        ]);
        exit;
    }

    // ✅ OBTENER SEXO DESDE LA CURP (M, F, O)
    $curp = $usuario['curp'];
    $sexo = 'O'; // Default: Otro
    
    if (!empty($curp) && strlen($curp) >= 11) {
        $sexoChar = substr($curp, 10, 1);
        if ($sexoChar === 'H') {
            $sexo = 'M';
        } elseif ($sexoChar === 'M') {
            $sexo = 'F';
        } else {
            $sexo = 'O';
        }
    }

    // Hashear la contraseña
    $password_hashed = password_hash($password, PASSWORD_DEFAULT);

    // ✅ 1. Actualizar antigüedad y sexo en la tabla correspondiente
    if ($tablaOrigen === 'usuarios') {
        $updateUsuario = $pdo->prepare("
            UPDATE usuarios 
            SET antiguedad = :antiguedad, 
                sexo = :sexo
            WHERE matricula = :matricula
        ");
        $updateUsuario->execute([
            ':antiguedad' => (int)$antiguedad,
            ':sexo' => $sexo,
            ':matricula' => $matricula
        ]);
    } elseif ($tablaOrigen === 'usuariosJ') {
        // Jubilados no tienen antiguedad, solo actualizamos sexo
        $updateUsuario = $pdo->prepare("
            UPDATE usuariosJ 
            SET sexo = :sexo
            WHERE matricula = :matricula
        ");
        $updateUsuario->execute([
            ':sexo' => $sexo,
            ':matricula' => $matricula
        ]);
    } else {
        // Confianza
        $updateUsuario = $pdo->prepare("
            UPDATE usuariosC 
            SET antiguedad = :antiguedad, 
                sexo = :sexo
            WHERE matricula = :matricula
        ");
        $updateUsuario->execute([
            ':antiguedad' => (int)$antiguedad,
            ':sexo' => $sexo,
            ':matricula' => $matricula
        ]);
    }

    // ✅ 2. Insertar o actualizar en registros (incluyendo idTipo)
    $checkStmt = $pdo->prepare("SELECT id FROM registros WHERE matricula = :matricula");
    $checkStmt->execute([':matricula' => $matricula]);
    $existeRegistro = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($existeRegistro) {
        // ✅ Actualizar registro existente
        $updateRegistro = $pdo->prepare("
            UPDATE registros 
            SET idSeccion = :idSeccion,
                idTipo = :idTipo,
                telefono = :telefono, 
                correo = :correo, 
                contrasena = :password,
                status = 2,
                fecha_registro = NOW()
            WHERE matricula = :matricula
        ");
        $resultado = $updateRegistro->execute([
            ':idSeccion' => $usuario['idSeccion'],
            ':idTipo' => $usuario['idTipo'] ?? 1,
            ':telefono' => $telefono,
            ':correo' => $correo,
            ':password' => $password_hashed,
            ':matricula' => $matricula
        ]);
    } else {
        // ✅ Insertar nuevo registro
        $insertRegistro = $pdo->prepare("
            INSERT INTO registros (
                matricula, 
                idSeccion,
                idTipo,
                telefono, 
                correo, 
                contrasena,
                codigo_2fa,
                two_factor_enabled,
                status,
                fecha_registro
            ) VALUES (
                :matricula,
                :idSeccion,
                :idTipo,
                :telefono,
                :correo,
                :password,
                NULL,
                0,
                2,
                NOW()
            )
        ");
        $resultado = $insertRegistro->execute([
            ':matricula' => $matricula,
            ':idSeccion' => $usuario['idSeccion'],
            ':idTipo' => $usuario['idTipo'] ?? 1,
            ':telefono' => $telefono,
            ':correo' => $correo,
            ':password' => $password_hashed
        ]);
    }

    if (!$resultado) {
        throw new Exception('No se pudieron guardar los datos del registro.');
    }

    // Confirmar transacción
    $pdo->commit();

    echo json_encode([
        'success' => true, 
        'message' => '¡Registro completado exitosamente!',
        'sexo' => $sexo,
        'seccion' => $seccion,
        'idTipo' => $usuario['idTipo'] ?? 1,
        'tipo' => $usuario['tipo'] ?? 'activo'
    ]);

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>