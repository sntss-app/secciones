<?php
/*
  Login del sistema.
  Recibe matrícula y contraseña desde React, valida contra usuarios
  y devuelve los datos públicos del usuario junto con sus roles.
  Ahora busca en todas las tablas de usuarios (activos, jubilados, confianza)
  y usa registros para los datos del sistema.
  Incluye idTipo para identificar el tipo de usuario.
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

function findUploadedDocument($matricula, $documentId, $idTipo = null) {
    // Mapear tipo a letra de carpeta
    $tipoMap = [
        1 => 'a',
        2 => 'j',
        3 => 'c'
    ];
    $carpetaTipo = $tipoMap[$idTipo] ?? '*';
    
    // Buscar en carpetas con tipo + sección + matrícula
    $patterns = glob(__DIR__ . "/uploads/*/registro/{$carpetaTipo}/*/{$matricula}/{$documentId}.*");
    if (!$patterns || count($patterns) === 0) {
        return null;
    }
    rsort($patterns);
    $relativePath = str_replace('\\', '/', str_replace(__DIR__, '', $patterns[0]));
    return '/api' . $relativePath;
}

$data = json_decode(file_get_contents("php://input"), true);
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';
$password  = isset($data['password'])  ? trim($data['password'])  : '';

if (empty($matricula) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Matrícula y contraseña son obligatorias.']);
    exit;
}

try {
    // ✅ BUSCAR EL USUARIO EN TODAS LAS TABLAS
    $usuario = null;
    $tablaOrigen = '';

    // 1. Buscar en usuarios (activos)
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
            u.idSeccion,
            u.idTipo,
            1 AS tipo_id,
            'activo' AS tipo_nombre
        FROM usuarios u
        WHERE u.matricula = :matricula
        LIMIT 1
    ");
    $stmt->execute([':matricula' => $matricula]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    $tablaOrigen = 'usuarios';

    // 2. Si no se encuentra, buscar en usuariosJ (jubilados)
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
                u.idSeccion,
                u.idTipo,
                2 AS tipo_id,
                'jubilado' AS tipo_nombre
            FROM usuariosJ u
            WHERE u.matricula = :matricula
            LIMIT 1
        ");
        $stmt->execute([':matricula' => $matricula]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        $tablaOrigen = 'usuariosJ';
    }

    // 3. Si no se encuentra, buscar en usuariosC (confianza)
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
                u.idSeccion,
                u.idTipo,
                3 AS tipo_id,
                'confianza' AS tipo_nombre
            FROM usuariosC u
            WHERE u.matricula = :matricula
            LIMIT 1
        ");
        $stmt->execute([':matricula' => $matricula]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        $tablaOrigen = 'usuariosC';
    }

    // Matrícula no existe en ninguna tabla
    if (!$usuario) {
        echo json_encode(['success' => false, 'message' => 'Matrícula no encontrada en el sistema.']);
        exit;
    }

    // ✅ OBTENER DATOS DE REGISTROS (teléfono, correo, contraseña, etc.)
    $stmtRegistro = $pdo->prepare("
        SELECT 
            telefono, 
            correo, 
            contrasena, 
            codigo_2fa, 
            two_factor_enabled,
            fecha_registro, 
            status AS registro_status,
            intentos_fallidos, 
            bloqueo_hasta
        FROM registros 
        WHERE matricula = :matricula
        LIMIT 1
    ");
    $stmtRegistro->execute([':matricula' => $matricula]);
    $registro = $stmtRegistro->fetch(PDO::FETCH_ASSOC);

    // Si no tiene registro (nunca se registró)
    if (!$registro || empty($registro['contrasena'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Esta matrícula aún no tiene registro completo. Por favor, ingresa a Registrarse para completar tu acceso.'
        ]);
        exit;
    }

    // ✅ COMBINAR DATOS DEL USUARIO Y REGISTRO
    $usuario = array_merge($usuario, $registro);

    // 2. Verificar bloqueo por intentos fallidos
    $intentos_fallidos = (int)($usuario['intentos_fallidos'] ?? 0);
    $bloqueo_hasta = $usuario['bloqueo_hasta'] ?? null;

    if ($bloqueo_hasta && new DateTime() < new DateTime($bloqueo_hasta)) {
        $restante = (new DateTime($bloqueo_hasta))->diff(new DateTime());
        $minutos = $restante->i + 1;
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'message' => "Has superado el número de intentos. Tu cuenta está bloqueada por $minutos minutos.",
            'bloqueado' => true,
            'tiempo_restante' => $minutos
        ]);
        exit;
    }

    // 3. Verificar contraseña
    if (!password_verify($password, $usuario['contrasena'])) {
        $nuevos_intentos = $intentos_fallidos + 1;
        $mensaje = "Matrícula o contraseña incorrectas. Intentos restantes: " . (5 - $nuevos_intentos);
        $bloquear = false;

        if ($nuevos_intentos >= 5) {
            $bloqueo_tiempo = (new DateTime())->modify('+15 minutes')->format('Y-m-d H:i:s');
            $update = $pdo->prepare("UPDATE registros SET intentos_fallidos = :intentos, bloqueo_hasta = :bloqueo WHERE matricula = :matricula");
            $update->execute([
                ':intentos' => $nuevos_intentos,
                ':bloqueo' => $bloqueo_tiempo,
                ':matricula' => $matricula
            ]);
            $mensaje = "Has superado el número de intentos. Tu cuenta ha sido bloqueada por 15 minutos.";
            $bloquear = true;
            http_response_code(429);
        } else {
            $update = $pdo->prepare("UPDATE registros SET intentos_fallidos = :intentos WHERE matricula = :matricula");
            $update->execute([':intentos' => $nuevos_intentos, ':matricula' => $matricula]);
            http_response_code(401);
        }

        echo json_encode([
            'success' => false,
            'message' => $mensaje,
            'bloqueado' => $bloquear,
            'intentos' => $nuevos_intentos
        ]);
        exit;
    }

    // ✅ Contraseña correcta: reiniciar intentos en registros
    $reset = $pdo->prepare("UPDATE registros SET intentos_fallidos = 0, bloqueo_hasta = NULL WHERE matricula = :matricula");
    $reset->execute([':matricula' => $matricula]);

    // 🔥 Generar codigo_2fa si no existe en registros
    if (empty($usuario['codigo_2fa'])) {
        function generarSecretBase32($longitud = 16) {
            $alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
            $secret = '';
            for ($i = 0; $i < $longitud; $i++) {
                $secret .= $alfabeto[random_int(0, strlen($alfabeto) - 1)];
            }
            return $secret;
        }
        
        $nuevo_secret = generarSecretBase32(16);
        $update = $pdo->prepare("UPDATE registros SET codigo_2fa = :secret WHERE matricula = :matricula");
        $update->execute([':secret' => $nuevo_secret, ':matricula' => $matricula]);
        $usuario['codigo_2fa'] = $nuevo_secret;
    }

    // ========== OBTENER ROLES DEL USUARIO ==========
    $roles = [];
    $roleNames = [];

    try {
        $checkTable = $pdo->query("SHOW TABLES LIKE 'usuario_roles'");
        if ($checkTable->rowCount() > 0) {
            $rolesStmt = $pdo->prepare(
                "SELECT r.id, r.evento
                 FROM usuario_roles ur
                 JOIN roles r ON ur.rol_id = r.id
                 WHERE ur.usuario_matricula = :matricula AND r.activo = 1"
            );
            $rolesStmt->execute([':matricula' => $matricula]);
            
            while ($row = $rolesStmt->fetch(PDO::FETCH_ASSOC)) {
                $name = trim($row['evento']);
                if ($name !== '') {
                    $roles[] = ['id' => (int) $row['id'], 'name' => $name];
                    $roleNames[] = mb_strtolower($name);
                }
            }
        }
    } catch (PDOException $e) {
        $roles = [];
        $roleNames = [];
    }

    // ========== PREPARAR RESPUESTA ==========
    unset($usuario['contrasena']);

    if (!empty($roles)) {
        $usuario['roles'] = $roles;
        $usuario['roleNames'] = $roleNames;
        $usuario['roleName'] = $roleNames[0] ?? null;
        $usuario['roleIds'] = array_column($roles, 'id');
    } else {
        $usuario['roles'] = [];
        $usuario['roleNames'] = [];
        $usuario['roleName'] = null;
        $usuario['roleIds'] = [];
    }

    // ✅ OBTENER DATOS DE LA SECCIÓN
    $stmtSeccion = $pdo->prepare("
        SELECT 
            romano AS seccion_romano,
            nombre AS seccion_nombre,
            slogan AS seccion_slogan,
            direccion AS seccion_direccion,  
            color_principal AS seccion_color,
            logo_url AS seccion_logo,
            banner_url AS seccion_banner
        FROM secciones 
        WHERE id = :idSeccion AND status = 2
        LIMIT 1
    ");
    $stmtSeccion->execute([':idSeccion' => $usuario['idSeccion']]);
    $seccion = $stmtSeccion->fetch(PDO::FETCH_ASSOC);

    if ($seccion) {
        $usuario = array_merge($usuario, $seccion);
    }

    // ✅ OBTENER REDES SOCIALES DE LA SECCIÓN
    $stmtRedes = $pdo->prepare("
        SELECT red_social, url 
        FROM secciones_redes 
        WHERE idSeccion = :idSeccion AND status = 2
    ");
    $stmtRedes->execute([':idSeccion' => $usuario['idSeccion']]);
    $redes = [];
    while ($row = $stmtRedes->fetch(PDO::FETCH_ASSOC)) {
        $redes[$row['red_social']] = $row['url'];
    }
    $usuario['redes_sociales'] = $redes;

    

    // Castear tipos numéricos
    $usuario['id'] = (int) $usuario['id'];
    $usuario['idSeccion'] = (int) ($usuario['idSeccion'] ?? 0);
    $usuario['idTipo'] = (int) ($usuario['idTipo'] ?? 1);
    $usuario['status'] = (int) ($usuario['registro_status'] ?? 0);
    $usuario['two_factor_enabled'] = (int) ($usuario['two_factor_enabled'] ?? 0);
    $usuario['antiguedad'] = $usuario['antiguedad'] ? (int) $usuario['antiguedad'] : null;
    $usuario['intentos_fallidos'] = (int) ($usuario['intentos_fallidos'] ?? 0);
    
    // Calcular edad desde CURP
    $usuario['edad'] = calcularEdadDesdeCurp($usuario['curp']);
    
    // Buscar documentos (con el tipo de usuario)
    $usuario['tarjeton_path'] = findUploadedDocument($usuario['matricula'], 1, $usuario['idTipo']);
    $usuario['foto_path'] = findUploadedDocument($usuario['matricula'], 6, $usuario['idTipo']);
    $usuario['requires_2fa'] = true;
    $usuario['tabla_origen'] = $tablaOrigen;

    echo json_encode([
        'success' => true,
        'usuario' => $usuario
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Error en la base de datos: ' . $e->getMessage()
    ]);
}
?>