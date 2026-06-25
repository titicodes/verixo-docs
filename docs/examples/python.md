---
id: python
title: Python Example
sidebar_label: Python
---

# Python Example

Full working script using the `verixo` PyPI package.

## Install

```bash
pip install verixo
```

Requires Python 3.8+.

## Complete script

```python title="verixo_otp.py"
import os
import verixo as vc
from verixo import VerixoError

client = vc.Client(api_key=os.environ["VC_API_KEY"])

# 1. Search for numbers ranked by Health Score™
result = client.numbers.search(
    service_slug="whatsapp",
    country_code="NG",
    min_score=80,
    limit=5,
)

if not result.numbers:
    print("No numbers available — try a lower min_score or different country.")
    raise SystemExit(1)

top = result.numbers[0]
print(f"Found {len(result.numbers)} number(s). Top: {top.e164_number} (score {top.health_score})")

# 2. Purchase — server picks the best available number automatically
session = client.numbers.purchase(
    service_slug="whatsapp",
    country_code="NG",
)
print(f"Session {session.session_token} created. Waiting for OTP (90s SLA)…")

# 3. Subscribe for real-time OTP push via WebSocket (no polling)
def on_otp(push):
    print(f"✓ OTP: {push.otp}  ({push.latency_ms}ms)")

try:
    client.subscribe(session.session_token, on_otp)
except VerixoError as e:
    print(f"API error {e.status} [{e.code}]: {e.message}")
    raise SystemExit(1)
```

## Run it

```bash
VC_API_KEY=vc_test_your_key python verixo_otp.py
```

## SDK reference

| Method | Description |
|--------|-------------|
| `client.numbers.search(**params)` | Return numbers ranked by Health Score™ |
| `client.numbers.purchase(**params)` | Reserve a number, start SLA timer, return `PurchaseResult` |
| `client.sessions.get(token)` | Poll session status and OTP |
| `client.analytics.rates(**params)` | 30-day delivery rates by service/country |
| `client.subscribe(token, callback)` | Real-time OTP push via WebSocket |

## Test mode

```python
session = client.numbers.purchase(
    service_slug="whatsapp",
    country_code="NG",
    test_mode=True,   # sandbox only — instant mock delivery
)
```
