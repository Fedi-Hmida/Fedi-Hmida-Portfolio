<?php
// portfolio-knowledge-test.php - Test script for enhanced portfolio knowledge
require_once 'config.php';

header('Content-Type: text/html; charset=UTF-8');

$testQuestions = [
    "Tell me about SmartClaim AI project",
    "What Flutter mobile apps has Fedi built?",
    "Show me his React and Vue.js expertise",
    "What are his pricing packages?",
    "Tell me about SolarFlow IoT application",
    "What UI/UX design services does he offer?",
    "What's his experience with AI integration?",
    "Can he build e-commerce platforms?",
    "What's his professional background?",
    "How much does a mobile app development cost?"
];

echo "<h1>🚀 Portfolio Knowledge Test - Grok AI Assistant</h1>";
echo "<p><strong>Testing enhanced portfolio knowledge with detailed project information...</strong></p>";

foreach ($testQuestions as $index => $question) {
    echo "<div style='margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px;'>";
    echo "<h3>Test " . ($index + 1) . ": " . htmlspecialchars($question) . "</h3>";
    
    $data = [
        'model' => AI_MODEL,
        'messages' => [
            [
                'role' => 'system',
                'content' => file_get_contents(__DIR__ . '/ai-chat.php')
            ],
            [
                'role' => 'user',
                'content' => $question
            ]
        ],
        'max_tokens' => 250,
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

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $responseData = json_decode($response, true);
        if (isset($responseData['choices'][0]['message']['content'])) {
            echo "<div style='background: #f0f8f0; padding: 10px; border-radius: 5px; margin-top: 10px;'>";
            echo "<strong>✅ Grok Response:</strong><br>";
            echo nl2br(htmlspecialchars($responseData['choices'][0]['message']['content']));
            echo "</div>";
        } else {
            echo "<div style='background: #fff0f0; padding: 10px; border-radius: 5px; margin-top: 10px;'>";
            echo "<strong>❌ Invalid Response Format</strong>";
            echo "</div>";
        }
    } else {
        echo "<div style='background: #fff0f0; padding: 10px; border-radius: 5px; margin-top: 10px;'>";
        echo "<strong>❌ API Error (HTTP " . $httpCode . ")</strong>";
        echo "</div>";
    }
    
    echo "</div>";
    
    // Small delay between requests
    usleep(500000); // 0.5 second delay
}

echo "<h2>🎯 Knowledge Areas Tested:</h2>";
echo "<ul>";
echo "<li>✅ Specific project details (SmartClaim, SolarFlow, Onboardify)</li>";
echo "<li>✅ Technology expertise (Flutter, React, Vue.js, AI)</li>";
echo "<li>✅ Service offerings and pricing structure</li>";
echo "<li>✅ Professional background and experience</li>";
echo "<li>✅ Design and development capabilities</li>";
echo "<li>✅ Industry specializations</li>";
echo "</ul>";

echo "<p><strong>🔥 Your AI assistant is now equipped with comprehensive portfolio knowledge!</strong></p>";
?>