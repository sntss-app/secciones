<?php
/*
  Registrar vista de noticia usando la tabla noticias_vistas.
  Si el usuario ya vio la noticia, no duplica la vista.
*/

// Conectar a la base de datos
require_once 'config.php';

// Recibir los datos del frontend (React) en formato JSON
$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? (int) $data['id'] : 0;                 // ID de la noticia
$matricula = isset($data['matricula']) ? trim($data['matricula']) : ''; // Matricula del usuario (opcional)

// Validar que el ID de la noticia sea valido
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El id de la noticia es obligatorio.']);
    exit;
}

try {
    // Verificar que la noticia existe y esta visible (status = 1)
    $checkNoticia = $pdo->prepare("SELECT id, status FROM noticias WHERE id = :id AND status = 1");
    $checkNoticia->execute([':id' => $id]);
    if (!$checkNoticia->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'La noticia no existe o no esta visible.']);
        exit;
    }

    // Si el usuario esta logueado (llego la matricula), registrar la vista en la tabla de vistas
    if (!empty($matricula)) {
        // Verificar si el usuario ya vio esta noticia antes
        $checkVista = $pdo->prepare("SELECT id FROM noticias_vistas WHERE noticia_id = :noticia_id AND matricula = :matricula");
        $checkVista->execute([':noticia_id' => $id, ':matricula' => $matricula]);

        if (!$checkVista->fetch()) {
            // Si no ha visto la noticia, insertar la vista
            $insertVista = $pdo->prepare("INSERT INTO noticias_vistas (noticia_id, matricula) VALUES (:noticia_id, :matricula)");
            $insertVista->execute([':noticia_id' => $id, ':matricula' => $matricula]);
        }
        // Si ya la vio, no hacemos nada para no duplicar vistas
    }

    // Obtener el total de vistas de la noticia (contando todos los registros en noticias_vistas)
    $count = $pdo->prepare("SELECT COUNT(*) FROM noticias_vistas WHERE noticia_id = :noticia_id");
    $count->execute([':noticia_id' => $id]);
    $total_vistas = (int)$count->fetchColumn();

    // Actualizar la columna vistas en la tabla noticias
    $update = $pdo->prepare("UPDATE noticias SET vistas = :vistas WHERE id = :id");
    $update->execute([':vistas' => $total_vistas, ':id' => $id]);

    // Respuesta exitosa con el total de vistas actualizado
    echo json_encode([
        'success' => true,
        'vistas' => $total_vistas
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}