<?php
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($path === '/health') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'ok',
        'service' => 'api-laravel',
    ]);
    return;
}

http_response_code(200);
header('Content-Type: text/plain');
echo "Laravel API placeholder. Try /health\n";
