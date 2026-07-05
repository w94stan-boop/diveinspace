<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['url'], $input['body'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing parameters']);
    exit;
}

$url = $input['url'];
$headers = isset($input['headers']) ? $input['headers'] : [];
$body = $input['body'];

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);

$curlHeaders = ['Content-Type: application/json'];
foreach ($headers as $key => $value) {
    $curlHeaders[] = "$key: $value";
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $curlHeaders);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'Proxy request failed: ' . $error]);
    exit;
}

$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
header('Content-Type: ' . ($contentType ?: 'application/json'));
http_response_code($httpCode);
echo $response;
?>
