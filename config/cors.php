<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Para desarrollo: permitir todos los orígenes
    // En producción, cambiar a una lista específica de orígenes permitidos
    'allowed_origins' => ['*'],
    
    // Lista específica para producción (descomentar y usar en lugar de ['*']):
    // 'allowed_origins' => [
    //     // Desarrollo web
    //     'http://localhost:5175',
    //     'http://localhost:5174',
    //     'http://localhost:3000',
    //     'http://127.0.0.1:5175',
    //     'http://127.0.0.1:5174',
    //     'http://127.0.0.1:3000',
    //     
    //     // Capacitor - Android e iOS (orígenes virtuales del DOM)
    //     'capacitor://localhost',
    //     'http://localhost',
    //     'ionic://localhost',
    //     'file://',
    // ],

    'allowed_origins_patterns' => [
        // Permite cualquier URL de ngrok
        '#^https://[a-z0-9-]+\.ngrok(-free)?\.app$#',
        '#^https://[a-z0-9-]+\.ngrok(-free)?\.io$#',
    ],

    'allowed_headers' => ['*'], // Permite todos los headers, incluyendo ngrok-skip-browser-warning

    'exposed_headers' => [],

    'max_age' => 86400, // 24 horas para cachear preflight requests

    'supports_credentials' => false, // Cambiar a true si necesitas enviar cookies

];
