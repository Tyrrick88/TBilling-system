# Observability

TBilling now emits useful signals from the browser, the Next.js proxy, and the Spring Boot backend.

## What is instrumented

- Frontend Web Analytics: `@vercel/analytics` is mounted in the root layout.
- Frontend Speed Insights: `@vercel/speed-insights` tracks route-level Core Web Vitals.
- Frontend structured logs: `/api/backend/*` emits JSON logs for request start, completion, blocks, and backend failures.
- Frontend health endpoint: `/api/health` checks the frontend and backend readiness path together.
- Backend request logs: `/api/v1/*` emits JSON logs with request ID, method, path, status, duration, client IP, and country.
- Backend metrics: Actuator exposes health, info, metrics, and Prometheus-format metrics.
- Backend error logs: handled API exceptions are logged with status, path, request ID, exception type, and message.

## Health checks

Use these for uptime monitors:

- Frontend and backend together: `GET https://<frontend-domain>/api/health`
- Backend readiness: `GET https://<backend-domain>/actuator/health/readiness`
- Backend liveness: `GET https://<backend-domain>/actuator/health/liveness`

Expected healthy response:

```json
{
  "status": "UP",
  "frontend": "UP",
  "backend": {
    "status": "UP",
    "httpStatus": 200
  }
}
```

Recommended uptime policy:

- Check `/api/health` every 60 seconds from at least 2 regions.
- Alert after 2 consecutive failures.
- Escalate if downtime exceeds 5 minutes.
- Keep backend health endpoints restricted to trusted monitors or private networking when possible.

## Metrics

Backend metrics:

- `GET /actuator/metrics`
- `GET /actuator/prometheus`

Recommended alert thresholds:

- `http.server.requests` 5xx rate above 2% for 5 minutes.
- Auth endpoint 401/429 spike above normal baseline for 5 minutes.
- p95 request latency above 1500 ms for 10 minutes.
- JVM memory usage above 85% for 10 minutes.
- Database connection pool saturation above 80% for 5 minutes.

Keep `/actuator/prometheus` behind private networking, VPN, or an allowlisted scraper. Do not expose detailed metrics publicly.

## Logs

All request logs are JSON so Vercel Logs, Datadog, Honeycomb, Better Stack, or any NDJSON collector can parse them.

Important fields:

- `requestId`: trace a request across frontend proxy and backend.
- `event`: log category, such as `backend_proxy_done`, `backend_proxy_blocked`, `http_request`, or `api_exception`.
- `status`: HTTP status.
- `durationMs`: request duration.
- `path`: route without query string.
- `country` and `clientIp`: useful for geofence and abuse investigations.

Use `x-request-id` from a response to search logs across both services.

## Error forwarding

Set `ERROR_WEBHOOK_URL` in the frontend deployment to forward server-side proxy and health-check failures to an external incident endpoint.

Good targets:

- Slack workflow webhook.
- Better Stack incoming webhook.
- Datadog HTTP intake.
- Custom internal alert endpoint.

Backend errors are emitted as JSON logs. In production, configure a Vercel Drain or the hosting provider's log drain to forward backend logs to your central system.

## Vercel setup

Enable these in the Vercel dashboard:

- Web Analytics.
- Speed Insights.
- Runtime Logs retention appropriate for the plan.
- Drains for logs and traces if the plan supports them.

Recommended drains:

- Runtime logs to a central log platform.
- Speed Insights to the performance dashboard or warehouse.
- Web Analytics events to a warehouse if you need long-term reporting.

## Post-deploy scan

After every production deploy:

```bash
vercel logs <deployment-url> --level error --since 1h
```

Then check:

- `/api/health` returns HTTP 200.
- Login succeeds once with a valid admin.
- A bad login returns HTTP 401, not 500.
- Repeated bad logins eventually return HTTP 429.
- Dashboard API requests include `x-request-id`.

## Dashboards

Minimum production dashboard:

- Uptime status for `/api/health`.
- 5xx count and rate by route.
- p95 and p99 latency by route.
- Login 401/429 volume.
- Payment callback failures.
- M-Pesa STK push failures once Daraja credentials are active.
- MikroTik provisioning failures once router integration is active.
- Core Web Vitals by frontend route.
