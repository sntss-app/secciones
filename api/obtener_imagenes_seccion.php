<?php
require_once 'config.php';

function buscarImagenSeccion($idSeccion, $tipo) {
    $carpeta = $tipo === 'logo' ? 'seccionesLogo' : 'seccionesBanner';
    $extensiones = $tipo === 'logo' 
        ? ['png', 'svg', 'jpg', 'jpeg', 'webp'] 
        : ['jpg', 'jpeg', 'png', 'webp'];
    
    $basePath = $_SERVER['DOCUMENT_ROOT'] . "/images/{$carpeta}/";
    
    foreach ($extensiones as $ext) {
        $prefijo = $tipo === 'logo' ? 'logo' : 'banner';
        $archivo = $basePath . "{$prefijo}{$idSeccion}.{$ext}";
        if (file_exists($archivo)) {
            return "/images/{$carpeta}/{$prefijo}{$idSeccion}.{$ext}";
        }
    }
    
    // Default
    return $tipo === 'logo'
        ? '/images/seccionesLogo/logoD.png'
        : '/images/seccionesBanner/bannerD.jpg';
}

$idSeccion = isset($_GET['idSeccion']) ? (int)$_GET['idSeccion'] : 0;

if ($idSeccion <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de sección requerido']);
    exit;
}

try {
    // Obtener datos de la sección
    $stmt = $pdo->prepare("SELECT romano, nombre FROM secciones WHERE id = :id");
    $stmt->execute([':id' => $idSeccion]);
    $seccion = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$seccion) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Sección no encontrada']);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'seccion' => [
            'id' => $idSeccion,
            'romano' => $seccion['romano'],
            'nombre' => $seccion['nombre'],
            'logo' => buscarImagenSeccion($idSeccion, 'logo'),
            'banner' => buscarImagenSeccion($idSeccion, 'banner')
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en BD: ' . $e->getMessage()]);
}
?>
