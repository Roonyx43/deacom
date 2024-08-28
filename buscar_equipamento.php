<?php
header('Content-Type: application/json');

$host = 'autorack.proxy.rlwy.net';
$dbname = 'railway';
$username = 'root';
$password = 'OtKqdkQNHsPUiAAQAaHzUPhaEmByOAVq';
$port = 31283;

$conn = new mysqli($host, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    echo json_encode(['error' => 'Erro de conexão: ' . $conn->connect_error]);
    exit;
}

if (isset($_GET['codigo'])) {
    $codigo = $conn->real_escape_string($_GET['codigo']);
    $sql = "SELECT descricao, valor, unidade FROM equipamentos WHERE codigo = '$codigo'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode($row);
    } else {
        echo json_encode(null); // Retorna null se não houver equipamento
    }
} else {
    echo json_encode(['error' => 'Código não fornecido']);
}

$conn->close();
?>
