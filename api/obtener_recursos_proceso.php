<?php
/*
  Obtener recursos (logo y convocatoria) de un proceso específico
  para una sección.
  Procesos disponibles: auto, hipotecario, clausula79bis, etc.
*/
require_once 'config.php';

$idSeccion = isset($_GET['idSeccion']) ? (int)$_GET['idSeccion'] : 0;
$proceso = isset($_GET['proceso']) ? trim($_GET['proceso']) : '';

if (empty($idSeccion) || empty($proceso)) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Sección y proceso son requeridos'
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            logo_url, 
            convocatoria_url,
            documento_url
        FROM secciones_procesos_docs 
        WHERE idSeccion = :idSeccion 
        AND proceso = :proceso
        AND status = 2
        LIMIT 1
    ");
    $stmt->execute([
        ':idSeccion' => $idSeccion,
        ':proceso' => $proceso
    ]);
    $recursos = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($recursos) {
        echo json_encode([
            'success' => true,
            'logo_url' => $recursos['logo_url'],
            'convocatoria_url' => $recursos['convocatoria_url'],
            'documento_url' => $recursos['documento_url']
        ]);
    } else {
        // Si no tiene recursos configurados, devolver null
        echo json_encode([
            'success' => true,
            'logo_url' => null,
            'convocatoria_url' => null,
            'documento_url' => null,
            'message' => 'No hay recursos configurados para este proceso en esta sección'
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Error en la base de datos: ' . $e->getMessage()
    ]);
}
?>