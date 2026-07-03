<?php
/*
  Login del sistema.
  Recibe matrícula y contraseña desde React, valida contra usuarios
  y devuelve los datos públicos del usuario junto con sus roles.
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

$data = json_decode(file_get_contents("php://input"), true);
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';
$password  = isset($data['password'])  ? trim($data['password'])  : '';

if (empty($matricula) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Matrícula y contraseña son obligatorias.']);
    exit;
}

try {
    // 1. Consultar usuario incluyendo campos de bloqueo
    $stmt = $pdo->prepare(
        "SELECT u.id, u.matricula, REPLACE(u.nombre, '/', ' ') AS nombre, u.adscripcion, u.categoria, u.curp, u.sexo,
                u.telefono, u.correo, u.contrasena, u.idRol, u.codigo_2fa, u.two_factor_enabled,
                u.fecha_registro, u.status, u.antiguedad,
                u.intentos_fallidos, u.bloqueo_hasta
        FROM usuarios u
        WHERE u.matricula = :matricula
        LIMIT 1"
    );
    $stmt->execute([':matricula' => $matricula]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Matrícula no existe
    if (!$usuario) {
        echo json_encode(['success' => false, 'message' => 'Matrícula no encontrada en el sistema.']);
        exit;
    }

    // Usuario existe en el padrón pero aún no ha completado su registro
    if (empty($usuario['contrasena'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Esta matrícula aún no tiene registro completo. Por favor, ingresa a Registrarse para completar tu acceso.'
        ]);
        exit;
    }

    // 2. Verificar bloqueo por intentos fallidos
    $intentos_fallidos = (int)$usuario['intentos_fallidos'];
    $bloqueo_hasta = $usuario['bloqueo_hasta'];

    if ($bloqueo_hasta && new DateTime() < new DateTime($bloqueo_hasta)) {
        $restante = (new DateTime($bloqueo_hasta))->diff(new DateTime());
        $minutos = $restante->i + 1;
        http_response_code(429); // Too Many Requests
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
        // ❌ Contraseña incorrecta: incrementar intentos
        $nuevos_intentos = $intentos_fallidos + 1;
        $mensaje = "Matrícula o contraseña incorrectas. Intentos restantes: " . (5 - $nuevos_intentos);
        $bloquear = false;

        if ($nuevos_intentos >= 5) {
            // Bloquear por 15 minutos
            $bloqueo_tiempo = (new DateTime())->modify('+15 minutes')->format('Y-m-d H:i:s');
            $update = $pdo->prepare("UPDATE usuarios SET intentos_fallidos = :intentos, bloqueo_hasta = :bloqueo WHERE matricula = :matricula");
            $update->execute([
                ':intentos' => $nuevos_intentos,
                ':bloqueo' => $bloqueo_tiempo,
                ':matricula' => $matricula
            ]);
            $mensaje = "Has superado el número de intentos. Tu cuenta ha sido bloqueada por 15 minutos.";
            $bloquear = true;
            http_response_code(429);
        } else {
            $update = $pdo->prepare("UPDATE usuarios SET intentos_fallidos = :intentos WHERE matricula = :matricula");
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

    // ✅ Contraseña correcta: reiniciar intentos
    $reset = $pdo->prepare("UPDATE usuarios SET intentos_fallidos = 0, bloqueo_hasta = NULL WHERE matricula = :matricula");
    $reset->execute([':matricula' => $matricula]);

    // 🔥 Si el usuario no tiene codigo_2fa, se lo generamos automáticamente
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
        $update = $pdo->prepare("UPDATE usuarios SET codigo_2fa = :secret WHERE matricula = :matricula");
        $update->execute([':secret' => $nuevo_secret, ':matricula' => $matricula]);
        $usuario['codigo_2fa'] = $nuevo_secret;
    }

    // Obtener roles del usuario desde usuario_roles si existe
    $roles = [];
    $roleNames = [];
    $roleName = null;

    $tableCheck = $pdo->query("SHOW TABLES LIKE 'usuario_roles'");
    $hasUsuarioRoles = $tableCheck !== false && $tableCheck->fetch() !== false;

    if ($hasUsuarioRoles) {
        $rolesStmt = $pdo->prepare(
            "SELECT r.id, r.evento
             FROM usuario_roles ur
             JOIN roles r ON ur.rol_id = r.id
             WHERE ur.usuario_id = :usuario_id AND r.status = 1"
        );
        $rolesStmt->execute([':usuario_id' => $usuario['id']]);
        while ($row = $rolesStmt->fetch(PDO::FETCH_ASSOC)) {
            $name = trim($row['evento']);
            if ($name !== '') {
                $roles[] = ['id' => (int) $row['id'], 'name' => $name];
                $roleNames[] = mb_strtolower($name);
            }
        }
    }

    if (empty($roles) && $usuario['idRol'] !== null) {
        $legacyRoles = [];
        if (is_numeric($usuario['idRol'])) {
            $legacyRoles[] = (int) $usuario['idRol'];
        } else {
            $pieces = array_filter(array_map('trim', explode(',', $usuario['idRol'])));
            foreach ($pieces as $piece) {
                if (is_numeric($piece)) {
                    $legacyRoles[] = (int) $piece;
                }
            }
        }

        if (!empty($legacyRoles)) {
            $placeholders = implode(',', array_fill(0, count($legacyRoles), '?'));
            $legacyStmt = $pdo->prepare(
                "SELECT id, evento FROM roles WHERE id IN ($placeholders) AND status = 1"
            );
            $legacyStmt->execute($legacyRoles);
            while ($legacyRole = $legacyStmt->fetch(PDO::FETCH_ASSOC)) {
                $name = trim($legacyRole['evento']);
                if ($name !== '') {
                    $roles[] = ['id' => (int) $legacyRole['id'], 'name' => $name];
                    $roleNames[] = mb_strtolower($name);
                }
            }
        }
    }

    unset($usuario['contrasena']);
    $usuario['roles'] = $roles;
    $usuario['roleNames'] = $roleNames;
    $usuario['roleName'] = $roleNames[0] ?? null;

    // Castear tipos numéricos
    $usuario['id']    = (int) $usuario['id'];
    $usuario['edad']  = calcularEdadDesdeCurp($usuario['curp']);
    $usuario['tarjeton_path'] = findUploadedDocument($usuario['matricula'], 1);
    $usuario['foto_path'] = findUploadedDocument($usuario['matricula'], 6);
    $usuario['requires_2fa'] = true;
    if (is_numeric($usuario['idRol'])) {
        $usuario['idRol'] = (int) $usuario['idRol'];
    }
    $usuario['status']= (int) $usuario['status'];

    echo json_encode([
        'success' => true,
        'usuario' => $usuario
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>