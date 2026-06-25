---
id: quickstart
title: Quick Start
sidebar_label: ⚡ Quick Start
slug: /
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Quick Start

Get your first OTP in **under 5 minutes**. Choose your language, copy the snippet, run it.

Base URL: `https://api.verifiedcore.com/v1`  
Live API reference: [Swagger UI →](https://api.verifiedcore.com/swagger-ui.html)

---

## Step 1 — Get an API key

[Sign up at verifiedcore.com](https://verifiedcore.com/auth/signup), then open **Dashboard → API Keys → Create**.

You'll get a key prefixed `vc_live_` (production) or `vc_test_` (sandbox, no real charges). Store it in an environment variable — **never in source code**.

```bash
export VC_API_KEY=vc_test_your_key_here
```

---

## Step 2 — Install the SDK (optional)

Official SDKs exist for Node.js, Python, and PHP. Every other language works against the REST API directly — no installation needed.

<Tabs groupId="language">
<TabItem value="node" label="Node.js">

```bash
npm install @verixo/sdk
```

</TabItem>
<TabItem value="python" label="Python">

```bash
pip install verixo
```

</TabItem>
<TabItem value="php" label="PHP">

```bash
composer require verixo/sdk
```

</TabItem>
<TabItem value="curl" label="cURL / REST">

```bash
# No install needed — use any HTTP client
```

</TabItem>
</Tabs>

---

## Step 3 — Your first API call

Search for a number, purchase it, and receive the OTP.

<Tabs groupId="language">
<TabItem value="node" label="Node.js">

```js title="quickstart.mjs"
import Verixo from '@verixo/sdk';

const vc = new Verixo(process.env.VC_API_KEY);

// Search for available numbers ranked by Health Score™
const { numbers } = await vc.numbers.search({
  serviceSlug: 'whatsapp',
  countryCode: 'NG',
  minScore: 80,
});
console.log('Available numbers:', numbers.length);

// Purchase — server picks the best number automatically
const session = await vc.numbers.purchase({
  serviceSlug: 'whatsapp',
  countryCode: 'NG',
});

// Real-time OTP push via WebSocket (no polling)
vc.subscribe(session.sessionToken, ({ otp, latencyMs }) => {
  console.log(`OTP: ${otp}  (delivered in ${latencyMs}ms)`);
});
```

</TabItem>
<TabItem value="python" label="Python">

```python title="quickstart.py"
import os
import verixo as vc

client = vc.Client(api_key=os.environ["VC_API_KEY"])

# Search for available numbers ranked by Health Score™
result = client.numbers.search(
    service_slug="whatsapp",
    country_code="NG",
    min_score=80,
)
print(f"Available numbers: {len(result.numbers)}")

# Purchase — server picks the best number automatically
session = client.numbers.purchase(
    service_slug="whatsapp",
    country_code="NG",
)

# Real-time OTP push via WebSocket (no polling)
def on_otp(push):
    print(f"OTP: {push.otp}  (delivered in {push.latency_ms}ms)")

client.subscribe(session.session_token, on_otp)
```

</TabItem>
<TabItem value="php" label="PHP">

```php title="quickstart.php"
<?php
require 'vendor/autoload.php';

use Verixo\Client;

$vc = new Client($_ENV['VC_API_KEY']);

// Search for available numbers ranked by Health Score™
$result = $vc->numbers->search([
    'serviceSlug' => 'whatsapp',
    'countryCode' => 'NG',
    'minScore'    => 80,
]);
echo "Available numbers: " . count($result->numbers) . "\n";

// Purchase — server picks the best number automatically
$session = $vc->numbers->purchase([
    'serviceSlug' => 'whatsapp',
    'countryCode' => 'NG',
]);

// Poll for OTP (max 90 seconds)
$otp = $vc->sessions->waitForOtp($session->sessionToken, 90);
echo "OTP: {$otp}\n";
```

</TabItem>
<TabItem value="curl" label="cURL / REST">

```bash title="quickstart.sh"
# 1. Search for available numbers
curl -G "https://api.verifiedcore.com/v1/numbers/search" \
  -H "Authorization: $VC_API_KEY" \
  --data-urlencode "serviceSlug=whatsapp" \
  --data-urlencode "countryCode=NG" \
  --data-urlencode "minScore=80"

# 2. Purchase — server picks the best number automatically
SESSION=$(curl -s -X POST "https://api.verifiedcore.com/v1/numbers/purchase" \
  -H "Authorization: $VC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"serviceSlug":"whatsapp","countryCode":"NG"}' | jq -r '.sessionToken')

echo "Session: $SESSION"

# 3. Poll until delivered (or use WebSocket for real-time push)
curl "https://api.verifiedcore.com/v1/sessions/$SESSION" \
  -H "Authorization: $VC_API_KEY"
```

</TabItem>
</Tabs>

---

## What you just did

| Step | API call | What happened |
|------|----------|---------------|
| Search | `GET /numbers/search` | Returned numbers ranked by [Health Score™](https://verifiedcore.com/docs#numbers) |
| Purchase | `POST /numbers/purchase` | Debited wallet, reserved a number, started 90s SLA timer |
| Receive OTP | WebSocket push / poll | OTP pushed in real time; auto-refunded if not delivered in 90s |

:::tip 90-second SLA guarantee
If the OTP doesn't arrive within 90 seconds your wallet is refunded automatically — no support ticket needed. This applies to every purchase regardless of language or SDK.
:::

---

## Next steps

- **[Authentication →](./authentication)** — learn about API key scopes, test vs. live keys
- **[Node.js example →](./examples/node)** — full working script with error handling
- **[Python example →](./examples/python)** — full working script with error handling
- **[PHP example →](./examples/php)** — full working script with error handling
- **[Full OTP flow →](./examples/otp)** — WebSocket subscribe, polling fallback, webhook events
- **[eSIM provisioning →](./examples/esim)** — browse packages, purchase, check usage
