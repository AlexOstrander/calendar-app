<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'token-login'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['https://calendar.alex-o.dev', 
                          'https://api.alex-o.dev'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
]; 