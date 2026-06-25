---
id: esim
title: eSIM Provisioning
sidebar_label: eSIM Provisioning
---

# eSIM Provisioning

Provision real eSIM data packages worldwide, backed by Airalo. REST only — not yet wrapped in the SDKs.

## Supported countries

Browse live packages for any country via the public endpoint — no API key needed.

```bash
# No auth needed for browsing
curl "https://api.verifiedcore.com/v1/esim/packages?countryCode=NG"
```

Response:
```json
{
  "packages": [
    {
      "packageId": "esim_ng_1gb_7d",
      "dataGb": 1,
      "days": 7,
      "priceUsd": 6.99,
      "networks": "Airtel [4G]",
      "countryCode": "NG"
    },
    {
      "packageId": "esim_ng_3gb_30d",
      "dataGb": 3,
      "days": 30,
      "priceUsd": 18.99,
      "networks": "Airtel [4G]",
      "countryCode": "NG"
    },
    {
      "packageId": "esim_ng_5gb_30d",
      "dataGb": 5,
      "days": 30,
      "priceUsd": 28.99,
      "networks": "Airtel [4G]",
      "countryCode": "NG"
    }
  ]
}
```

---

## Purchase an eSIM

Debits your wallet and provisions a real eSIM profile via the carrier. Returns everything needed for installation.

```bash
curl -X POST "https://api.verifiedcore.com/v1/esim/purchase" \
  -H "Authorization: $VC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"packageId":"esim_ng_1gb_7d","countryCode":"NG"}'
```

Response:
```json
{
  "profileId": "esim_a1b2c3",
  "iccid": "8901000000000000001",
  "activationCode": "LPA:1$smdp.example.com$matching-id-here",
  "qrCodeUrl": "https://esim.airalo.com/qr/abc123",
  "directAppleInstallUrl": "https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=...",
  "smdpAddress": "smdp.example.com",
  "matchingId": "matching-id-here",
  "apnType": "automatic",
  "apnValue": "internet",
  "isRoaming": false,
  "carrierName": "Airtel",
  "dataGbIncluded": 1,
  "validityDays": 7,
  "countryCode": "NG",
  "status": "ACTIVE"
}
```

### Activation options for the end user

| Method | How |
|--------|-----|
| QR code | Scan `qrCodeUrl` with the device camera |
| One-tap (iOS 17.4+) | Open `directAppleInstallUrl` on the device |
| Manual | Enter `smdpAddress` + `matchingId` in device eSIM settings |

---

## Check data usage

```bash
curl "https://api.verifiedcore.com/v1/esim/8901000000000000001/usage" \
  -H "Authorization: $VC_API_KEY"
```

Response:
```json
{
  "iccid": "8901000000000000001",
  "dataRemainingGb": 0.73,
  "dataUsedGb": 0.27,
  "status": "ACTIVE",
  "expiresAt": "2026-07-02T10:00:00Z"
}
```

:::note Rate limit
Usage checks are limited to **10 requests per minute per ICCID** — cache the result client-side rather than polling on every page load.
:::

---

## List your eSIMs

```bash
curl "https://api.verifiedcore.com/v1/esim/my" \
  -H "Authorization: $VC_API_KEY"
```

Response:
```json
{
  "esims": [
    {
      "profileId": "esim_a1b2c3",
      "iccid": "8901000000000000001",
      "countryCode": "NG",
      "dataGbIncluded": 1,
      "validityDays": 7,
      "status": "ACTIVE",
      "purchasedAt": "2026-06-25T10:00:00Z",
      "expiresAt": "2026-07-02T10:00:00Z"
    }
  ]
}
```

---

## Complete flow (Node.js with fetch)

```js title="esim-provision.mjs"
const BASE = 'https://api.verifiedcore.com/v1';
const KEY  = process.env.VC_API_KEY;
const headers = { Authorization: KEY, 'Content-Type': 'application/json' };

// 1. Browse packages
const { packages } = await fetch(`${BASE}/esim/packages?countryCode=NG`).then(r => r.json());
console.log('Available:', packages.map(p => `${p.packageId} — $${p.priceUsd}`).join(', '));

// 2. Purchase the 1 GB / 7-day package
const esim = await fetch(`${BASE}/esim/purchase`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ packageId: 'esim_ng_1gb_7d', countryCode: 'NG' }),
}).then(r => r.json());

console.log(`Provisioned eSIM: ${esim.iccid}`);
console.log(`QR code: ${esim.qrCodeUrl}`);
console.log(`iOS install: ${esim.directAppleInstallUrl}`);

// 3. Check usage later
const usage = await fetch(`${BASE}/esim/${esim.iccid}/usage`, { headers }).then(r => r.json());
console.log(`Remaining: ${usage.dataRemainingGb} GB`);
```

---

## eSIM status values

| Status | Meaning |
|--------|---------|
| `ACTIVE` | Provisioned and usable |
| `PENDING` | Provisioning in progress |
| `EXHAUSTED` | Data fully used |
| `EXPIRED` | Validity period ended |
| `FAILED` | Provisioning failed — wallet was not charged |
