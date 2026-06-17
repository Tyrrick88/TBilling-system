# TBilling System

Multi-tenant WiFi billing platform for hotspot operators.

## Project Structure

- `frontend/` - Next.js App Router UI for the captive portal and dashboards.
- `backend/` - Spring Boot service workspace.

## Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` by default.
Set `BACKEND_API_URL` to the Spring Boot API base URL. The frontend proxies dashboard calls through `/api/backend/...`.

Useful frontend routes:

- `/` - Client-facing captive portal.
- `/admin/login` - Client Admin login.
- `/admin` - Client Admin dashboard.
- `/admin/users`, `/admin/packages`, `/admin/financials`, `/admin/network`, `/admin/downtime`, `/admin/settings`
- `/super-admin/login` - Super Admin login.
- `/super-admin` - Super Admin dashboard.
- `/super-admin/tenants`, `/super-admin/analytics`, `/super-admin/isp-config`, `/super-admin/error-logs`, `/super-admin/billing`

## Backend

```bash
cd backend
cp .env.example .env
docker compose up postgres redis -d
mvn spring-boot:run
```

The backend runs at `http://localhost:8080` and includes seeded Super Admin and Client Admin accounts.

Seeded development logins:

- Client Admin: `admin@karurina.local` / `ChangeMe123!`
- Super Admin: `owner@tbilling.local` / `ChangeMe123!`

M-Pesa Daraja remains mock/callback-ready until live credentials are available.

Useful backend routes:

- `POST /api/v1/auth/login`
- `GET /api/v1/portal/karurina-market`
- `GET /api/v1/admin/overview`
- `GET /api/v1/admin/packages`
- `GET /api/v1/super/tenants`
- `PUT /api/v1/network/zero-rated-ips`
