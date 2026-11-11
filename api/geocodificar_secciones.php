<?php
// api/geocodificar_secciones.php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

// ⏱️ Aumentar el tiempo de ejecución por si acaso
set_time_limit(120);
ini_set('max_execution_time', 120);

require_once 'config.php';

$clave_seguridad = $_GET['token'] ?? '';
$token_esperado = 'sntss_geocodifica_2026';

if ($clave_seguridad !== $token_esperado) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acceso denegado. Token inválido.']);
    exit;
}

// 🔢 Parámetro para elegir cuántas procesar por lote (por defecto 5)
$lote = isset($_GET['lote']) ? (int)$_GET['lote'] : 5;
$lote = max(1, min(10, $lote)); // Entre 1 y 10 máximo

try {
    // Contar cuántas faltan
    $stmtContar = $pdo->prepare("
        SELECT COUNT(*) as total 
        FROM secciones 
        WHERE status = 2 
        AND (latitud IS NULL OR longitud IS NULL)
        AND direccion IS NOT NULL 
        AND direccion != ''
    ");
    $stmtContar->execute();
    $totalFaltantes = (int) $stmtContar->fetch(PDO::FETCH_ASSOC)['total'];

    if ($totalFaltantes === 0) {
        echo json_encode([
            'success' => true,
            'message' => '✅ ¡Todas las secciones ya tienen coordenadas!',
            'faltantes' => 0
        ]);
        exit;
    }

    // Traer solo las primeras del lote
    $stmt = $pdo->prepare("
        SELECT id, nombre, direccion, romano 
        FROM secciones 
        WHERE status = 2 
        AND (latitud IS NULL OR longitud IS NULL)
        AND direccion IS NOT NULL 
        AND direccion != ''
        ORDER BY id ASC
        LIMIT {$lote}
    ");
    $stmt->execute();
    $secciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $resultados = [];
    $exitosas = 0;
    $fallidas = 0;

    foreach ($secciones as $seccion) {
        // Estrategia simplificada: SOLO 2 variantes para que sea rápido
        $variantes = [
            $seccion['direccion'],                                    // 1. Completa
            $seccion['nombre'] . ', México'                           // 2. Nombre de estado
        ];

        $coordenadas = null;
        $variante_usada = null;

        foreach ($variantes as $variante) {
            $coordenadas = consumirNominatim($variante);
            if ($coordenadas) {
                $variante_usada = $variante;
                break;
            }
            usleep(500000); // 0.5 segundos entre intentos
        }

        if ($coordenadas) {
            $update = $pdo->prepare("UPDATE secciones SET latitud = ?, longitud = ? WHERE id = ?");
            $update->execute([$coordenadas['lat'], $coordenadas['lng'], $seccion['id']]);

            $resultados[] = [
                'id' => $seccion['id'],
                'nombre' => $seccion['nombre'],
                'status' => 'OK',
                'lat' => $coordenadas['lat'],
                'lng' => $coordenadas['lng'],
                'variante' => $variante_usada
            ];
            $exitosas++;
        } else {
            $resultados[] = [
                'id' => $seccion['id'],
                'nombre' => $seccion['nombre'],
                'status' => 'SIN_RESULTADO'
            ];
            $fallidas++;
        }
    }

    $faltantesRestantes = $totalFaltantes - count($secciones);

    echo json_encode([
        'success' => true,
        'message' => "Lote procesado. Faltan {$faltantesRestantes} secciones.",
        'procesadas_este_lote' => count($secciones),
        'exitosas' => $exitosas,
        'fallidas' => $fallidas,
        'faltantes_totales' => $faltantesRestantes,
        'siguiente_paso' => $faltantesRestantes > 0 
            ? 'Vuelve a ejecutar esta misma URL para procesar el siguiente lote.'
            : '✅ ¡Listo! Todas las secciones procesadas.',
        'detalle' => $resultados
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

/**
 * Consume Nominatim API
 */
function consumirNominatim($query) {
    $url = 'https://nominatim.openstreetmap.org/search?' . http_build_query([
        'format' => 'json',
        'limit' => 1,
        'countrycodes' => 'mx',
        'q' => $query
    ]);

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_USERAGENT => 'SNTSS-Secciones-Portal/1.0 (contacto@sntss-secciones.org)',
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'Accept-Language: es-MX,es;q=0.9'
        ]
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $data = json_decode($response, true);
        if (!empty($data) && isset($data[0]['lat']) && isset($data[0]['lon'])) {
            return [
                'lat' => (float) $data[0]['lat'],
                'lng' => (float) $data[0]['lon']
            ];
        }
    }
    return null;
}