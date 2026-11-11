<?php
// api/chatbot_rag.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';
require_once __DIR__ . '/../vendor/autoload.php';

// ============================================
// 0. CONVERSACIÓN CASUAL (GRACIAS, HOLA, ETC)
// ============================================
$query = isset($_GET['q']) ? trim($_GET['q']) : '';
$matricula = isset($_GET['matricula']) ? trim($_GET['matricula']) : null;

if (strlen($query) < 2) {
    echo json_encode(['success' => false, 'error' => 'Escribe al menos 2 caracteres.']);
    exit;
}

$query_normalizada = strtolower(trim($query));
$casuales = ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'gracias', 'muchas gracias', 'te agradezco', 'ok', 'perfecto', 'genial', 'adios', 'hasta luego'];

if (in_array($query_normalizada, $casuales) || str_contains($query_normalizada, 'gracias') || str_contains($query_normalizada, 'hola')) {
    $respuesta_casual = "¡Con gusto! 😊 Si tienes otra duda sobre los Estatutos del SNTSS, aquí estoy para ayudarte.";
    
    if (str_contains($query_normalizada, 'gracias')) {
        $respuesta_casual = "¡No hay de qué! 😊 Me alegra poder ayudarte. Si tienes otra duda sobre los Estatutos o cualquier otro tema sindical, aquí estoy para lo que necesites.";
    } elseif (str_contains($query_normalizada, 'hola') || str_contains($query_normalizada, 'buenos')) {
        $respuesta_casual = "¡Hola! 👋 Soy **Dele-Bot**, tu asistente virtual. Puedo ayudarte con consultas sobre los Estatutos del SNTSS. ¿Qué te gustaría saber?";
    }

    echo json_encode([
        'success' => true,
        'respuesta' => $respuesta_casual,
        'fuente' => 'Dele-Bot',
        'contexto_usado' => 0,
        'color' => '#486DAA',
        'articulos_referencia' => [],
        'usuario' => null,
        'modo_ia' => false
    ]);
    exit;
}

try {
    // ============================================
    // 2. LIMPIEZA Y DICCIONARIO
    // ============================================
    $query_original = $query;
    $query_limpia = strtolower(trim($query));
    $query_limpia = preg_replace('/[¿?¡!.]/', '', $query_limpia);
    $query_limpia = preg_replace('/\b(art[ií]culo|art\.|cap[ií]tulo|incisos|subincisos|hijos|fracciones|apartados|dame|muestra|lista|todo|toda|contenido|hablame|explicame|muestrame|los|las|del|de|el|la|cu[aá]l|es|qu[eé]|c[oó]mo|cu[aá]ndo|d[oó]nde|un|una|al|a|y|o|por|para|con|en|mi|tu|su|se|que|no|s[ií]|sobre|dime|quiero|necesito|favor|puedes|podrias|ayudame|busca|encuentra|mis|tus|nuestros|nuestras|algun|alguna|algunos|algunas|estos|estas|aquellos|aquellas|esa|ese|eso|esta|este|esto|muy|mas|menos|tan|tanto|tanta|todos|todas|ellas|ellos|nosotros|vosotros|ustedes|cual|cuales|quien|quienes|donde|cuando|porque|aunque|si|no|ya|tambien|despues|antes|ahora|entonces|asi|pues|bien|mal|ser|estar|tener|haber|hacer|decir|poder|deber|saber|querer|venir|ir|ver|dar|poner|saber|parecer|creer|encontrar|dejar|seguir|volver|usar|utilizar|referente|respecto|acerca|sobre|acerca|mediante|cualquier|cualquiera|ningun|ninguna|nadie|nada|algo|alguien|otro|otra|otros|otras)\b/i', '', $query_limpia);
    $query_limpia = trim($query_limpia);

    // Diccionario de sinónimos (forzar búsqueda de título exacto)
    $diccionario = [
        'secretario general' => 'Secretario General',
        'secretario de conflictos' => 'Secretario de Conflictos',
        'secretario del interior' => 'Secretario del Interior y Propaganda',
        'secretario de prensa' => 'Secretario de Prensa',
        'secretario tesorero' => 'Secretario Tesorero',
        'comision de vigilancia' => 'Comisión de Vigilancia',
        'comision de honor y justicia' => 'Comisión de Honor y Justicia',
        'elecciones' => 'elecciones',
        'derechos' => 'derechos',
        'obligaciones' => 'obligaciones',
        'cuotas' => 'cuotas',
        'sanciones' => 'sanciones',
        'castigos' => 'sanciones',
        'miembros' => 'miembros',
    ];

    foreach ($diccionario as $clave => $valor) {
        if (str_contains($query_original, $clave)) {
            $query_limpia = $valor;
            break;
        }
    }

    // Extraer número (para buscar artículo exacto)
    $numero_articulo = null;
    if (preg_match('/\d+/', $query_limpia, $matches)) {
        $numero_articulo = intval($matches[0]);
    }

    // ============================================
    // 3. BÚSQUEDA PRIORIZADA (EXACTA PRIMERO)
    // ============================================
    $resultados = [];

    // A) Si hay número de artículo, buscar exacto
    if ($numero_articulo) {
        $stmt = $pdo->prepare("
            SELECT id, id_padre, tipo, titulo, contenido, color, status
            FROM nodos_estatutos
            WHERE status = 1
            AND tipo = 'clausula'
            AND (titulo LIKE :exacto OR titulo LIKE :exacto2)
            ORDER BY id ASC LIMIT 1
        ");
        // Buscar "ARTÍCULO 90." o "Artículo 90"
        $stmt->execute([
            ':exacto' => "ARTÍCULO " . $numero_articulo . ".%",
            ':exacto2' => "Artículo " . $numero_articulo . ".%"
        ]);
        $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Si lo encontramos y piden incisos, traer hijos
        if (!empty($resultados) && (str_contains($query_original, 'inciso') || str_contains($query_original, 'fraccion'))) {
            $articulo_id = $resultados[0]['id'];
            $stmt_hijos = $pdo->prepare("
                SELECT id, id_padre, tipo, titulo, contenido, color, status
                FROM nodos_estatutos
                WHERE status = 1 AND id_padre = :padre
                AND tipo IN ('inciso', 'subinciso', 'parrafo')
                ORDER BY 
                    CASE 
                        WHEN titulo LIKE 'I.%' THEN 1
                        WHEN titulo LIKE 'II.%' THEN 2
                        WHEN titulo LIKE 'III.%' THEN 3
                        WHEN titulo LIKE 'IV.%' THEN 4
                        WHEN titulo LIKE 'V.%' THEN 5
                        WHEN titulo LIKE 'VI.%' THEN 6
                        WHEN titulo LIKE 'VII.%' THEN 7
                        WHEN titulo LIKE 'VIII.%' THEN 8
                        WHEN titulo LIKE 'IX.%' THEN 9
                        WHEN titulo LIKE 'X.%' THEN 10
                        ELSE 99 END ASC
            ");
            $stmt_hijos->execute([':padre' => $articulo_id]);
            $resultados = array_merge($resultados, $stmt_hijos->fetchAll(PDO::FETCH_ASSOC));
        }
    }

    // B) Si no hay número o no encontró, buscar por TÍTULO EXACTO
    if (empty($resultados)) {
        $stmt = $pdo->prepare("
            SELECT id, id_padre, tipo, titulo, contenido, color, status
            FROM nodos_estatutos
            WHERE status = 1
            AND tipo IN ('clausula', 'articulo')
            AND titulo LIKE :titulo
            ORDER BY id ASC LIMIT 5
        ");
        $stmt->execute([':titulo' => '%' . $query_limpia . '%']);
        $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // C) Si no hay nada, búsqueda por palabras clave
    if (empty($resultados)) {
        $like = '%' . $query_limpia . '%';
        $stmt = $pdo->prepare("
            SELECT id, id_padre, tipo, titulo, contenido, color, status
            FROM nodos_estatutos
            WHERE status = 1
            AND (titulo LIKE :busqueda OR contenido LIKE :busqueda)
            AND tipo IN ('clausula', 'inciso', 'subinciso', 'parrafo')
            ORDER BY CHAR_LENGTH(titulo) ASC
            LIMIT 10
        ");
        $stmt->execute([':busqueda' => $like]);
        $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ============================================
    // 4. SI NO HAY RESULTADOS
    // ============================================
    if (empty($resultados)) {
        echo json_encode([
            'success' => false,
            'message' => 'No encontré información sobre eso en los Estatutos.',
            'sugerencia' => '💡 Intenta con otras palabras clave como: derechos, obligaciones, elecciones, cuotas, etc.'
        ]);
        exit;
    }

    // ============================================
    // 5. CONSTRUIR CONTEXTO PARA LA IA
    // ============================================
    $contexto = "Eres Dele-Bot, un asistente sindical experto en los Estatutos del SNTSS.\n\n";
    $contexto .= "REGLAS:\n";
    $contexto .= "1. Responde ÚNICAMENTE basándote en el contenido oficial proporcionado.\n";
    $contexto .= "2. NO inventes artículos ni información.\n";
    $contexto .= "3. IMPORTANTE: Si el usuario pregunta por 'incisos' o 'fracciones', presenta TODOS los incisos en orden (I, II, III, IV, V...) Y COPIA EXACTAMENTE el contenido de cada uno, empezando por su NÚMERO ROMANO (ej: 'I. Contenido...', 'II. Contenido...').\n";
    $contexto .= "4. Si hay varios artículos relevantes, menciónalos, pero responde directo primero.\n";
    $contexto .= "5. Habla claro, amable y profesional.\n";
    $contexto .= "6. Siempre cita el artículo, capítulo o apartado como fuente.\n\n";
    $contexto .= "CONTEXTO DE LOS ESTATUTOS:\n";

    $referencias = [];

    foreach ($resultados as $r) {
        // Ubicación jerárquica
        $ubicacion = [];
        $actual = $r['id_padre'];
        while ($actual && count($ubicacion) < 4) {
            $stmt = $pdo->prepare("SELECT id, id_padre, titulo FROM nodos_estatutos WHERE id = ? LIMIT 1");
            $stmt->execute([$actual]);
            $padre = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$padre) break;
            if (!empty($padre['titulo'])) $ubicacion[] = $padre['titulo'];
            $actual = $padre['id_padre'];
        }
        $ubicacion = array_reverse($ubicacion);

        $contenido_limpio = strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", $r['contenido']));
        $contenido_limpio = html_entity_decode($contenido_limpio, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        $contexto .= "\n---\n";
        $contexto .= "TÍTULO: " . ($r['titulo'] ?: '(sin título)') . "\n";
        if (!empty($ubicacion)) $contexto .= "UBICACIÓN: " . implode(' → ', $ubicacion) . "\n";
        $contexto .= "CONTENIDO: " . $contenido_limpio . "\n";

        $ref = implode(', ', $ubicacion);
        if (!empty($r['titulo'])) {
            if ($ref !== '') $ref .= ', ';
            $ref .= $r['titulo'];
        }
        $referencias[] = $ref;
    }

    // ============================================
    // 6. GENERAR RESPUESTA
    // ============================================
    
    // ⚠️ PON TU NUEVA CLAVE AQUÍ (Bórrala en OpenAI y crea una nueva)
    $apiKey = defined('OPENAI_API_KEY') ? OPENAI_API_KEY : getenv('OPENAI_API_KEY');

    if (!$apiKey || strpos($apiKey, 'sk-') !== 0) {
        // Respuesta directa sin IA
        $r = $resultados[0];
        $respuesta = "📖 **" . ($r['titulo'] ?: 'Estatutos') . "**\n\n";
        $ubicacion = [];
        $actual = $r['id_padre'];
        while ($actual && count($ubicacion) < 4) {
            $stmt = $pdo->prepare("SELECT id, id_padre, titulo FROM nodos_estatutos WHERE id = ? LIMIT 1");
            $stmt->execute([$actual]);
            $padre = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$padre) break;
            if (!empty($padre['titulo'])) $ubicacion[] = $padre['titulo'];
            $actual = $padre['id_padre'];
        }
        $ubicacion = array_reverse($ubicacion);
        if (!empty($ubicacion)) $respuesta .= "📍 " . implode(' → ', $ubicacion) . "\n\n";
        $respuesta .= strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", $r['contenido']));
        
        // Si hay incisos, agregarlos
        if (count($resultados) > 1) {
            $respuesta .= "\n\n**Incisos:**\n";
            foreach (array_slice($resultados, 1) as $inciso) {
                $respuesta .= "- " . ($inciso['titulo'] ?: '') . ": " . strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", $inciso['contenido'])) . "\n";
            }
        }
        
        $color = $r['color'] ?: '#486DAA';
        $fuente = 'Dele-Bot (búsqueda directa)';
        $usando_ia = false;

    } else {
        $usando_ia = true;
        $fuente = 'Dele-Bot IA';
        $openai = \OpenAI::client($apiKey);

        $messages = [
            ['role' => 'system', 'content' => $contexto]
        ];
        $messages[] = ['role' => 'user', 'content' => $query_original];

        $response = $openai->chat()->create([
            'model' => 'gpt-4o-mini',
            'messages' => $messages,
            'temperature' => 0.1,
            'max_tokens' => 1200,
        ]);

        $respuesta = $response['choices'][0]['message']['content'];
        $color = $resultados[0]['color'] ?: '#486DAA';
    }

    // ============================================
    // 7. GUARDAR EN HISTORIAL
    // ============================================
    if ($matricula) {
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;
        $stmt = $pdo->prepare("
            INSERT INTO chatbot_historial 
            (matricula, pregunta, respuesta, fuente, idSeccion, idTipo, ip, user_agent, votos_positivos, votos_negativos) 
            VALUES (?, ?, ?, 'estatutos', ?, ?, ?, ?, 0, 0)
        ");
        $stmt->execute([$matricula, $query_original, $respuesta, $idSeccion ?? null, $idTipo ?? null, $ip, $user_agent]);
    }

    // ============================================
    // 8. RESPUESTA FINAL
    // ============================================
    echo json_encode([
        'success' => true,
        'respuesta' => $respuesta,
        'fuente' => $fuente,
        'contexto_usado' => count($resultados),
        'color' => $color,
        'articulos_referencia' => array_values(array_unique($referencias)),
        'usuario' => $matricula ? ['nombre' => $nombre, 'idTipo' => $idTipo, 'idSeccion' => $idSeccion] : null,
        'modo_ia' => $usando_ia
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al procesar la consulta: ' . $e->getMessage()]);
}