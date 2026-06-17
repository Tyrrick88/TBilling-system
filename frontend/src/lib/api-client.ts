export type AdminRole = "client" | "super";

type ApiMoney = number | string;

type ApiUser = {
  id: string;
  tenantId: string | null;
  name: string;
  email: string;
  role: string;
  enabled: boolean;
};

type AuthResponse = {
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: ApiUser;
};

type PackageResponse = {
  id: string;
  tenantId: string;
  name: string;
  speedMbps: number;
  durationMinutes: number;
  priceKes: ApiMoney;
  status: "ACTIVE" | "INACTIVE";
  sortOrder: number;
  whatsappCallsAllowed: boolean;
  streamingAllowed: boolean;
};

type SessionResponse = {
  id: string;
  tenantId: string;
  packageId: string | null;
  packageName: string;
  phone: string;
  macAddress: string | null;
  radiusUsername: string | null;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "REVOKED";
  startsAt: string;
  expiresAt: string;
  dataUsedBytes: number;
  createdAt: string;
};

type TransactionResponse = {
  id: string;
  tenantId: string;
  packageId: string;
  packageName: string;
  phone: string;
  amountKes: ApiMoney;
  checkoutRequestId: string;
  mpesaReceiptNumber: string | null;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "TIMEOUT";
  paidAt: string | null;
  createdAt: string;
};

type TenantResponse = {
  id: string;
  name: string;
  businessName: string;
  slug: string;
  locationName: string;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  logoUrl: string | null;
  mpesaPaybill: string | null;
  supportPhone: string | null;
  supportWhatsapp: string | null;
  zeroRatingEnabled: boolean;
  billingModel: string;
  monthlyFee: ApiMoney;
  revenueSharePercent: ApiMoney;
  createdAt: string;
};

type FailoverEventResponse = {
  id: string;
  tenantId: string | null;
  fromProvider: string;
  toProvider: string;
  reason: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
  resolvedAt: string | null;
};

type NetworkStatusResponse = {
  primaryProvider: string;
  backupProvider: string;
  activeProvider: string;
  latencyMs: number;
  packetLossPercent: number;
  failoverActive: boolean;
  checkedAt: string;
};

type NetworkEventResponse = {
  id: string;
  tenantId: string | null;
  type: string;
  provider: string | null;
  latencyMs: number | null;
  packetLossPercent: number | null;
  message: string;
  createdAt: string;
};

type ChartPoint = {
  label: string;
  value: ApiMoney;
};

type OverviewResponse = {
  activeUsers: number;
  todayRevenueKes: ApiMoney;
  sessionsToday: number;
  networkUptimePercent: number;
  zeroRatingConversions: number;
  revenueSeries: ChartPoint[];
  sessionsByHour: ChartPoint[];
};

type PlatformAnalyticsResponse = {
  totalRevenueKes: ApiMoney;
  totalActiveSessions: number;
  totalRegisteredClients: number;
  platformUptimePercent: number;
  revenueByTenant: ChartPoint[];
  sessionsByRegion: ChartPoint[];
};

type IspConfigResponse = {
  id: string;
  primaryProvider: string;
  backupProvider: string;
  latencyThresholdMs: number;
  failureThreshold: number;
  notificationWebhook: string | null;
};

type InvoiceResponse = {
  id: string;
  tenantId: string;
  tenantName: string;
  invoiceNumber: string;
  amountKes: ApiMoney;
  dueDate: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID";
  createdAt: string;
};

type LogoUploadResponse = {
  logoUrl: string;
  message: string;
};

export type AuthSession = {
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: ApiUser;
};

export type DashboardPackage = {
  id: string;
  name: string;
  speed: number;
  duration: number;
  price: number;
  active: boolean;
};

export type DashboardSession = {
  id: string;
  phone: string;
  packageName: string;
  startedAt: string;
  expiresAt: string;
  dataUsed: string;
  status: "ACTIVE" | "PAUSED" | "EXPIRED";
};

export type DashboardTransaction = {
  id: string;
  phone: string;
  packageName: string;
  amount: number;
  mpesaId: string;
  timestamp: string;
  status: "PAID" | "PENDING" | "FAILED" | "REFUNDED";
};

export type DashboardOutage = {
  id: string;
  timestamp: string;
  duration: string;
  affectedUsers: number;
  isp: string;
  notes: string;
  resolved: boolean;
};

export type DashboardTenant = {
  id: string;
  admin: string;
  business: string;
  location: string;
  plan: string;
  revenue: number;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  lastActive: string;
};

export type DashboardErrorLog = {
  id: string;
  tenant: string;
  source: string;
  message: string;
  severity: "INFO" | "WARN" | "ERROR";
  timestamp: string;
  resolved: boolean;
};

export type DashboardInvoice = {
  id: string;
  tenant: string;
  amount: number;
  due: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE";
};

export type DashboardTenantSettings = {
  location: string;
  mpesa: string;
  support: string;
  receiptName: string;
};

export type DashboardNetworkStatus = {
  primaryProvider: string;
  backupProvider: string;
  activeProvider: string;
  latencyMs: number;
  packetLossPercent: number;
  failoverActive: boolean;
};

export type DashboardOverview = {
  activeUsers: number;
  todayRevenue: number;
  sessionsToday: number;
  networkUptime: number;
  zeroRatingConversions: number;
  revenueSeries: number[];
  sessionsByHour: number[];
};

export type PlatformOverview = {
  totalRevenue: number;
  totalActiveSessions: number;
  totalRegisteredClients: number;
  platformUptime: number;
  revenueByTenant: number[];
  sessionsByRegion: Array<{ region: string; sessions: number; revenue: number; conversion: string }>;
};

export type ClientWorkspace = {
  overview: DashboardOverview;
  packages: DashboardPackage[];
  sessions: DashboardSession[];
  transactions: DashboardTransaction[];
  outages: DashboardOutage[];
  settings: DashboardTenantSettings;
  zeroRatingEnabled: boolean;
  logoUrl: string | null;
  networkStatus: DashboardNetworkStatus;
};

export type SuperWorkspace = {
  tenants: DashboardTenant[];
  analytics: PlatformOverview;
  ispConfig: {
    threshold: string;
    checks: string;
    primary: string;
    backup: string;
    webhook: string;
  };
  errors: DashboardErrorLog[];
  invoices: DashboardInvoice[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function getStoredAuth(role: AdminRole): AuthSession | null {
  if (typeof window === "undefined") return null;

  const stored = readCookie(`tbilling_${role}_session`);
  if (!stored) return null;

  try {
    const auth = JSON.parse(atobUrl(stored)) as AuthSession;
    if (Date.parse(auth.accessTokenExpiresAt) <= Date.now()) {
      return null;
    }
    return auth;
  } catch {
    return null;
  }
}

export async function logout(role: AdminRole) {
  await apiFetch<void>("auth/logout", { method: "POST", role });
}

export async function login(role: AdminRole, email: string, password: string) {
  const auth = await apiFetch<AuthResponse>("auth/login", {
    method: "POST",
    role,
    body: { email, password },
  });

  return auth satisfies AuthSession;
}

export async function loadClientWorkspace(role: AdminRole): Promise<ClientWorkspace> {
  const [overview, packages, sessions, transactions, failovers, settings, networkStatus] = await Promise.all([
    apiFetch<OverviewResponse>("admin/overview", { role }),
    apiFetch<PackageResponse[]>("admin/packages", { role }),
    apiFetch<SessionResponse[]>("admin/sessions", { role }),
    apiFetch<TransactionResponse[]>("admin/financials/transactions", { role }),
    apiFetch<FailoverEventResponse[]>("admin/network/failovers", { role }),
    apiFetch<TenantResponse>("admin/settings", { role }),
    apiFetch<NetworkStatusResponse>("admin/network/status", { role }),
  ]);

  return {
    overview: mapOverview(overview),
    packages: packages.map(mapPackage),
    sessions: sessions.map(mapSession),
    transactions: transactions.map(mapTransaction),
    outages: failovers.map(mapFailover),
    settings: mapTenantSettings(settings),
    zeroRatingEnabled: settings.zeroRatingEnabled,
    logoUrl: settings.logoUrl,
    networkStatus: mapNetworkStatus(networkStatus),
  };
}

export async function loadSuperWorkspace(role: AdminRole): Promise<SuperWorkspace> {
  const [tenants, analytics, ispConfig, errors, invoices] = await Promise.all([
    apiFetch<TenantResponse[]>("super/tenants", { role }),
    apiFetch<PlatformAnalyticsResponse>("super/analytics", { role }),
    apiFetch<IspConfigResponse>("super/isp-config", { role }),
    apiFetch<NetworkEventResponse[]>("super/error-logs", { role }),
    apiFetch<InvoiceResponse[]>("super/billing", { role }),
  ]);

  const revenueLookup = new Map(
    analytics.revenueByTenant.map((point) => [point.label.toLowerCase(), toNumber(point.value)]),
  );

  return {
    tenants: tenants.map((tenant) =>
      mapTenant(tenant, revenueLookup.get(tenant.name.toLowerCase()) ?? revenueLookup.get(tenant.businessName.toLowerCase()) ?? 0),
    ),
    analytics: mapPlatformOverview(analytics),
    ispConfig: {
      threshold: String(ispConfig.latencyThresholdMs),
      checks: String(ispConfig.failureThreshold),
      primary: ispConfig.primaryProvider,
      backup: ispConfig.backupProvider,
      webhook: ispConfig.notificationWebhook ?? "",
    },
    errors: errors.map((error) => mapNetworkError(error, tenants)),
    invoices: invoices.map(mapInvoice),
  };
}

export async function savePackage(
  role: AdminRole,
  item: DashboardPackage,
  sortOrder: number,
  editingPackageId?: string | null,
) {
  const payload = {
    name: item.name,
    speedMbps: item.speed,
    durationMinutes: item.duration,
    priceKes: item.price,
    status: item.active ? "ACTIVE" : "INACTIVE",
    sortOrder,
    whatsappCallsAllowed: item.speed >= 5,
    streamingAllowed: item.speed >= 5,
  };

  const response = await apiFetch<PackageResponse>(
    editingPackageId ? `admin/packages/${editingPackageId}` : "admin/packages",
    {
      method: editingPackageId ? "PUT" : "POST",
      role,
      body: payload,
    },
  );

  return mapPackage(response);
}

export async function deletePackage(role: AdminRole, packageId: string) {
  await apiFetch<void>(`admin/packages/${packageId}`, { method: "DELETE", role });
}

export async function reorderPackages(role: AdminRole, packageIds: string[]) {
  const response = await apiFetch<PackageResponse[]>("admin/packages/reorder", {
    method: "PUT",
    role,
    body: { packageIds },
  });
  return response.map(mapPackage);
}

export async function updateTenantSettings(
  role: AdminRole,
  settings: DashboardTenantSettings,
  zeroRatingEnabled: boolean,
) {
  const response = await apiFetch<TenantResponse>("admin/settings", {
    method: "PUT",
    role,
    body: {
      locationName: settings.location,
      mpesaPaybill: settings.mpesa,
      supportPhone: settings.support,
      supportWhatsapp: settings.support,
      zeroRatingEnabled,
    },
  });
  return {
    settings: mapTenantSettings(response),
    zeroRatingEnabled: response.zeroRatingEnabled,
  };
}

export async function uploadTenantLogo(role: AdminRole, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<LogoUploadResponse>("admin/settings/logo", {
    method: "POST",
    role,
    body: formData,
  });
}

export async function syncZeroRatedIps(role: AdminRole) {
  return apiFetch<{ message: string }>("network/zero-rated-ips", { method: "PUT", role });
}

export async function createTenant(
  role: AdminRole,
  draft: { admin: string; business: string; location: string; plan: string },
) {
  const business = draft.business.trim() || "New Hotspot";
  const slug = slugify(business);
  const adminName = draft.admin.trim() || "New Admin";
  const plan = tenantPlanToBilling(draft.plan);
  const response = await apiFetch<TenantResponse>("super/tenants", {
    method: "POST",
    role,
    body: {
      name: business,
      businessName: business,
      slug,
      locationName: draft.location.trim() || "Kenya",
      adminEmail: `${slug}@tbilling.local`,
      adminName,
      adminPassword: "ChangeMe123!",
      monthlyFee: plan.monthlyFee,
      revenueSharePercent: plan.revenueSharePercent,
    },
  });

  return mapTenant(response, 0);
}

export async function updateTenantStatus(role: AdminRole, tenant: DashboardTenant) {
  const nextStatus = tenant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
  const response = await apiFetch<TenantResponse>(`super/tenants/${tenant.id}`, {
    method: "PUT",
    role,
    body: { status: nextStatus },
  });

  return mapTenant(response, tenant.revenue);
}

export async function deleteTenant(role: AdminRole, tenantId: string) {
  await apiFetch<void>(`super/tenants/${tenantId}`, { method: "DELETE", role });
}

export async function updateIspConfig(
  role: AdminRole,
  config: { threshold: string; checks: string; primary: string; backup: string; webhook: string },
) {
  const response = await apiFetch<IspConfigResponse>("super/isp-config", {
    method: "PUT",
    role,
    body: {
      primaryProvider: config.primary,
      backupProvider: config.backup,
      latencyThresholdMs: Number(config.threshold) || 300,
      failureThreshold: Number(config.checks) || 2,
      notificationWebhook: config.webhook,
    },
  });

  return {
    threshold: String(response.latencyThresholdMs),
    checks: String(response.failureThreshold),
    primary: response.primaryProvider,
    backup: response.backupProvider,
    webhook: response.notificationWebhook ?? "",
  };
}

export async function createInvoice(
  role: AdminRole,
  draft: { tenant: string; amount: string; due: string },
  tenants: DashboardTenant[],
) {
  const tenant = tenants.find((item) => item.business === draft.tenant) ?? tenants[0];
  if (!tenant) {
    throw new ApiError("Create a tenant before generating invoices.", 400);
  }

  const response = await apiFetch<InvoiceResponse>("super/billing", {
    method: "POST",
    role,
    body: {
      tenantId: tenant.id,
      amountKes: Number(draft.amount) || 0,
      dueDate: draft.due,
    },
  });

  return mapInvoice(response);
}

async function apiFetch<T>(
  path: string,
  options: {
    method?: string;
    role?: AdminRole;
    body?: FormData | Record<string, unknown>;
  } = {},
): Promise<T> {
  const headers = new Headers({ accept: "application/json" });
  let body: BodyInit | undefined;

  if (options.role) {
    headers.set("x-tbilling-role", options.role);
  }

  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`/api/backend/${path.replace(/^\/+/, "")}`, {
    method: options.method ?? "GET",
    headers,
    body,
    cache: "no-store",
    credentials: "same-origin",
  });

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String(payload.message)
        : `API request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`))
    ?.split("=")[1];
}

function atobUrl(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  return window.atob(base64 + padding);
}

function mapPackage(item: PackageResponse): DashboardPackage {
  return {
    id: item.id,
    name: item.name,
    speed: item.speedMbps,
    duration: item.durationMinutes,
    price: toNumber(item.priceKes),
    active: item.status === "ACTIVE",
  };
}

function mapSession(item: SessionResponse): DashboardSession {
  return {
    id: item.id,
    phone: item.phone,
    packageName: item.packageName,
    startedAt: formatDateTime(item.startsAt),
    expiresAt: formatDateTime(item.expiresAt),
    dataUsed: formatBytes(item.dataUsedBytes),
    status: item.status === "ACTIVE" ? "ACTIVE" : item.status === "EXPIRED" ? "EXPIRED" : "PAUSED",
  };
}

function mapTransaction(item: TransactionResponse): DashboardTransaction {
  return {
    id: item.id,
    phone: item.phone,
    packageName: item.packageName,
    amount: toNumber(item.amountKes),
    mpesaId: item.mpesaReceiptNumber ?? item.checkoutRequestId,
    timestamp: formatDateTime(item.paidAt ?? item.createdAt),
    status: item.status === "TIMEOUT" ? "FAILED" : item.status,
  };
}

function mapFailover(item: FailoverEventResponse): DashboardOutage {
  return {
    id: item.id,
    timestamp: formatDateTime(item.createdAt),
    duration: item.resolvedAt ? elapsedLabel(item.createdAt, item.resolvedAt) : "open",
    affectedUsers: 0,
    isp: item.toProvider,
    notes: item.reason,
    resolved: item.status === "RESOLVED",
  };
}

function mapTenant(item: TenantResponse, revenue: number): DashboardTenant {
  return {
    id: item.id,
    admin: item.name,
    business: item.businessName,
    location: item.locationName,
    plan: tenantPlanLabel(item),
    revenue,
    status: item.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
    createdAt: item.createdAt.slice(0, 10),
    lastActive: "synced",
  };
}

function mapNetworkError(item: NetworkEventResponse, tenants: TenantResponse[]): DashboardErrorLog {
  const tenant = tenants.find((candidate) => candidate.id === item.tenantId);
  const severity: DashboardErrorLog["severity"] =
    item.type === "ROUTER_API_ERROR" ? "ERROR" : item.type.includes("FAILOVER") ? "WARN" : "INFO";

  return {
    id: item.id,
    tenant: tenant?.businessName ?? "Platform",
    source: item.provider ?? item.type,
    message: item.message,
    severity,
    timestamp: formatDateTime(item.createdAt),
    resolved: severity === "INFO",
  };
}

function mapInvoice(item: InvoiceResponse): DashboardInvoice {
  return {
    id: item.invoiceNumber,
    tenant: item.tenantName,
    amount: toNumber(item.amountKes),
    due: item.dueDate,
    status: item.status === "VOID" ? "DRAFT" : item.status,
  };
}

function mapTenantSettings(item: TenantResponse): DashboardTenantSettings {
  return {
    location: item.locationName,
    mpesa: item.mpesaPaybill ?? "",
    support: item.supportWhatsapp ?? item.supportPhone ?? "",
    receiptName: item.businessName,
  };
}

function mapNetworkStatus(item: NetworkStatusResponse): DashboardNetworkStatus {
  return {
    primaryProvider: item.primaryProvider,
    backupProvider: item.backupProvider,
    activeProvider: item.activeProvider,
    latencyMs: item.latencyMs,
    packetLossPercent: item.packetLossPercent,
    failoverActive: item.failoverActive,
  };
}

function mapOverview(item: OverviewResponse): DashboardOverview {
  return {
    activeUsers: item.activeUsers,
    todayRevenue: toNumber(item.todayRevenueKes),
    sessionsToday: item.sessionsToday,
    networkUptime: item.networkUptimePercent,
    zeroRatingConversions: item.zeroRatingConversions,
    revenueSeries: padSeries(item.revenueSeries.map((point) => toNumber(point.value))),
    sessionsByHour: padSeries(item.sessionsByHour.map((point) => toNumber(point.value))),
  };
}

function mapPlatformOverview(item: PlatformAnalyticsResponse): PlatformOverview {
  return {
    totalRevenue: toNumber(item.totalRevenueKes),
    totalActiveSessions: item.totalActiveSessions,
    totalRegisteredClients: item.totalRegisteredClients,
    platformUptime: item.platformUptimePercent,
    revenueByTenant: padSeries(item.revenueByTenant.map((point) => toNumber(point.value)), 3),
    sessionsByRegion: item.sessionsByRegion.map((point) => ({
      region: point.label,
      sessions: toNumber(point.value),
      revenue: 0,
      conversion: "N/A",
    })),
  };
}

function toNumber(value: ApiMoney | null | undefined) {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(0, Math.round(bytes / 1024))} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function elapsedLabel(start: string, end: string) {
  const ms = Math.max(0, new Date(end).getTime() - new Date(start).getTime());
  const minutes = Math.max(1, Math.round(ms / 60000));
  return `${minutes}m`;
}

function tenantPlanLabel(item: TenantResponse) {
  const revenueShare = toNumber(item.revenueSharePercent);
  if (revenueShare > 0) return `${revenueShare}% revenue share`;
  const monthlyFee = toNumber(item.monthlyFee);
  if (monthlyFee > 0) return `KES ${monthlyFee.toLocaleString("en-KE")}/mo`;
  return item.billingModel || "Monthly";
}

function tenantPlanToBilling(plan: string) {
  if (plan.toLowerCase().includes("revenue")) {
    return { monthlyFee: 0, revenueSharePercent: 15 };
  }

  const monthlyFee = Number(plan.replace(/[^\d.]/g, "")) || 5000;
  return { monthlyFee, revenueSharePercent: 0 };
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `tenant-${Date.now()}`
  );
}

function padSeries(values: number[], minimumLength = 12) {
  if (values.length >= minimumLength) return values;
  return [...values, ...Array.from({ length: minimumLength - values.length }, () => 0)];
}
