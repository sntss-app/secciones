<?php
// api/chatbot_rag.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';
require_once __DIR__ . '/../vendor/autoload.php';

// ============================================
// 1. PARÁMETROS
// ============================================
$query = $_GET['q'] ?? '';
$matricula = $_GET['matricula'] ?? null;

if (strlen($query) < 2) {
    echo json_encode(['error' => 'Escribe al menos 2 caracteres']);
    exit;
}

try {
    // ============================================
    // 2. DETECCIÓN DE CONVERSACIÓN CASUAL
    // ============================================
    $query_lower = strtolower(trim($query));
    
    $palabras_casuales = ['gracias', 'hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'adios', 'hasta luego', 'ok', 'perfecto', 'genial', 'te agradezco', 'muy bien'];
    
    if (in_array($query_lower, $palabras_casuales) || str_contains($query_lower, 'gracias') || str_contains($query_lower, 'hola')) {
        
        $respuesta_casual = "¡Con gusto! 😊 Estoy aquí para ayudarte con cualquier duda sobre los Estatutos del SNTSS. ¿Hay algo más en lo que pueda ayudarte?";
        
        if (str_contains($query_lower, 'gracias')) {
            $respuesta_casual = "¡No hay de qué! 😊 Me alegra poder ayudarte. Si tienes otra duda sobre los Estatutos o cualquier otro tema sindical, aquí estoy para lo que necesites.";
        } elseif (str_contains($query_lower, 'hola') || str_contains($query_lower, 'buenos')) {
            $respuesta_casual = "¡Hola! 👋 Soy **Dele-Bot**, tu asistente virtual. Puedo ayudarte con consultas sobre los Estatutos del SNTSS. ¿Qué te gustaría saber?";
        }
        
        if ($matricula) {
            $ip = $_SERVER['REMOTE_ADDR'] ?? null;
            $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;
            $stmt = $pdo->prepare("
                INSERT INTO chatbot_historial 
                (matricula, pregunta, respuesta, fuente, idSeccion, idTipo, ip, user_agent, votos_positivos, votos_negativos) 
                VALUES (?, ?, ?, 'estatutos', ?, ?, ?, ?, 0, 0)
            ");
            $stmt->execute([
                $matricula, $query, $respuesta_casual, $idSeccion ?? null, $idTipo ?? null, $ip, $user_agent
            ]);
        }
        
        echo json_encode([
            'success' => true,
            'respuesta' => $respuesta_casual,
            'fuente' => 'Dele-Bot IA',
            'contexto_usado' => 0,
            'color' => '#486DAA',
            'articulos_referencia' => [],
            'usuario' => null,
            'modo_ia' => true
        ]);
        exit;
    }

    // ============================================
    // 3. OBTENER DATOS DEL USUARIO E HISTORIAL
    // ============================================
    $idSeccion = null;
    $idTipo = null;
    $nombre = null;
    $historial_personal = [];

    if ($matricula) {
        $tables = ['usuarios', 'usuariosJ', 'usuariosC'];
        foreach ($tables as $table) {
            $stmt = $pdo->prepare("SELECT nombre, idSeccion, idTipo FROM $table WHERE matricula = :matricula LIMIT 1");
            $stmt->execute([':matricula' => $matricula]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $nombre = $row['nombre'];
                $idSeccion = $row['idSeccion'];
                $idTipo = $row['idTipo'];
                break;
            }
        }

        $stmt_hist = $pdo->prepare("
            SELECT pregunta, respuesta 
            FROM chatbot_historial 
            WHERE matricula = :matricula 
            ORDER BY id DESC 
            LIMIT 4
        ");
        $stmt_hist->execute([':matricula' => $matricula]);
        $historial_db = $stmt_hist->fetchAll(PDO::FETCH_ASSOC);
        $historial_db = array_reverse($historial_db);

        foreach ($historial_db as $msg) {
            $historial_personal[] = ['role' => 'user', 'content' => $msg['pregunta']];
            $historial_personal[] = ['role' => 'assistant', 'content' => $msg['respuesta']];
        }
    }

    // Historial global para retroalimentación
    $historial_global = [];
    $stmt_global = $pdo->query("
        SELECT pregunta, respuesta 
        FROM chatbot_historial 
        WHERE respuesta != '' 
        AND votos_positivos > votos_negativos
        ORDER BY votos_positivos DESC 
        LIMIT 5
    ");
    $historial_global = $stmt_global->fetchAll(PDO::FETCH_ASSOC);

    // ============================================
    // 4. RETRIEVAL: LIMPIEZA + DICCIONARIOS
    // ============================================
    $query_original = $query;

    $query_limpia = preg_replace('/\b(art[ií]culo|art\.|cap[ií]tulo|incisos|subincisos|hijos|fracciones|apartados|dame|muestra|lista|todo|toda|contenido|hablame|explicame|muestrame|los|las|del|de|el|la|cu[aá]l|es|qu[eé]|c[oó]mo|cu[aá]ndo|d[oó]nde|un|una|al|a|y|o|por|para|con|en|mi|tu|su|se|que|no|s[ií]|sobre|dime|quiero|necesito|favor|puedes|podrias|ayudame|busca|encuentra|mis|tus|nuestros|nuestras|algun|alguna|algunos|algunas|estos|estas|aquellos|aquellas|esa|ese|eso|esta|este|esto|muy|mas|menos|tan|tanto|tanta|todos|todas|ellas|ellos|nosotros|vosotros|ustedes|cual|cuales|quien|quienes|donde|cuando|porque|aunque|si|no|ya|tambien|despues|antes|ahora|entonces|asi|pues|bien|mal|ser|estar|tener|haber|hacer|decir|poder|deber|saber|querer|venir|ir|ver|dar|poner|saber|parecer|creer|encontrar|dejar|seguir|volver|usar|utilizar|referente|respecto|acerca|sobre|acerca|mediante|cualquier|cualquiera|ningun|ninguna|nadie|nada|algo|alguien|otro|otra|otros|otras)\b/i', '', $query);
    $query_limpia = preg_replace('/[¿?¡!.]/', '', $query_limpia);
    $query_limpia = trim($query_limpia);
    
    if (empty($query_limpia)) {
        $query_limpia = $query_original;
    }

        // ============================================
        // DICCIONARIO UNIFICADO (SINÓNIMOS + SECRETARÍAS + COMISIONES)
        // ============================================
        $diccionario = [
            // Secretarías del Comité Ejecutivo Nacional
            'interior' => 'Secretario del Interior y Propaganda',
            'propaganda' => 'Secretario del Interior y Propaganda',
            'prensa' => 'Secretario de Prensa',
            'conflictos' => 'Secretario de Conflictos',
            'calidad' => 'Secretario de Calidad y Modernización',
            'modernizacion' => 'Secretario de Calidad y Modernización',
            'capacitacion' => 'Secretario de Capacitación y Adiestramiento',
            'adiestramiento' => 'Secretario de Capacitación y Adiestramiento',
            'finanzas' => 'Secretario Tesorero',
            'hacienda' => 'Secretario Tesorero',
            'tesorero' => 'Secretario Tesorero',
            'actas' => 'Secretario de Actas y Acuerdos',
            'acuerdos' => 'Secretario de Actas y Acuerdos',
            'organizacion' => 'Secretario de Organización',
            'prevision' => 'Secretario de Previsión Social',
            'prevision social' => 'Secretario de Previsión Social',
            'habitacion' => 'Secretario de Fomento de la Habitación',
            'vivienda' => 'Secretario de Fomento de la Habitación',
            'exterior' => 'Secretario del Exterior',
            'deportes' => 'Secretario de Deportes',
            'cultura' => 'Secretario de Cultura, Recreación y Turismo',
            'turismo' => 'Secretario de Cultura, Recreación y Turismo',
            'mujer' => 'Secretaria de Igualdad Sustantiva',
            'igualdad' => 'Secretaria de Igualdad Sustantiva',
            'juventud' => 'Secretaria de Igualdad Sustantiva',
            'salud' => 'Secretario de Previsión Social',
            'seguridad' => 'Secretario de Previsión Social',
            'trabajo' => 'Secretario de Trabajo',
            'asuntos tecnicos' => 'Secretario de Asuntos Técnicos',
            'accion social' => 'Secretario de Acción Social',
            'accion' => 'Secretario de Acción Social',
            'social' => 'Secretario de Acción Social',
            'admission' => 'Secretario de Admisión y Cambios',
            'cambios' => 'Secretario de Admisión y Cambios',
            'accion politica' => 'Secretario de Acción Política',
            'politica' => 'Secretario de Acción Política',
            'secciones' => 'Secretario de Secciones Sindicales y Delegaciones Foráneas Autónomas',
            'delegaciones' => 'Secretario de Secciones Sindicales y Delegaciones Foráneas Autónomas',

            // Comisiones
            'honor y justicia' => 'Comisión de Honor y Justicia',
            'comision de honor' => 'Comisión de Honor y Justicia',
            'justicia' => 'Comisión de Honor y Justicia',
            'presidente de honor' => 'Comisión de Honor y Justicia',
            'vigilancia' => 'Comisión de Vigilancia',
            'deportes' => 'Comisión de Deportes',
            'seguridad social' => 'Comisión de Fomento de la Seguridad Social',
            'fomento' => 'Comisión de Fomento de la Seguridad Social',
            'capacitacion tecnica' => 'Comisión Nacional de Capacitación Técnica y Subprofesional',
            'actos y festejos' => 'Comisión Nacional de Actos y Festejos',
            'festejos' => 'Comisión Nacional de Actos y Festejos',
            'cultura y recreacion' => 'Comisión Nacional de Cultura y Recreación',
            'recreacion' => 'Comisión Nacional de Cultura y Recreación',
            'peritaje medico' => 'Comisión Nacional de Peritaje Médico',
            'peritaje' => 'Comisión Nacional de Peritaje Médico',
            'medico' => 'Comisión Nacional de Peritaje Médico',

            // Representantes
            'representante del comite' => 'Representantes del Comité Ejecutivo Nacional ante las Secciones y Delegaciones Foráneas Autónomas',
            'representantes' => 'Representantes del Comité Ejecutivo Nacional ante las Secciones y Delegaciones Foráneas Autónomas',
            'representante sindical' => 'Representantes del Comité Ejecutivo Nacional ante las Secciones y Delegaciones Foráneas Autónomas',
            'representacion' => 'Representantes del Comité Ejecutivo Nacional ante las Secciones y Delegaciones Foráneas Autónomas',

            // Comités y Órganos de Gobierno
            'comite nacional' => 'Comité Ejecutivo Nacional',
            'comite seccional' => 'Comité Ejecutivo Seccional',
            'comite ejecutivo' => 'Comité Ejecutivo Nacional',
            'ejecutivo nacional' => 'Comité Ejecutivo Nacional',
            'ejecutivo seccional' => 'Comité Ejecutivo Seccional',
            'congreso' => 'Congreso',
            'congreso nacional' => 'Congreso Nacional',
            'consejo' => 'Consejo',
            'consejo consultivo' => 'Consejo Consultivo',
            'asamblea' => 'Asamblea',
            'asamblea general' => 'Asamblea General',

            // Conceptos Generales
            'sindicato' => 'Sindicato Nacional de Trabajadores del Seguro Social',
            'sntss' => 'Sindicato Nacional de Trabajadores del Seguro Social',
            'derechos' => 'derechos',
            'obligaciones' => 'obligaciones',
            'castigos' => 'sanciones',               
            'sanciones' => 'sanciones',              
            'castigo' => 'sanciones',                
            'penalizaciones' => 'sanciones',
            'cuotas' => 'cuotas',
            'aportaciones' => 'cuotas',
            'elecciones' => 'elecciones',
            'votaciones' => 'elecciones',
            'afiliacion' => 'afiliación',
            'miembros' => 'miembros',
            'trabajadores' => 'trabajadores',
            'fondo' => 'Fondo de Ayuda Sindical',
            'defuncion' => 'Fondo de Ayuda Sindical por Defunción',
            'secretario general' => 'Secretario General',
            'presidente' => 'Presidente'
        ];

    // Detectar y aplicar diccionario
    foreach ($diccionario as $clave => $valor) {
        if (str_contains(strtolower($query_original), $clave) || str_contains(strtolower($query_limpia), $clave)) {
            $query_limpia = $valor;
            break;
        }
    }

    // Extraer números
    preg_match_all('/\d+/', $query_limpia, $matches);
    $numeros_encontrados = $matches[0];

    $resultados = [];

    // Si hay un número, buscar directamente por ese número
    if (!empty($numeros_encontrados)) {
        $numero_articulo = $numeros_encontrados[0];
        
        $sql_num = "
            SELECT 
                id,
                tipo,
                titulo,
                contenido,
                color,
                (SELECT titulo FROM nodos_estatutos WHERE id = n.id_padre) as padre_titulo,
                (SELECT titulo FROM nodos_estatutos WHERE id = (SELECT id_padre FROM nodos_estatutos WHERE id = n.id_padre)) as abuelo_titulo
            FROM nodos_estatutos n
            WHERE status = 1 
            AND (titulo LIKE :num_busqueda OR contenido LIKE :num_busqueda)
            AND tipo IN ('clausula', 'inciso', 'subinciso', 'parrafo')
            ORDER BY CHAR_LENGTH(titulo) ASC
            LIMIT 5
        ";
        $stmt_num = $pdo->prepare($sql_num);
        $stmt_num->execute([':num_busqueda' => "%$numero_articulo%"]);
        $resultados = $stmt_num->fetchAll(PDO::FETCH_ASSOC);
    }

    // Si no hay número o no encontró nada, usar búsqueda normal
    if (empty($resultados)) {
        $buscar_hijos = false;
        if (preg_match('/\b(incisos|subincisos|hijos|fracciones|apartados)\b/i', $query)) {
            $buscar_hijos = true;
        }

        if ($buscar_hijos) {
            $sql_padre = "
                SELECT id
                FROM nodos_estatutos
                WHERE status = 1 
                AND titulo LIKE :busqueda_padre
                AND tipo IN ('clausula', 'articulo', 'titulo')
                ORDER BY CHAR_LENGTH(titulo) ASC
                LIMIT 1
            ";
            $stmt_padre = $pdo->prepare($sql_padre);
            $stmt_padre->execute([':busqueda_padre' => '%' . $query_limpia . '%']);
            $padre = $stmt_padre->fetch(PDO::FETCH_ASSOC);

            if ($padre) {
                $sql_hijos = "
                    SELECT 
                        id,
                        tipo,
                        titulo,
                        contenido,
                        color,
                        (SELECT titulo FROM nodos_estatutos WHERE id = n.id_padre) as padre_titulo,
                        (SELECT titulo FROM nodos_estatutos WHERE id = (SELECT id_padre FROM nodos_estatutos WHERE id = n.id_padre)) as abuelo_titulo
                    FROM nodos_estatutos n
                    WHERE status = 1 
                    AND id_padre = :id_padre
                    AND tipo IN ('inciso', 'subinciso', 'parrafo')
                    ORDER BY 
                        CASE 
                            WHEN titulo LIKE 'I.%' OR titulo LIKE 'I' THEN 1
                            WHEN titulo LIKE 'II.%' OR titulo LIKE 'II' THEN 2
                            WHEN titulo LIKE 'III.%' OR titulo LIKE 'III' THEN 3
                            WHEN titulo LIKE 'IV.%' OR titulo LIKE 'IV' THEN 4
                            WHEN titulo LIKE 'V.%' OR titulo LIKE 'V' THEN 5
                            WHEN titulo LIKE 'VI.%' OR titulo LIKE 'VI' THEN 6
                            WHEN titulo LIKE 'VII.%' OR titulo LIKE 'VII' THEN 7
                            WHEN titulo LIKE 'VIII.%' OR titulo LIKE 'VIII' THEN 8
                            WHEN titulo LIKE 'IX.%' OR titulo LIKE 'IX' THEN 9
                            WHEN titulo LIKE 'X.%' OR titulo LIKE 'X' THEN 10
                            ELSE 99
                        END ASC
                ";
                $stmt_hijos = $pdo->prepare($sql_hijos);
                $stmt_hijos->execute([':id_padre' => $padre['id']]);
                $resultados = $stmt_hijos->fetchAll(PDO::FETCH_ASSOC);
            }

            if (empty($resultados)) {
                $sql = "
                    SELECT 
                        id,
                        tipo,
                        titulo,
                        contenido,
                        color,
                        (SELECT titulo FROM nodos_estatutos WHERE id = n.id_padre) as padre_titulo,
                        (SELECT titulo FROM nodos_estatutos WHERE id = (SELECT id_padre FROM nodos_estatutos WHERE id = n.id_padre)) as abuelo_titulo
                    FROM nodos_estatutos n
                    WHERE 
                        status = 1 
                        AND (titulo LIKE :busqueda OR contenido LIKE :busqueda)
                        AND tipo IN ('clausula', 'inciso', 'subinciso', 'parrafo')
                    ORDER BY CHAR_LENGTH(titulo) ASC
                    LIMIT 5
                ";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([':busqueda' => '%' . $query_limpia . '%']);
                $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
        } else {
            $sql = "
                SELECT 
                    id,
                    tipo,
                    titulo,
                    contenido,
                    color,
                    (SELECT titulo FROM nodos_estatutos WHERE id = n.id_padre) as padre_titulo,
                    (SELECT titulo FROM nodos_estatutos WHERE id = (SELECT id_padre FROM nodos_estatutos WHERE id = n.id_padre)) as abuelo_titulo
                FROM nodos_estatutos n
                WHERE 
                    status = 1 
                    AND (
                        titulo LIKE :busqueda OR contenido LIKE :busqueda
                    )
                    AND tipo IN ('clausula', 'inciso', 'subinciso', 'parrafo')
                ORDER BY 
                    CASE 
                        WHEN titulo LIKE :busqueda_exacta THEN 1 
                        ELSE 2 
                    END,
                    CHAR_LENGTH(titulo) ASC
                LIMIT 5
            ";

            $stmt = $pdo->prepare($sql);
            $busqueda = '%' . $query_limpia . '%';
            $busqueda_exacta = $query_limpia . '%';
            
            $stmt->execute([
                ':busqueda' => $busqueda,
                ':busqueda_exacta' => $busqueda_exacta
            ]);
            $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($resultados)) {
                $sql_padre_busqueda = "
                    SELECT 
                        id,
                        tipo,
                        titulo,
                        contenido,
                        color,
                        (SELECT titulo FROM nodos_estatutos WHERE id = n.id_padre) as padre_titulo,
                        (SELECT titulo FROM nodos_estatutos WHERE id = (SELECT id_padre FROM nodos_estatutos WHERE id = n.id_padre)) as abuelo_titulo
                    FROM nodos_estatutos n
                    WHERE 
                        status = 1 
                        AND (
                            titulo LIKE :busqueda_padre OR contenido LIKE :busqueda_padre
                        )
                        AND tipo IN ('clausula', 'articulo', 'titulo')
                    ORDER BY CHAR_LENGTH(titulo) ASC
                    LIMIT 5
                ";
                $stmt_padre = $pdo->prepare($sql_padre_busqueda);
                $stmt_padre->execute([':busqueda_padre' => '%' . $query_limpia . '%']);
                $resultados = $stmt_padre->fetchAll(PDO::FETCH_ASSOC);
            }
        }
    }

    $query = $query_original;

    // ============================================
    // 5. SI NO HAY RESULTADOS
    // ============================================
    if (empty($resultados)) {
        echo json_encode([
            'success' => false,
            'message' => 'No encontré información sobre eso en los Estatutos. Prueba con otras palabras clave.',
            'sugerencia' => '💡 Intenta con otras palabras clave como: derechos, obligaciones, elecciones, cuotas, etc.'
        ]);
        exit;
    }

    // ============================================
    // 6. AUGMENTED: CONSTRUIR CONTEXTO
    // ============================================
    $ejemplos_previos = "";
    if (!empty($historial_global)) {
        $ejemplos_previos = "\n\nEJEMPLOS DE CONVERSACIONES ANTERIORES (para que aprendas cómo responder de forma consistente):\n";
        foreach ($historial_global as $h) {
            $ejemplos_previos .= "Pregunta: " . $h['pregunta'] . "\n";
            $ejemplos_previos .= "Respuesta correcta: " . $h['respuesta'] . "\n\n";
        }
    }

    $contexto = "Eres 'Dele-Bot', un asistente sindical experto en los Estatutos del SNTSS.

REGLAS IMPORTANTES:
1. Responde ÚNICAMENTE basándote en la información proporcionada.
2. NO inventes información que no esté en los estatutos.
3. Si el usuario pregunta por 'incisos' o 'fracciones', debes mostrar TODOS los incisos en orden (I, II, III...) Y copiar su contenido textual tal como está en los datos.
4. Si el usuario pregunta por 'miembros', 'objeto', 'obligaciones' o 'elecciones', debes explicar con base en la información del contexto.
5. Siempre cita la fuente (artículo, capítulo).
6. Sé claro, amable y profesional.
7. Utiliza los ejemplos de conversaciones anteriores para mantener un tono y estilo de respuesta consistentes." . $ejemplos_previos . "\n\nINFORMACIÓN DE LOS ESTATUTOS:";

    $referencias_completas = [];

    foreach ($resultados as $r) {
        $contexto .= "📖 **{$r['titulo']}**\n";
        
        $ubicacion = [];
        if ($r['abuelo_titulo']) $ubicacion[] = $r['abuelo_titulo'];
        if ($r['padre_titulo'] && $r['padre_titulo'] !== $r['abuelo_titulo']) {
            $ubicacion[] = $r['padre_titulo'];
        }
        if ($ubicacion) {
            $contexto .= "📍 Ubicación: " . implode(' → ', $ubicacion) . "\n";
        }
        
        $contexto .= "📝 Contenido: " . ($r['contenido'] ?? 'Sin contenido') . "\n\n";

        $ref = "";
        if ($r['abuelo_titulo']) $ref .= $r['abuelo_titulo'];
        if ($r['padre_titulo'] && $r['padre_titulo'] !== $r['abuelo_titulo']) {
            if ($ref !== "") $ref .= ", ";
            $ref .= $r['padre_titulo'];
        }
        if ($r['titulo'] !== $r['padre_titulo']) {
            if ($ref !== "") $ref .= ", ";
            $ref .= $r['titulo'];
        }
        
        $referencias_completas[] = $ref;
    }

    $contexto .= "\nPregunta del usuario: {$query}\n\n";
    $contexto .= "Responde de forma clara, precisa y amigable. Si hay varios artículos relevantes, menciónalos.";

    // ============================================
    // 7. GENERATION: ENVIAR A OPENAI
    // ============================================
    
    $apiKey = getenv('OPENAI_API_KEY');

    if (!$apiKey || strpos($apiKey, 'sk-') !== 0) {
        $respuesta_generada = "📖 **{$resultados[0]['titulo']}**\n\n";
        $ubicacion = [];
        if ($resultados[0]['abuelo_titulo']) $ubicacion[] = $resultados[0]['abuelo_titulo'];
        if ($resultados[0]['padre_titulo']) $ubicacion[] = $resultados[0]['padre_titulo'];
        if ($ubicacion) {
            $respuesta_generada .= "📍 *" . implode(' → ', $ubicacion) . "*\n\n";
        }
        $respuesta_generada .= $resultados[0]['contenido'] ?? 'Sin contenido disponible.';
        
        if (count($resultados) > 1) {
            $respuesta_generada .= "\n\n📌 *Hay " . count($resultados) . " resultados más. Sé más específico para obtener más detalles.*";
        }
        
        $color = $resultados[0]['color'] ?? '#486DAA';
        $usando_ia = false;
        
    } else {
        $usando_ia = true;
        
        $openai = \OpenAI::client($apiKey);

        $messages = [
            ['role' => 'system', 'content' => $contexto]
        ];

        foreach ($historial_personal as $msg) {
            $messages[] = $msg;
        }

        $messages[] = ['role' => 'user', 'content' => $query];

        $response = $openai->chat()->create([
            'model' => 'gpt-3.5-turbo',
            'messages' => $messages,
            'temperature' => 0.1,
            'max_tokens' => 1200,
        ]);

        $respuesta_generada = $response['choices'][0]['message']['content'];
        $color = $resultados[0]['color'] ?? '#486DAA';
    }

    // ============================================
    // 8. GUARDAR EN HISTORIAL
    // ============================================
    if ($matricula) {
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        $stmt = $pdo->prepare("
            INSERT INTO chatbot_historial 
            (matricula, pregunta, respuesta, fuente, idSeccion, idTipo, ip, user_agent, votos_positivos, votos_negativos) 
            VALUES (?, ?, ?, 'estatutos', ?, ?, ?, ?, 0, 0)
        ");
        $stmt->execute([
            $matricula,
            $query,
            $respuesta_generada,
            $idSeccion,
            $idTipo,
            $ip,
            $user_agent
        ]);
    }

    // ============================================
    // 9. RESPUESTA
    // ============================================
    echo json_encode([
        'success' => true,
        'respuesta' => $respuesta_generada,
        'fuente' => $usando_ia ? 'Dele-Bot IA (GPT-3.5)' : 'Dele-Bot (búsqueda directa)',
        'contexto_usado' => count($resultados),
        'color' => $color ?? '#486DAA',
        'articulos_referencia' => $referencias_completas,
        'usuario' => $matricula ? [
            'nombre' => $nombre,
            'idTipo' => $idTipo,
            'idSeccion' => $idSeccion
        ] : null,
        'modo_ia' => $usando_ia
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error al generar respuesta: ' . $e->getMessage()
    ]);
}