# TBilling System

Multi-tenant WiFi billing platform for hotspot operators.

## Project Structure

- `frontend/` - Next.js App Router UI for the captive portal and dashboards.
- `backend/` - Spring Boot service workspace.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` by default.

Useful frontend routes:

- `/` - Client-facing captive portal.
- `/admin` - Client Admin dashboard.
- `/admin/users`, `/admin/packages`, `/admin/financials`, `/admin/network`, `/admin/downtime`, `/admin/settings`
- `/super-admin` - Super Admin dashboard.
- `/super-admin/tenants`, `/super-admin/analytics`, `/super-admin/isp-config`, `/super-admin/error-logs`, `/super-admin/billing`
