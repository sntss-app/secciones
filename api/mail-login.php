<?php
/*
  Login del sistema.
  Recibe matricula y contraseña desde React, valida contra usuarios
  y devuelve los datos publicos del usuario junto con sus roles.
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

    $fecha = substr($curp, 4, 6); // Extrae la fecha de la CURP
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
 * Busca un documento subido en la carpeta de registro del usuario
 * El documentId es el tipo de documento: 1 = tarjeton, 6 = foto de perfil
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

// Recibe los datos del frontend (React) en formato JSON
$data = json_decode(file_get_contents("php://input"), true);
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';
$password  = isset($data['password'])  ? trim($data['password'])  : '';

// Validacion: ambos campos son obligatorios
if (empty($matricula) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Matricula y contraseña son obligatorias.']);
    exit;
}

try {
    // Consultar al usuario incluyendo los campos de bloqueo por intentos fallidos
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

    // Si no existe la matricula, avisar
    if (!$usuario) {
        echo json_encode(['success' => false, 'message' => 'Matricula no encontrada en el sistema.']);
        exit;
    }

    // Si el usuario no tiene contraseña, aun no completo su registro
    if (empty($usuario['contrasena'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Esta matricula aun no tiene registro completo. Por favor, ingresa a Registrarse para completar tu acceso.'
        ]);
        exit;
    }

    // Verificar si la cuenta esta bloqueada por muchos intentos fallidos
    $intentos_fallidos = (int)$usuario['intentos_fallidos'];
    $bloqueo_hasta = $usuario['bloqueo_hasta'];

    if ($bloqueo_hasta && new DateTime() < new DateTime($bloqueo_hasta)) {
        $restante = (new DateTime($bloqueo_hasta))->diff(new DateTime());
        $minutos = $restante->i + 1;
        http_response_code(429); // Too Many Requests
        echo json_encode([
            'success' => false,
            'message' => "Has superado el numero de intentos. Tu cuenta esta bloqueada por $minutos minutos.",
            'bloqueado' => true,
            'tiempo_restante' => $minutos
        ]);
        exit;
    }

    // Verificar si la contraseña es correcta
    if (!password_verify($password, $usuario['contrasena'])) {
        // Si es incorrecta, aumentar el contador de intentos fallidos
        $nuevos_intentos = $intentos_fallidos + 1;
        $mensaje = "Matricula o contraseña incorrectas. Intentos restantes: " . (5 - $nuevos_intentos);
        $bloquear = false;

        // Si llega a 5 intentos fallidos, bloquear por 15 minutos
        if ($nuevos_intentos >= 5) {
            $bloqueo_tiempo = (new DateTime())->modify('+15 minutes')->format('Y-m-d H:i:s');
            $update = $pdo->prepare("UPDATE usuarios SET intentos_fallidos = :intentos, bloqueo_hasta = :bloqueo WHERE matricula = :matricula");
            $update->execute([
                ':intentos' => $nuevos_intentos,
                ':bloqueo' => $bloqueo_tiempo,
                ':matricula' => $matricula
            ]);
            $mensaje = "Has superado el numero de intentos. Tu cuenta ha sido bloqueada por 15 minutos.";
            $bloquear = true;
            http_response_code(429);
        } else {
            // Si no llega a 5, solo actualizar el contador
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

    // Si la contraseña es correcta, reiniciar los intentos fallidos
    $reset = $pdo->prepare("UPDATE usuarios SET intentos_fallidos = 0, bloqueo_hasta = NULL WHERE matricula = :matricula");
    $reset->execute([':matricula' => $matricula]);

    // Si el usuario no tiene codigo_2fa, generarlo automaticamente
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

    // Obtener los roles del usuario (para saber si es validador, administrador, etc.)
    $roles = [];
    $roleNames = [];
    $roleName = null;

    // Verificar si existe la tabla usuario_roles
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

    // Si no hay roles en la tabla usuario_roles, usar el campo idRol (por compatibilidad)
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

    // Eliminar la contraseña de la respuesta por seguridad
    unset($usuario['contrasena']);
    $usuario['roles'] = $roles;
    $usuario['roleNames'] = $roleNames;
    $usuario['roleName'] = $roleNames[0] ?? null;

    // Convertir valores a numeros enteros
    $usuario['id']    = (int) $usuario['id'];
    $usuario['edad']  = calcularEdadDesdeCurp($usuario['curp']);
    $usuario['tarjeton_path'] = findUploadedDocument($usuario['matricula'], 1);
    $usuario['foto_path'] = findUploadedDocument($usuario['matricula'], 6);
    $usuario['requires_2fa'] = true; // 2FA siempre requerido
    if (is_numeric($usuario['idRol'])) {
        $usuario['idRol'] = (int) $usuario['idRol'];
    }
    $usuario['status']= (int) $usuario['status'];

    // Respuesta exitosa con todos los datos del usuario
    echo json_encode([
        'success' => true,
        'usuario' => $usuario
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}