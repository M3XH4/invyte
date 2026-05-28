<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://invyte-mxke.onrender.com',
        'http://localhost:5173',
    ],

    'allowed_headers' => ['*'],

    'allowed_origins_patterns' => [],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
