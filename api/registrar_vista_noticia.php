<?php
/*
  Registrar vista de noticia usando la tabla noticias_vistas.
  Si el usuario ya vio la noticia, no duplica la vista.
*/
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? (int) $data['id'] : 0;
$matricula = isset($data['matricula']) ? trim($data['matricula']) : '';

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El id de la noticia es obligatorio.']);
    exit;
}

try {
    // Verificar que la noticia existe y está visible
    $checkNoticia = $pdo->prepare("SELECT id, status FROM noticias WHERE id = :id AND status = 1");
    $checkNoticia->execute([':id' => $id]);
    if (!$checkNoticia->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'La noticia no existe o no está visible.']);
        exit;
    }

    // Si el usuario está logueado, registrar la vista en la tabla de vistas
    if (!empty($matricula)) {
        // Verificar si ya existe una vista de este usuario para esta noticia
        $checkVista = $pdo->prepare("SELECT id FROM noticias_vistas WHERE noticia_id = :noticia_id AND matricula = :matricula");
        $checkVista->execute([':noticia_id' => $id, ':matricula' => $matricula]);

        if (!$checkVista->fetch()) {
            // No existe, insertar la vista
            $insertVista = $pdo->prepare("INSERT INTO noticias_vistas (noticia_id, matricula) VALUES (:noticia_id, :matricula)");
            $insertVista->execute([':noticia_id' => $id, ':matricula' => $matricula]);
        }
    }

    // Obtener el total de vistas actualizado
    $count = $pdo->prepare("SELECT COUNT(*) FROM noticias_vistas WHERE noticia_id = :noticia_id");
    $count->execute([':noticia_id' => $id]);
    $total_vistas = (int)$count->fetchColumn();

    // Actualizar la columna vistas en noticias
    $update = $pdo->prepare("UPDATE noticias SET vistas = :vistas WHERE id = :id");
    $update->execute([':vistas' => $total_vistas, ':id' => $id]);

    echo json_encode([
        'success' => true,
        'vistas' => $total_vistas
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>