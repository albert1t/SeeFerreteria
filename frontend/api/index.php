<?php
$backend = 'https://cmhautomacion.com';
$path = $_SERVER['REQUEST_URI'];
$url = $backend . $path;

$headers = [];
foreach (getallheaders() as $k => $v) {
  if (strtolower($k) !== 'host') $headers[] = "$k: $v";
}

$ch = curl_init($url);
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => $_SERVER['REQUEST_METHOD'],
  CURLOPT_HTTPHEADER => $headers,
  CURLOPT_POSTFIELDS => file_get_contents('php://input'),
  CURLOPT_HEADER => true,
  CURLOPT_SSL_VERIFYPEER => true,
  CURLOPT_TIMEOUT => 30,
]);

$response = curl_exec($ch);
$err = curl_error($ch);
$info = curl_getinfo($ch);
curl_close($ch);

if ($err) {
  http_response_code(502);
  echo json_encode(['error' => 'Proxy error: ' . $err]);
  exit;
}

$header_size = $info['header_size'];
$resp_headers = substr($response, 0, $header_size);
$body = substr($response, $header_size);

foreach (explode("\r\n", $resp_headers) as $h) {
  $skip = ['Transfer-Encoding', 'Connection', 'Keep-Alive'];
  $match = false;
  foreach ($skip as $s) {
    if (stripos($h, $s . ':') === 0) { $match = true; break; }
  }
  if (!$match && trim($h) !== '') header($h);
}

echo $body;
