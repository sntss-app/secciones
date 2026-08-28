<?php
// api/chatbot_rag_debug.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

echo json_encode(['step' => '1. Iniciando']);

require_once 'config.php';
echo json_encode(['step' => '2. Config cargado']);

// ✅ Verificar si existe el autoload
$autoloadPath = __DIR__ . '/../vendor/autoload.php';
echo json_encode(['step' => '3. Autoload path: ' . $autoloadPath]);

if (!file_exists($autoloadPath)) {
    echo json_encode(['error' => '❌ No existe vendor/autoload.php en: ' . $autoloadPath]);
    exit;
}

require_once $autoloadPath;
echo json_encode(['step' => '4. Autoload cargado']);

use OpenAI\Client;
echo json_encode(['step' => '5. OpenAI Client importado']);

$query = $_GET['q'] ?? '';
if (strlen($query) < 3) {
    echo json_encode(['error' => 'Mínimo 3 caracteres']);
    exit;
}

echo json_encode(['step' => '6. Query: ' . $query]);

// Prueba de OpenAI (solo si tiene API Key)
$apiKey = getenv('OPENAI_API_KEY');
echo json_encode(['step' => '7. API Key: ' . ($apiKey ? '✅ Configurada' : '❌ No configurada')]);

// Buscar en BD
$sql = "SELECT titulo, contenido FROM nodos_estatutos 
        WHERE status = 1 AND contenido LIKE ? LIMIT 1";
$stmt = $pdo->prepare($sql);
$stmt->execute(['%' . $query . '%']);
$resultado = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    'success' => true,
    'resultado' => $resultado,
    'api_key_presente' => !empty($apiKey)
]);