<?php
// api/chatbot.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';

// ============================================
// 1. PARÁMETROS
// ============================================
$query = $_GET['q'] ?? '';
$fuente = $_GET['fuente'] ?? 'estatutos';
$matricula = $_GET['matricula'] ?? null;
$limit = 5;

if (strlen($query) < 3) {
    echo json_encode(['error' => 'Escribe al menos 3 caracteres']);
    exit;
}

try {
    // ============================================
    // 2. OBTENER DATOS DEL USUARIO (si hay matrícula)
    // ============================================
    $idSeccion = null;
    $idTipo = null;
    $nombre = null;
    $tipoNombre = 'anonimo';

    if ($matricula) {
        // Buscar en las 3 tablas de usuarios
        $tables = ['usuarios', 'usuariosJ', 'usuariosC'];
        foreach ($tables as $table) {
            $stmt = $pdo->prepare("
                SELECT nombre, idSeccion, idTipo 
                FROM $table 
                WHERE matricula = :matricula
                LIMIT 1
            ");
            $stmt->execute([':matricula' => $matricula]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $nombre = $row['nombre'];
                $idSeccion = $row['idSeccion'];
                $idTipo = $row['idTipo'];
                break;
            }
        }

        // Obtener nombre del tipo
        if ($idTipo) {
            $stmt = $pdo->prepare("SELECT nombre FROM tipos_usuarios WHERE id = :id");
            $stmt->execute([':id' => $idTipo]);
            $tipo = $stmt->fetch(PDO::FETCH_ASSOC);
            $tipoNombre = $tipo['nombre'] ?? 'activo';
        }
    }

    // ============================================
    // 3. BUSCAR EN ESTATUTOS (CON FULLTEXT)
    // ============================================
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
            AND MATCH(titulo, contenido) AGAINST(? IN NATURAL LANGUAGE MODE)
            AND tipo IN ('clausula', 'inciso', 'subinciso', 'parrafo')
        ORDER BY 
            MATCH(titulo, contenido) AGAINST(?) DESC,
            CASE tipo 
                WHEN 'clausula' THEN 1 
                WHEN 'inciso' THEN 2 
                WHEN 'subinciso' THEN 3 
                ELSE 4 
            END,
            orden
        LIMIT $limit
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$query, $query]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ============================================
    // 4. GUARDAR HISTORIAL (si hay matrícula)
    // ============================================
    if ($matricula && !empty($results)) {
        $respuesta_texto = $results[0]['contenido'] ?? 'No se encontró contenido';
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        $stmt = $pdo->prepare("
            INSERT INTO chatbot_historial 
            (matricula, pregunta, respuesta, fuente, idSeccion, idTipo, ip, user_agent) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $matricula,
            $query,
            $respuesta_texto,
            $fuente,
            $idSeccion,
            $idTipo,
            $ip,
            $user_agent
        ]);
    }

    // ============================================
    // 5. RESPUESTA
    // ============================================
    echo json_encode([
        'success' => true,
        'results' => $results,
        'total' => count($results),
        'usuario' => $matricula ? [
            'nombre' => $nombre,
            'idTipo' => $idTipo,
            'tipo' => $tipoNombre,
            'idSeccion' => $idSeccion
        ] : null,
        'fuente' => $fuente
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error en la base de datos: ' . $e->getMessage()
    ]);
}