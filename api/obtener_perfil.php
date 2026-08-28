<?php
/*
  Perfil completo del trabajador.
  Lee datos de usuarios (IMSS) y registros (sistema).
  Calcula edad desde CURP y busca documentos subidos durante el registro inicial.
  Ahora busca en todas las tablas de usuarios (activos, jubilados, confianza).
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

function findUploadedDocument($matricula, $documentId, $idSeccion = null, $idTipo = null) {
    $patterns = [];

    // Mapear tipo a letra de carpeta
    $tipoMap = [
        1 => 'a',
        2 => 'j',
        3 => 'c'
    ];
    $carpetaTipo = $tipoMap[$idTipo] ?? '*';

    // 1. Ruta con tipo + sección
    if ($idSeccion && $idTipo) {
        $patterns = array_merge(
            $patterns,
            glob(__DIR__ . "/uploads/*/registro/{$carpetaTipo}/{$idSeccion}/{$matricula}/{$documentId}.*") ?: []
        );
    }

    // 2. Ruta con tipo en wildcard
    $patterns = array_merge(
        $patterns,
        glob(__DIR__ . "/uploads/*/registro/{$carpetaTipo}/*/{$matricula}/{$documentId}.*") ?: []
    );

    // 3. Ruta con sección en wildcard
    $patterns = array_merge(
        $patterns,
        glob(__DIR__ . "/uploads/*/registro/*/{$idSeccion}/{$matricula}/{$documentId}.*") ?: []
    );

    // 4. Ruta antigua sin tipo y sin sección
    $patterns = array_merge(
        $patterns,
        glob(__DIR__ . "/uploads/*/registro/{$matricula}/{$documentId}.*") ?: []
    );

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
    // ✅ BUSCAR EL USUARIO EN TODAS LAS TABLAS
    $usuario = null;
    $tablaOrigen = '';

    // 1. Buscar en usuarios (activos)
    $stmt = $pdo->prepare("
        SELECT 
            u.id, 
            u.matricula, 
            u.idSeccion,
            u.idTipo,
            REPLACE(u.nombre, '/', ' ') AS nombre,
            u.adscripcion, 
            u.categoria, 
            u.curp, 
            u.sexo,
            u.antiguedad,
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
                u.idSeccion,
                u.idTipo,
                REPLACE(u.nombre, '/', ' ') AS nombre,
                NULL AS adscripcion, 
                NULL AS categoria, 
                u.curp, 
                u.sexo,
                NULL AS antiguedad,
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
                u.idSeccion,
                u.idTipo,
                REPLACE(u.nombre, '/', ' ') AS nombre,
                u.adscripcion, 
                u.categoria, 
                u.curp, 
                u.sexo,
                u.antiguedad,
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

    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No se encontró el usuario.']);
        exit;
    }

    // ✅ OBTENER DATOS DE REGISTROS
    $stmtRegistro = $pdo->prepare("
        SELECT 
            telefono, 
            correo, 
            fecha_registro,
            status AS registro_status
        FROM registros 
        WHERE matricula = :matricula
        LIMIT 1
    ");
    $stmtRegistro->execute([':matricula' => $matricula]);
    $registro = $stmtRegistro->fetch(PDO::FETCH_ASSOC);

    // Si no existe en registros, poner valores por defecto
    if ($registro) {
        $usuario['telefono'] = $registro['telefono'] ?? null;
        $usuario['correo'] = $registro['correo'] ?? null;
        $usuario['fecha_registro'] = $registro['fecha_registro'] ?? null;
        $usuario['registro_status'] = $registro['registro_status'] ?? 0;
    } else {
        $usuario['telefono'] = null;
        $usuario['correo'] = null;
        $usuario['fecha_registro'] = null;
        $usuario['registro_status'] = 0;
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

    // 🔥 OBTENER ROLES DESDE usuario_roles
    $roles = [];
    $roleIds = [];
    $roleNames = [];

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
            $roleIds[] = (int) $row['id'];
            $roleNames[] = $name;
        }
    }

    // Agregar roles al usuario
    $usuario['roles'] = $roles;
    $usuario['roleIds'] = $roleIds;
    $usuario['roleNames'] = $roleNames;
    $usuario['roleName'] = $roleNames[0] ?? null;

    // Castear tipos
    $usuario['id'] = (int) $usuario['id'];
    $usuario['idSeccion'] = isset($usuario['idSeccion']) ? (int) $usuario['idSeccion'] : 0;
    $usuario['idTipo'] = isset($usuario['idTipo']) ? (int) $usuario['idTipo'] : 1;
    $usuario['status'] = (int) ($usuario['registro_status'] ?? 0);
    $usuario['edad'] = calcularEdadDesdeCurp($usuario['curp']);
    $usuario['tarjeton_path'] = findUploadedDocument($matricula, 1, (int) $usuario['idSeccion'], (int) $usuario['idTipo']);
    $usuario['foto_path'] = findUploadedDocument($matricula, 6, (int) $usuario['idSeccion'], (int) $usuario['idTipo']);
    $usuario['tabla_origen'] = $tablaOrigen;

    // Quitar campos que no necesitamos en la respuesta
    unset($usuario['registro_status']);

    echo json_encode(['success' => true, 'usuario' => $usuario]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>