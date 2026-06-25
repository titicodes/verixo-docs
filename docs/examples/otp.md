---
id: otp
title: Full OTP Flow
sidebar_label: Full OTP Flow
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Full OTP Flow

End-to-end guide: search → purchase → receive OTP → handle refunds.

## How it works

```
Your app              VerifiedCore API           SMS aggregator
   │                         │                         │
   │─── search numbers ──────▶                         │
   │◀── ranked list (Health Score™) ─────────────────  │
   │                         │                         │
   │─── purchase ────────────▶                         │
   │◀── sessionToken ──────── │                         │
   │                         │──── dispatch SMS ───────▶
   │                         │                         │
   │◀═══ WebSocket OTP push ══╪═════════════════════════│
   │        (≤90 seconds)    │                         │
   │                         │                         │
   │  if not delivered:      │                         │
   │◀── auto-refund ─────────│ (SLA watchdog fires)    │
```

The SLA watchdog runs server-side every 10 seconds. No client-side timeout logic needed.

---

## Step 1: Search for numbers

Returns numbers ranked by **Health Score™** — a composite 0–100 score based on delivery success rate, carrier reputation, freshness, and blacklist status. Higher is better.

<Tabs groupId="language">
<TabItem value="node" label="Node.js">

```js
const { numbers } = await vc.numbers.search({
  serviceSlug: 'whatsapp',  // whatsapp | google | telegram | coinbase | …
  countryCode: 'NG',        // ISO 3166-1 alpha-2
  minScore: 80,             // only return GREEN-tier numbers
  limit: 10,
});
```

</TabItem>
<TabItem value="python" label="Python">

```python
result = client.numbers.search(
    service_slug="whatsapp",
    country_code="NG",
    min_score=80,
    limit=10,
)
numbers = result.numbers
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash
curl -G "https://api.verifiedcore.com/v1/numbers/search" \
  -H "Authorization: $VC_API_KEY" \
  --data-urlencode "serviceSlug=whatsapp" \
  --data-urlencode "countryCode=NG" \
  --data-urlencode "minScore=80"
```

Response:
```json
{
  "numbers": [
    {
      "numberId": "num_abc123",
      "e164Number": "+2348012345678",
      "healthScore": 94,
      "carrierType": "PHYSICAL_SIM",
      "status": "AVAILABLE",
      "countryCode": "NG"
    }
  ]
}
```

</TabItem>
</Tabs>

### Health Score tiers

| Score | Tier | Meaning |
|-------|------|---------|
| ≥ 75 | 🟢 GREEN | High reliability — recommended |
| ≥ 45 | 🟡 AMBER | Moderate — use if GREEN unavailable |
| < 45 | 🔴 RED | Poor recent performance |

---

## Step 2: Purchase a number

You don't need to pass a `numberId` — the server picks the highest-scored available number matching your criteria, avoiding the race condition of reserving a number that's already gone by the time you reference it.

<Tabs groupId="language">
<TabItem value="node" label="Node.js">

```js
const session = await vc.numbers.purchase({
  serviceSlug: 'whatsapp',
  countryCode: 'NG',
});
// session.sessionToken — use this to subscribe / poll
// session.expiresAt    — 90 seconds from now
// session.price        — amount debited from wallet (USD)
```

</TabItem>
<TabItem value="python" label="Python">

```python
session = client.numbers.purchase(
    service_slug="whatsapp",
    country_code="NG",
)
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash
curl -X POST "https://api.verifiedcore.com/v1/numbers/purchase" \
  -H "Authorization: $VC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"serviceSlug":"whatsapp","countryCode":"NG"}'
```

Response:
```json
{
  "sessionToken": "sess_xyz789",
  "expiresAt": "2026-06-25T12:01:30Z",
  "price": 0.15,
  "currency": "USD"
}
```

</TabItem>
</Tabs>

---

## Step 3: Receive the OTP

### Option A — Real-time WebSocket push (recommended)

The SDKs handle STOMP framing internally. Connect and the OTP arrives the instant it's delivered.

<Tabs groupId="language">
<TabItem value="node" label="Node.js">

```js
const unsubscribe = vc.subscribe(session.sessionToken, ({ otp, latencyMs }) => {
  console.log(`OTP: ${otp}  (${latencyMs}ms)`);
  unsubscribe(); // clean up after first OTP
});
```

</TabItem>
<TabItem value="python" label="Python">

```python
def on_otp(push):
    print(f"OTP: {push.otp}  ({push.latency_ms}ms)")

client.subscribe(session.session_token, on_otp)
```

</TabItem>
<TabItem value="curl" label="Raw STOMP (wscat)">

```bash
# Connect and send STOMP CONNECT frame
wscat -c "wss://api.verifiedcore.com/ws"

# After connected, paste these frames (^@ = null byte, use Ctrl+@ or \0):
CONNECT
accept-version:1.2
heart-beat:0,0

^@

SUBSCRIBE
id:sub-0
destination:/topic/otp/sess_xyz789

^@
```

The broker pushes a `MESSAGE` frame when the OTP arrives.

</TabItem>
</Tabs>

### Option B — Polling (any HTTP client)

```bash
# Poll every 2 seconds until status is DELIVERED or REFUNDED
while true; do
  STATUS=$(curl -s "https://api.verifiedcore.com/v1/sessions/$SESSION" \
    -H "Authorization: $VC_API_KEY" | jq -r '.status')
  echo "Status: $STATUS"
  [ "$STATUS" = "DELIVERED" ] && break
  [ "$STATUS" = "REFUNDED" ]  && { echo "SLA expired — refunded"; break; }
  sleep 2
done
```

Session states: `PENDING` → `DELIVERED` or `REFUNDED` (auto after 90s SLA breach).

---

## Step 4: Handle the response

```json
{
  "sessionToken": "sess_xyz789",
  "status": "DELIVERED",
  "otp": "847291",
  "deliveredAt": "2026-06-25T12:00:04Z",
  "latencyMs": 4200,
  "healthScore": 94
}
```

---

## Webhooks (push to your server)

Register a webhook to receive delivery events server-side instead of polling or keeping a WebSocket open.

```bash
curl -X POST "https://api.verifiedcore.com/v1/webhooks" \
  -H "Authorization: $VC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://yourapp.com/hooks/verifiedcore",
    "events": ["otp.delivered", "sla.breached"]
  }'
```

Webhook payload for `otp.delivered`:
```json
{
  "event": "otp.delivered",
  "sessionToken": "sess_xyz789",
  "otp": "847291",
  "latencyMs": 4200,
  "timestamp": "2026-06-25T12:00:04Z"
}
```

All webhook requests are HMAC-SHA256 signed — verify the `X-Verixo-Signature` header against your webhook secret.

---

## Error codes

| Code | HTTP | Meaning |
|------|------|---------|
| `AUTH_001` | 401 | Missing or invalid API key |
| `WALLET_001` | 402 | Insufficient wallet balance |
| `NUMBER_002` | 422 | No numbers meet your `minScore` |
| `SESSION_001` | 404 | Session token not found or expired |
| `SLA_001` | 408 | OTP not delivered within 90s — auto-refunded |
| `RATE_001` | 429 | Rate limit exceeded — see `Retry-After` header |
