# Backend

Spring Boot 3 backend for the TBilling multi-tenant WiFi billing platform.

## What Is Implemented

- JWT auth with refresh tokens and roles: `ROLE_SUPER_ADMIN`, `ROLE_CLIENT_ADMIN`, `ROLE_USER`
- Tenant-scoped admin APIs for packages, sessions/users, financials, network, downtime, settings, and logo upload
- Super Admin APIs for tenant management, platform analytics, ISP config, error logs, and SaaS invoices
- Captive portal APIs for tenant settings, active packages, STK Push initiation, payment status, and callback handling
- PostgreSQL schema managed by Flyway
- Redis dependency ready for caching/session work
- Mockable Daraja/MikroTik flow: callbacks can mark payments paid and provision hotspot sessions
- Weekly zero-rating sync service and manual `/api/v1/network/zero-rated-ips` endpoint
- Network monitor scheduler and WebSocket topic at `/ws` with `/topic/network`
- Docker Compose for local PostgreSQL, Redis, and API

## Local Development

```bash
cd backend
cp .env.example .env
docker compose up postgres redis -d
mvn spring-boot:run
```

The API runs at `http://localhost:8080`.

Seeded users:

- Super Admin: `owner@tbilling.local` / `ChangeMe123!`
- Client Admin: `admin@karurina.local` / `ChangeMe123!`

Seeded portal tenant:

- `GET /api/v1/portal/karurina-market`
- `GET /api/v1/portal/karurina-market/packages`

## Verification

```bash
mvn test
mvn -DskipTests package
```

## Key Endpoints

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/admin/overview`
- `GET|POST /api/v1/admin/packages`
- `GET /api/v1/admin/financials/transactions`
- `GET|PUT /api/v1/admin/settings`
- `GET|POST /api/v1/super/tenants`
- `GET|PUT /api/v1/super/isp-config`
- `GET|POST /api/v1/super/billing`
- `POST /api/v1/portal/{tenantSlug}/payments/stk-push`
- `GET /api/v1/payments/status/{checkoutRequestId}`
- `POST /api/v1/payments/callback`

## Production Notes

- Replace all default credentials and `JWT_SECRET`.
- Configure Daraja sandbox/live credentials and an HTTPS callback URL.
- Configure the real MikroTik RouterOS adapter before enabling `MIKROTIK_ENABLED=true`.
- Replace the logo storage stub with R2/S3 byte persistence before enabling public uploads.
- Keep PostgreSQL and Redis private to the application network.
