# Security and Performance Hardening

TBilling now has defense in depth at the frontend proxy and backend API. Keep the code-level controls enabled, then add the Vercel Firewall rules below when the deployment project is connected.

## Runtime switches

Backend:

- `GEOFENCE_ENABLED=true`
- `GEOFENCE_ALLOWED_COUNTRIES=KE,US`
- `GEOFENCE_BLOCK_UNKNOWN=false` while testing CDN headers, then `true` once the country header is confirmed.
- `RATE_LIMIT_AUTH_PER_MINUTE=10`
- `RATE_LIMIT_PAYMENT_PER_MINUTE=30`
- `RATE_LIMIT_API_PER_MINUTE=240`
- `RATE_LIMIT_WINDOW_SECONDS=60`

Frontend proxy:

- Mirror the same settings with `NEXT_GEOFENCE_*` and `NEXT_RATE_LIMIT_*`.
- Keep `BACKEND_API_URL` pointed at the private backend URL when deployed.

## Vercel Firewall rules

Rate limiting must be enabled from the Vercel Firewall dashboard or REST API. `vercel.json` only supports `challenge` and `deny`, so use these JSON bodies as custom rule templates.

### Geofence API traffic

```json
{
  "name": "TBilling API country allowlist",
  "active": true,
  "conditionGroup": [
    {
      "conditions": [
        { "type": "path", "op": "pre", "value": "/api/backend/" },
        { "type": "geo_country", "op": "ninc", "value": ["KE", "US"] }
      ]
    }
  ],
  "action": {
    "mitigate": { "action": "deny" }
  }
}
```

### Rate limit login attempts

```json
{
  "name": "TBilling login rate limit",
  "active": true,
  "conditionGroup": [
    {
      "conditions": [
        { "type": "path", "op": "eq", "value": "/api/backend/auth/login" },
        { "type": "method", "op": "eq", "value": "POST" }
      ]
    }
  ],
  "action": {
    "mitigate": {
      "action": "rate_limit",
      "rateLimit": {
        "algo": "fixed_window",
        "window": 60,
        "limit": 10,
        "keys": ["ip"],
        "action": "challenge"
      }
    }
  }
}
```

### Rate limit API traffic

```json
{
  "name": "TBilling API rate limit",
  "active": true,
  "conditionGroup": [
    {
      "conditions": [
        { "type": "path", "op": "pre", "value": "/api/backend/" }
      ]
    }
  ],
  "action": {
    "mitigate": {
      "action": "rate_limit",
      "rateLimit": {
        "algo": "fixed_window",
        "window": 60,
        "limit": 240,
        "keys": ["ip"],
        "action": "deny"
      }
    }
  }
}
```

### Block proxy bypass probes

```json
{
  "name": "Block proxy bypass header",
  "active": true,
  "conditionGroup": [
    {
      "conditions": [
        { "type": "header", "op": "ex", "key": "x-middleware-subrequest" }
      ]
    }
  ],
  "action": {
    "mitigate": { "action": "deny" }
  }
}
```

## Managed protections

Enable these in the Vercel Firewall dashboard:

- Bot Protection: start with log or challenge mode, then tighten after observing real traffic.
- OWASP managed rules if available on the plan.
- Attack Challenge Mode during active abuse.

## Speed posture

- Public portal package reads are cached briefly at the frontend proxy and backend service layer.
- Admin APIs use `no-store` so private data is not cached.
- JWTs are stored in httpOnly cookies so dashboard requests avoid client-side token handling.
- Keep images and icons cacheable with immutable headers when their filenames are versioned.
