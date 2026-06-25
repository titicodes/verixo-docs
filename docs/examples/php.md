---
id: php
title: PHP Example
sidebar_label: PHP
---

# PHP Example

Full working script using the `verixo/sdk` Composer package.

## Install

```bash
composer require verixo/sdk
```

Requires PHP 8.1+ and the `ext-json` extension.

## Complete script

```php title="verixo_otp.php"
<?php
require 'vendor/autoload.php';

use Verixo\Client;
use Verixo\Exception\VerixoException;

$vc = new Client($_ENV['VC_API_KEY'] ?? getenv('VC_API_KEY'));

try {
    // 1. Search for numbers ranked by Health Score™
    $result = $vc->numbers->search([
        'serviceSlug' => 'whatsapp',
        'countryCode' => 'NG',
        'minScore'    => 80,
        'limit'       => 5,
    ]);

    if (empty($result->numbers)) {
        fwrite(STDERR, "No numbers available — try a lower minScore or different country.\n");
        exit(1);
    }

    $top = $result->numbers[0];
    printf("Found %d number(s). Top: %s (score %d)\n",
        count($result->numbers), $top->e164Number, $top->healthScore);

    // 2. Purchase — server picks the best available number automatically
    $session = $vc->numbers->purchase([
        'serviceSlug' => 'whatsapp',
        'countryCode' => 'NG',
    ]);

    printf("Session %s created. Waiting for OTP (90s SLA)…\n", $session->sessionToken);

    // 3. Poll for OTP (max 90 seconds)
    //    For real-time push, use a STOMP WebSocket client against
    //    wss://api.verifiedcore.com/ws, topic /topic/otp/{sessionToken}
    $otp = $vc->sessions->waitForOtp($session->sessionToken, 90);

    printf("✓ OTP: %s\n", $otp);

} catch (VerixoException $e) {
    fprintf(STDERR, "API error %d [%s]: %s\n", $e->getStatus(), $e->getCode(), $e->getMessage());
    exit(1);
}
```

## Run it

```bash
VC_API_KEY=vc_test_your_key php verixo_otp.php
```

## SDK reference

| Method | Description |
|--------|-------------|
| `$vc->numbers->search(array $params)` | Return numbers ranked by Health Score™ |
| `$vc->numbers->purchase(array $params)` | Reserve a number, start SLA timer, return session |
| `$vc->sessions->get(string $token)` | Poll session status and OTP |
| `$vc->sessions->waitForOtp(string $token, int $timeoutSecs)` | Poll until OTP arrives or timeout |
| `$vc->subscribe(string $token, callable $cb)` | Real-time OTP push via STOMP WebSocket |

## Real-time push (PHP)

The `subscribe()` method opens a STOMP WebSocket connection and blocks until the OTP arrives or the SLA timeout is reached. It requires a PHP process that can run an event loop (CLI scripts or async frameworks like ReactPHP).

```php
$vc->subscribe($session->sessionToken, function (object $push): void {
    printf("✓ OTP: %s  (%dms)\n", $push->otp, $push->latencyMs);
});
```

## Test mode

```php
$session = $vc->numbers->purchase([
    'serviceSlug' => 'whatsapp',
    'countryCode' => 'NG',
    'testMode'    => true,   // sandbox only — instant mock delivery
]);
```
