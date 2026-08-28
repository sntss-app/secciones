<?php
/*
  Lista todas las solicitudes de crédito de auto.
  Filtra por sección. Los superadmins pueden seleccionar cualquier sección.
  Devuelve el color de la sección de cada solicitante para mostrar en el frontend.
*/
require_once 'config.php';

function mapStatus($status) {
    $map = [
        1 => 'preregistro',
        2 => 'aprobado',
        3 => 'observaciones',
        4 => 'sinconcluir',
        5 => 'denegado',
    ];
    return $map[(int)$status] ?? 'preregistro';
}

function findDocumentPath($matricula, $documentId, $idSeccion = null) {
    $patterns = [];

    if ($idSeccion) {
        $patterns = array_merge(
            $patterns,
            glob(__DIR__ . "/uploads/*/auto/{$idSeccion}/{$matricula}/{$documentId}.*") ?: []
        );
    }

    $patterns = array_merge(
        $patterns,
        glob(__DIR__ . "/uploads/*/auto/*/{$matricula}/{$documentId}.*") ?: []
    );

    if (!$patterns || count($patterns) === 0) {
        return null;
    }
    rsort($patterns);
    $fullPath = $patterns[0];
    $relativePath = str_replace('\\', '/', str_replace(__DIR__, '', $fullPath));
    return '/api' . $relativePath;
}

// ✅ SUPERADMINS (pueden ver TODAS las secciones)
$superAdmins = [
    '97158643',
];

$validatorMatricula = isset($_GET['validatorMatricula']) ? trim($_GET['validatorMatricula']) : '';
$seccionFiltro = isset($_GET['seccion']) ? (int)$_GET['seccion'] : 0;

if (empty($validatorMatricula)) {
    $input = json_decode(file_get_contents('php://input'), true);
    $validatorMatricula = $input['validatorMatricula'] ?? '';
}

if (empty($validatorMatricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Matrícula del validador requerida']);
    exit;
}

try {
    // Obtener datos del validador
    $stmtValidador = $pdo->prepare("
        SELECT idSeccion, nombre, matricula
        FROM usuarios 
        WHERE matricula = :matricula 
        LIMIT 1
    ");
    $stmtValidador->execute([':matricula' => $validatorMatricula]);
    $validador = $stmtValidador->fetch(PDO::FETCH_ASSOC);

    if (!$validador) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Validador no encontrado']);
        exit;
    }

    $idSeccionValidador = $validador['idSeccion'];
    $esSuperAdmin = in_array($validatorMatricula, $superAdmins);

    // ✅ DETERMINAR SECCIÓN A FILTRAR
    if ($esSuperAdmin && $seccionFiltro > 0) {
        $idSeccionFiltro = $seccionFiltro;
    } elseif ($esSuperAdmin && $seccionFiltro == 0) {
        $idSeccionFiltro = null;
    } else {
        $idSeccionFiltro = $idSeccionValidador;
    }

    // ✅ CONSTRUIR CONSULTA CON COLOR DE LA SECCIÓN DEL SOLICITANTE
    $sql = "
        SELECT a.id, a.matricula, a.fecha_registro, a.status, a.valido, a.observaciones, a.fecha_validado,
                u.nombre, u.adscripcion, u.categoria, u.antiguedad, u.idSeccion,
                s.color_principal AS seccion_color
         FROM auto a
         JOIN usuarios u ON u.matricula = a.matricula
         LEFT JOIN secciones s ON u.idSeccion = s.id
    ";

    $params = [];

    if ($idSeccionFiltro !== null) {
        $sql .= " WHERE u.idSeccion = :idSeccion";
        $params[':idSeccion'] = $idSeccionFiltro;
    }

    $sql .= " ORDER BY a.fecha_registro DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $requests = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $idSeccionUsuario = $row['idSeccion'] ?? null;
        
        $requests[] = [
            'id' => isset($row['id']) ? (int)$row['id'] : null,
            'matricula' => $row['matricula'] ?? '',
            'nombre' => $row['nombre'] ?? 'Sin nombre',
            'adscripcion' => $row['adscripcion'] ?? 'N/A',
            'categoria' => $row['categoria'] ?? 'N/A',
            'antiguedad' => $row['antiguedad'] ?? '',
            'estatus' => mapStatus($row['status']),
            'fecha' => $row['fecha_registro'] ? date('Y-m-d', strtotime($row['fecha_registro'])) : null,
            'observaciones' => $row['observaciones'],
            'valido' => $row['valido'],
            'fecha_validado' => $row['fecha_validado'] ? date('Y-m-d', strtotime($row['fecha_validado'])) : null,
            'tarjetonName' => 'Tarjetón de Pago',
            'ineName' => 'Identificación Oficial INE',
            'tarjetonPath' => findDocumentPath($row['matricula'], 1, $idSeccionUsuario),
            'inePath' => findDocumentPath($row['matricula'], 2, $idSeccionUsuario),
            'seccion_color' => $row['seccion_color'] ?? '#3EAEF4', // ✅ COLOR DE LA SECCIÓN DEL SOLICITANTE
        ];
    }

    // ✅ OBTENER LISTA DE SECCIONES PARA EL SELECT (con color_principal para el selector)
    $secciones = [];
    if ($esSuperAdmin) {
        $stmtSecciones = $pdo->query("
            SELECT id, romano, nombre, color_principal
            FROM secciones 
            WHERE status = 2 
            ORDER BY arabigo
        ");
        while ($sec = $stmtSecciones->fetch(PDO::FETCH_ASSOC)) {
            $secciones[] = $sec;
        }
    }

    echo json_encode([
        'success' => true, 
        'requests' => $requests,
        'validador' => [
            'matricula' => $validatorMatricula,
            'nombre' => $validador['nombre'],
            'idSeccion' => $idSeccionValidador,
            'esSuperAdmin' => $esSuperAdmin
        ],
        'secciones' => $secciones,
        'filtroActual' => $idSeccionFiltro
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>