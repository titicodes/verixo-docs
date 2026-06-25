---
id: authentication
title: Authentication
sidebar_label: 🔐 Authentication
---

# Authentication

All requests send the API key in the `Authorization` header — **no `Bearer` prefix**.

```http
Authorization: vc_live_your_api_key_here
```

## Key prefixes

| Prefix | Environment | Behaviour |
|--------|-------------|-----------|
| `vc_test_` | Sandbox | Mock data, no wallet charges |
| `vc_live_` | Production | Real numbers, real charges |

## Create an API key

Sign up, log in to get a JWT, then mint a scoped API key:

```bash
curl -X POST "https://api.verifiedcore.com/v1/auth/api-keys" \
  -H "Authorization: Bearer <your JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production backend",
    "scopes": ["numbers:read", "numbers:write", "sessions:read"],
    "environment": "live"
  }'
```

Response:
```json
{
  "key": "vc_live_8f2a91c4b7e6...",
  "meta": {
    "id": "key_abc123",
    "name": "Production backend",
    "environment": "live",
    "createdAt": "2026-06-25T10:00:00Z"
  }
}
```

:::danger Store keys securely
The raw key is shown **once**, at creation. Store it in a secrets manager or encrypted environment variable. Anyone with a `vc_live_` key can debit your wallet.
:::

## Manage keys

```bash
# List all keys
curl "https://api.verifiedcore.com/v1/auth/api-keys" \
  -H "Authorization: $VC_API_KEY"

# Revoke one key
curl -X DELETE "https://api.verifiedcore.com/v1/auth/api-keys/{keyId}" \
  -H "Authorization: $VC_API_KEY"

# Revoke all keys
curl -X DELETE "https://api.verifiedcore.com/v1/auth/api-keys" \
  -H "Authorization: $VC_API_KEY"
```

## Available scopes

| Scope | Grants |
|-------|--------|
| `numbers:read` | Search numbers |
| `numbers:write` | Purchase numbers |
| `sessions:read` | Read session status and OTP |
| `esim:read` | Browse eSIM packages |
| `esim:write` | Purchase eSIMs |
| `analytics:read` | Read delivery rates |
| `wallet:read` | Read wallet balance |
