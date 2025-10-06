<?php
// test-grok.php - Simple test script for Grok API
require_once 'config.php';

header('Content-Type: application/json');

$testMessage = "Hello! Tell me about Fedi's skills in one sentence.";

$data = [
    'model' => AI_MODEL,
    'messages' => [
        [
            'role' => 'user',
            'content' => $testMessage
        ]
    ],
    'max_tokens' => 100,
    'temperature' => 0.7
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.x.ai/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . XAI_API_KEY
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

echo "Testing Grok API...\n";
echo "Model: " . AI_MODEL . "\n";
echo "Test Message: " . $testMessage . "\n\n";

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: " . $httpCode . "\n";

if ($error) {
    echo "Curl Error: " . $error . "\n";
} elseif ($httpCode === 200) {
    $responseData = json_decode($response, true);
    if (isset($responseData['choices'][0]['message']['content'])) {
        echo "✅ SUCCESS! Grok Response:\n";
        echo $responseData['choices'][0]['message']['content'] . "\n";
    } else {
        echo "❌ Error: Invalid response format\n";
        echo $response . "\n";
    }
} else {
    echo "❌ HTTP Error: " . $httpCode . "\n";
    echo $response . "\n";
}
?>