<?php
/*
  Estadísticas para el evento Cláusula 79Bis
*/
require_once 'config.php';

header('Content-Type: application/json');

try {
    // Totales generales
    $total = $pdo->query("SELECT COUNT(*) FROM clausula79bis")->fetchColumn();
    
    // Aprobados (estatus 2)
    $aprobados = $pdo->query("SELECT COUNT(*) FROM clausula79bis WHERE estatus = 2")->fetchColumn();
    
    // Check-in trabajadores
    $check_trabajadores = $pdo->query("SELECT COUNT(*) FROM clausula79bis WHERE entrada_trabajador IS NOT NULL")->fetchColumn();
    
    // Check-in acompañantes
    $check_acompanantes = $pdo->query("SELECT COUNT(*) FROM clausula79bis WHERE entrada_acompanante IS NOT NULL")->fetchColumn();
    
    // Total de personas (trabajadores + acompañantes)
    $total_personas = $check_trabajadores + $check_acompanantes;
    
    // Sin registro
    $sin_registro = $pdo->query("SELECT COUNT(*) FROM clausula79bis WHERE sin_registro = 1")->fetchColumn();

    echo json_encode([
        'success' => true,
        'estadisticas' => [
            'total_registros' => (int)$total,
            'total_aprobados' => (int)$aprobados,
            'check_in_trabajadores' => (int)$check_trabajadores,
            'check_in_acompanantes' => (int)$check_acompanantes,
            'total_personas' => (int)$total_personas,
            'sin_registro' => (int)$sin_registro
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en BD: ' . $e->getMessage()]);
}
?>