---
id: node
title: Node.js Example
sidebar_label: Node.js
---

# Node.js Example

Full working script using the `@verixo/sdk` npm package.

## Install

```bash
npm install @verixo/sdk
```

## Complete script

```js title="verixo-otp.mjs"
import Verixo, { VerixoError } from '@verixo/sdk';

const vc = new Verixo(process.env.VC_API_KEY);

async function main() {
  // 1. Search for numbers ranked by Health Score™
  const { numbers } = await vc.numbers.search({
    serviceSlug: 'whatsapp',
    countryCode: 'NG',
    minScore: 80,
    limit: 5,
  });

  if (numbers.length === 0) {
    console.error('No numbers available right now — try a lower minScore or different country.');
    process.exit(1);
  }

  console.log(`Found ${numbers.length} number(s). Top: ${numbers[0].e164Number} (score ${numbers[0].healthScore})`);

  // 2. Purchase — server picks the best available number automatically
  const session = await vc.numbers.purchase({
    serviceSlug: 'whatsapp',
    countryCode: 'NG',
  });

  console.log(`Session ${session.sessionToken} created. Waiting for OTP (90s SLA)…`);

  // 3. Subscribe for real-time OTP push via WebSocket (no polling)
  const unsubscribe = vc.subscribe(session.sessionToken, ({ otp, latencyMs }) => {
    console.log(`✓ OTP: ${otp}  (${latencyMs}ms)`);
    unsubscribe();
  });
}

main().catch((err) => {
  if (err instanceof VerixoError) {
    console.error(`API error ${err.status} [${err.code}]: ${err.message}`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
```

## Run it

```bash
VC_API_KEY=vc_test_your_key node verixo-otp.mjs
```

## SDK reference

| Method | Description |
|--------|-------------|
| `vc.numbers.search(params)` | Return numbers ranked by Health Score™ |
| `vc.numbers.purchase(params)` | Reserve a number, start the SLA timer, return `sessionToken` |
| `vc.sessions.get(token)` | Poll session status and OTP |
| `vc.analytics.rates(params)` | 30-day delivery rates by service/country |
| `vc.subscribe(token, cb)` | Real-time OTP push via WebSocket; returns an `unsubscribe()` function |

## TypeScript types

The SDK is fully typed. Key types exported from `@verixo/sdk`:

```ts
import type {
  VirtualNumber,      // { numberId, e164Number, healthScore, carrierType, ... }
  PurchaseResult,     // { sessionToken, expiresAt, price, currency }
  SessionState,       // { sessionToken, status, otp, deliveredAt, latencyMs }
  OtpPush,            // { otp, latencyMs } — passed to subscribe() callback
  VerixoOptions,      // { baseUrl? } — constructor options
} from '@verixo/sdk';
```

## Test mode

Use a `vc_test_` key and add `testMode: true` to the purchase call. The OTP is delivered automatically in ~2 seconds — no real SMS sent, no wallet charge.

```js
const session = await vc.numbers.purchase({
  serviceSlug: 'whatsapp',
  countryCode: 'NG',
  testMode: true,   // sandbox only — instant mock delivery
});
```
