CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  name VARCHAR(160) NOT NULL,
  business_name VARCHAR(180) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  location_name VARCHAR(180) NOT NULL,
  status VARCHAR(32) NOT NULL,
  logo_url TEXT,
  mpesa_paybill VARCHAR(64),
  support_phone VARCHAR(32),
  support_whatsapp VARCHAR(32),
  zero_rating_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  billing_model VARCHAR(40) NOT NULL DEFAULT 'MONTHLY',
  monthly_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  revenue_share_percent NUMERIC(5, 2) NOT NULL DEFAULT 0
);

CREATE TABLE user_accounts (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(48) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  last_login_at TIMESTAMPTZ
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE internet_packages (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  speed_mbps INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price_kes NUMERIC(12, 2) NOT NULL,
  status VARCHAR(32) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  whatsapp_calls_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  streaming_allowed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE hotspot_sessions (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  package_id UUID REFERENCES internet_packages(id),
  phone VARCHAR(32) NOT NULL,
  mac_address VARCHAR(64),
  radius_username VARCHAR(160),
  status VARCHAR(32) NOT NULL,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  data_used_bytes BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES internet_packages(id),
  session_id UUID REFERENCES hotspot_sessions(id),
  phone VARCHAR(32) NOT NULL,
  amount_kes NUMERIC(12, 2) NOT NULL,
  checkout_request_id VARCHAR(120) NOT NULL UNIQUE,
  merchant_request_id VARCHAR(120),
  mpesa_receipt_number VARCHAR(120),
  result_code VARCHAR(32),
  result_description TEXT,
  status VARCHAR(32) NOT NULL,
  paid_at TIMESTAMPTZ
);

CREATE TABLE network_events (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  type VARCHAR(48) NOT NULL,
  provider VARCHAR(80) NOT NULL DEFAULT 'Starlink',
  latency_ms INTEGER,
  packet_loss_percent INTEGER,
  message TEXT
);

CREATE TABLE failover_events (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  from_provider VARCHAR(80) NOT NULL,
  to_provider VARCHAR(80) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(32) NOT NULL,
  resolved_at TIMESTAMPTZ
);

CREATE TABLE zero_rating_events (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  action VARCHAR(80) NOT NULL,
  ip_range_count INTEGER NOT NULL DEFAULT 0,
  message TEXT
);

CREATE TABLE analytics_snapshots (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  hour_of_day INTEGER NOT NULL DEFAULT 0,
  active_sessions BIGINT NOT NULL DEFAULT 0,
  total_sessions BIGINT NOT NULL DEFAULT 0,
  zero_rated_devices BIGINT NOT NULL DEFAULT 0,
  zero_rating_conversions BIGINT NOT NULL DEFAULT 0,
  revenue_kes NUMERIC(12, 2) NOT NULL DEFAULT 0
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES user_accounts(id),
  action VARCHAR(120) NOT NULL,
  target_type VARCHAR(120) NOT NULL,
  target_id VARCHAR(120),
  metadata TEXT
);

CREATE TABLE tenant_invoices (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_number VARCHAR(80) NOT NULL UNIQUE,
  amount_kes NUMERIC(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(32) NOT NULL
);

CREATE TABLE isp_configs (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  primary_provider VARCHAR(80) NOT NULL DEFAULT 'Starlink',
  backup_provider VARCHAR(80) NOT NULL DEFAULT 'Airtel/JTL',
  latency_threshold_ms INTEGER NOT NULL DEFAULT 300,
  failure_threshold INTEGER NOT NULL DEFAULT 2,
  notification_webhook TEXT
);

CREATE INDEX idx_users_tenant ON user_accounts(tenant_id);
CREATE INDEX idx_packages_tenant_status ON internet_packages(tenant_id, status, sort_order);
CREATE INDEX idx_sessions_tenant_status ON hotspot_sessions(tenant_id, status, created_at DESC);
CREATE INDEX idx_sessions_expiry ON hotspot_sessions(expires_at);
CREATE INDEX idx_transactions_tenant_status ON payment_transactions(tenant_id, status, created_at DESC);
CREATE INDEX idx_network_events_tenant_created ON network_events(tenant_id, created_at DESC);
CREATE INDEX idx_failover_events_tenant_created ON failover_events(tenant_id, created_at DESC);
CREATE INDEX idx_zero_rating_events_tenant_created ON zero_rating_events(tenant_id, created_at DESC);
CREATE INDEX idx_analytics_tenant_date ON analytics_snapshots(tenant_id, snapshot_date, hour_of_day);
CREATE INDEX idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_invoices_tenant_created ON tenant_invoices(tenant_id, created_at DESC);
