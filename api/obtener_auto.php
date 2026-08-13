<?php
/*
  Obtener registro de crédito auto de un usuario.
  Devuelve también los datos de la sección y los recursos del proceso.
*/
require_once 'config.php';

$matricula = isset($_GET['matricula']) ? trim($_GET['matricula']) : '';
if (empty($matricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La matrícula es obligatoria.']);
    exit;
}

try {
    // ✅ Obtener registro de auto con datos de la sección
    $stmt = $pdo->prepare("
        SELECT 
            a.id, 
            a.matricula, 
            a.idSeccion,
            a.fecha_registro, 
            a.valido, 
            a.observaciones, 
            a.fecha_validado, 
            a.status,
            s.romano AS seccion_romano,
            s.nombre AS seccion_nombre,
            s.color_principal AS seccion_color,
            spd.logo_url AS logo_auto_url,
            spd.convocatoria_url AS convocatoria_auto_url
        FROM auto a
        LEFT JOIN secciones s ON a.idSeccion = s.id
        LEFT JOIN secciones_procesos_docs spd ON a.idSeccion = spd.idSeccion AND spd.proceso = 'auto'
        WHERE a.matricula = :matricula
        LIMIT 1
    ");
    $stmt->execute([':matricula' => $matricula]);
    $credito = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($credito) {
        // Mapear estatus
        $estatusMap = [
            1 => 'preregistro',
            2 => 'aprobado',
            3 => 'observaciones',
            4 => 'denegado'
        ];
        $credito['estatus'] = $estatusMap[$credito['status']] ?? 'preregistro';
        
        // Formatear fechas
        $credito['fecha'] = date('d/m/Y H:i', strtotime($credito['fecha_registro']));
        $credito['fecha_validado'] = $credito['fecha_validado'] 
            ? date('d/m/Y H:i', strtotime($credito['fecha_validado'])) 
            : null;
        
        echo json_encode([
            'success' => true,
            'credit' => $credito
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No hay registro de crédito para esta matrícula.'
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>