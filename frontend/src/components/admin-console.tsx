"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Gauge,
  Globe2,
  History,
  Landmark,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Network,
  Package,
  Plus,
  RadioTower,
  Receipt,
  RefreshCw,
  Router,
  Save,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  UploadCloud,
  Users,
  WalletCards,
  Wifi,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, DragEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  createInvoice as createInvoiceApi,
  createTenant as createTenantApi,
  deletePackage as deletePackageApi,
  deleteTenant as deleteTenantApi,
  getStoredAuth,
  loadClientWorkspace,
  loadSuperWorkspace,
  logout as logoutApi,
  reorderPackages as reorderPackagesApi,
  savePackage as savePackageApi,
  syncZeroRatedIps,
  updateIspConfig as updateIspConfigApi,
  updateTenantSettings as updateTenantSettingsApi,
  updateTenantStatus as updateTenantStatusApi,
  uploadTenantLogo,
  type AuthSession,
  type DashboardNetworkStatus,
  type DashboardOverview,
  type PlatformOverview,
} from "@/lib/api-client";

type Role = "client" | "super";
type ClientSection =
  | "overview"
  | "users"
  | "packages"
  | "financials"
  | "network"
  | "downtime"
  | "settings";
type SuperSection = "overview" | "tenants" | "analytics" | "isp-config" | "error-logs" | "billing";

type PackageItem = {
  id: string;
  name: string;
  speed: number;
  duration: number;
  price: number;
  active: boolean;
};

type SessionItem = {
  id: string;
  phone: string;
  packageName: string;
  startedAt: string;
  expiresAt: string;
  dataUsed: string;
  status: "ACTIVE" | "PAUSED" | "EXPIRED";
};

type Transaction = {
  id: string;
  phone: string;
  packageName: string;
  amount: number;
  mpesaId: string;
  timestamp: string;
  status: "PAID" | "PENDING" | "FAILED" | "REFUNDED";
};

type Outage = {
  id: string;
  timestamp: string;
  duration: string;
  affectedUsers: number;
  isp: string;
  notes: string;
  resolved: boolean;
};

type Tenant = {
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

type ErrorLog = {
  id: string;
  tenant: string;
  source: string;
  message: string;
  severity: "INFO" | "WARN" | "ERROR";
  timestamp: string;
  resolved: boolean;
};

type Invoice = {
  id: string;
  tenant: string;
  amount: number;
  due: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE";
};

type NavItem<T extends string> = {
  id: T;
  label: string;
  href: string;
  icon: LucideIcon;
};

const clientNav: Array<NavItem<ClientSection>> = [
  { id: "overview", label: "Overview", href: "/admin", icon: LayoutDashboard },
  { id: "users", label: "Users", href: "/admin/users", icon: Users },
  { id: "packages", label: "Packages", href: "/admin/packages", icon: Package },
  { id: "financials", label: "Financials", href: "/admin/financials", icon: WalletCards },
  { id: "network", label: "Network", href: "/admin/network", icon: Network },
  { id: "downtime", label: "Downtime", href: "/admin/downtime", icon: History },
  { id: "settings", label: "Settings", href: "/admin/settings", icon: Settings2 },
];

const superNav: Array<NavItem<SuperSection>> = [
  { id: "overview", label: "Global", href: "/super-admin", icon: LayoutDashboard },
  { id: "tenants", label: "Tenants", href: "/super-admin/tenants", icon: Building2 },
  { id: "analytics", label: "Analytics", href: "/super-admin/analytics", icon: BarChart3 },
  { id: "isp-config", label: "ISP Config", href: "/super-admin/isp-config", icon: RadioTower },
  { id: "error-logs", label: "Error Logs", href: "/super-admin/error-logs", icon: AlertTriangle },
  { id: "billing", label: "Billing", href: "/super-admin/billing", icon: FileText },
];

const initialPackages: PackageItem[] = [
  { id: "starter", name: "Starter", speed: 2, duration: 60, price: 20, active: true },
  { id: "day", name: "Day Pass", speed: 5, duration: 1440, price: 80, active: true },
  { id: "stream", name: "Stream Max", speed: 10, duration: 360, price: 120, active: true },
  { id: "night", name: "Night Owl", speed: 6, duration: 480, price: 60, active: false },
];

const initialSessions: SessionItem[] = [
  {
    id: "s-1001",
    phone: "254 711 284 912",
    packageName: "Day Pass",
    startedAt: "2026-06-17 08:12",
    expiresAt: "2026-06-18 08:12",
    dataUsed: "3.8 GB",
    status: "ACTIVE",
  },
  {
    id: "s-1002",
    phone: "254 720 118 403",
    packageName: "Starter",
    startedAt: "2026-06-17 10:22",
    expiresAt: "2026-06-17 11:22",
    dataUsed: "180 MB",
    status: "ACTIVE",
  },
  {
    id: "s-1003",
    phone: "254 735 804 712",
    packageName: "Stream Max",
    startedAt: "2026-06-17 09:44",
    expiresAt: "2026-06-17 15:44",
    dataUsed: "1.6 GB",
    status: "PAUSED",
  },
  {
    id: "s-1004",
    phone: "254 745 990 112",
    packageName: "Starter",
    startedAt: "2026-06-16 19:10",
    expiresAt: "2026-06-16 20:10",
    dataUsed: "420 MB",
    status: "EXPIRED",
  },
];

const initialTransactions: Transaction[] = [
  {
    id: "t-8101",
    phone: "254 711 284 912",
    packageName: "Day Pass",
    amount: 80,
    mpesaId: "RHF8K9P2B1",
    timestamp: "2026-06-17 08:12",
    status: "PAID",
  },
  {
    id: "t-8102",
    phone: "254 720 118 403",
    packageName: "Starter",
    amount: 20,
    mpesaId: "RHF9Q4C8M2",
    timestamp: "2026-06-17 10:22",
    status: "PAID",
  },
  {
    id: "t-8103",
    phone: "254 735 804 712",
    packageName: "Stream Max",
    amount: 120,
    mpesaId: "RHG1J0D2X7",
    timestamp: "2026-06-17 09:44",
    status: "PENDING",
  },
  {
    id: "t-8104",
    phone: "254 745 990 112",
    packageName: "Starter",
    amount: 20,
    mpesaId: "RHD4A2F6N9",
    timestamp: "2026-06-16 19:10",
    status: "FAILED",
  },
];

const initialOutages: Outage[] = [
  {
    id: "o-501",
    timestamp: "2026-06-17 07:15",
    duration: "4m",
    affectedUsers: 18,
    isp: "Primary",
    notes: "High latency, auto-recovered",
    resolved: true,
  },
  {
    id: "o-502",
    timestamp: "2026-06-16 18:48",
    duration: "12m",
    affectedUsers: 44,
    isp: "Backup",
    notes: "Power interruption at kiosk",
    resolved: true,
  },
];

const initialTenants: Tenant[] = [
  {
    id: "tenant-karurina",
    admin: "Mary Wanjiru",
    business: "Karurina Hotspot",
    location: "Karurina Market, Embu",
    plan: "Revenue Share",
    revenue: 1420000,
    status: "ACTIVE",
    createdAt: "2026-02-14",
    lastActive: "2m ago",
  },
  {
    id: "tenant-kutus",
    admin: "Brian Otieno",
    business: "Kutus Stage WiFi",
    location: "Kutus, Kirinyaga",
    plan: "KES 7,500/mo",
    revenue: 780000,
    status: "ACTIVE",
    createdAt: "2026-03-08",
    lastActive: "18m ago",
  },
  {
    id: "tenant-runyenjes",
    admin: "Faith Muthoni",
    business: "Runyenjes Plaza Net",
    location: "Runyenjes",
    plan: "KES 5,000/mo",
    revenue: 618000,
    status: "SUSPENDED",
    createdAt: "2026-04-21",
    lastActive: "2d ago",
  },
];

const initialErrors: ErrorLog[] = [
  {
    id: "e-901",
    tenant: "Karurina Hotspot",
    source: "Daraja callback",
    message: "Duplicate CheckoutRequestID ignored by idempotency guard",
    severity: "WARN",
    timestamp: "2026-06-17 10:31",
    resolved: false,
  },
  {
    id: "e-902",
    tenant: "Kutus Stage WiFi",
    source: "RouterOS API",
    message: "Temporary timeout while applying queue profile",
    severity: "ERROR",
    timestamp: "2026-06-17 09:54",
    resolved: false,
  },
  {
    id: "e-903",
    tenant: "Runyenjes Plaza Net",
    source: "RADIUS",
    message: "Session expiry worker removed 18 stale users",
    severity: "INFO",
    timestamp: "2026-06-17 08:10",
    resolved: true,
  },
];

const initialInvoices: Invoice[] = [
  { id: "INV-1028", tenant: "Karurina Hotspot", amount: 14500, due: "2026-06-30", status: "SENT" },
  { id: "INV-1029", tenant: "Kutus Stage WiFi", amount: 7500, due: "2026-06-28", status: "PAID" },
  { id: "INV-1030", tenant: "Runyenjes Plaza Net", amount: 5000, due: "2026-06-20", status: "OVERDUE" },
];

const revenueBars = [42, 58, 52, 68, 76, 64, 88, 82, 94, 71, 78, 91];
const sessionsByHour = [12, 18, 24, 34, 48, 62, 71, 78, 69, 54, 42, 31];
const uptimeSeries = [98, 99, 97, 100, 99, 100, 99];

const defaultClientOverview: DashboardOverview = {
  activeUsers: initialSessions.filter((session) => session.status === "ACTIVE").length,
  todayRevenue: initialTransactions
    .filter((transaction) => transaction.status === "PAID")
    .reduce((sum, transaction) => sum + transaction.amount, 0),
  sessionsToday: initialSessions.length,
  networkUptime: 99.94,
  zeroRatingConversions: 47,
  revenueSeries: revenueBars,
  sessionsByHour,
};

const defaultNetworkStatus: DashboardNetworkStatus = {
  primaryProvider: "Primary",
  backupProvider: "Backup",
  activeProvider: "Primary",
  latencyMs: 42,
  packetLossPercent: 0,
  failoverActive: false,
};

const defaultPlatformOverview: PlatformOverview = {
  totalRevenue: initialTenants.reduce((sum, tenant) => sum + tenant.revenue, 0),
  totalActiveSessions: 1284,
  totalRegisteredClients: initialTenants.length,
  platformUptime: 99.96,
  revenueByTenant: initialTenants.map((tenant) => Math.max(20, tenant.revenue / 16000)),
  sessionsByRegion: [
    { region: "Embu", sessions: 4882, revenue: 1420000, conversion: "41%" },
    { region: "Kirinyaga", sessions: 2109, revenue: 780000, conversion: "38%" },
    { region: "Meru", sessions: 1804, revenue: 618000, conversion: "36%" },
  ],
};

const emptyPackageDraft = {
  name: "",
  speed: "2",
  duration: "60",
  price: "20",
  active: true,
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatKes(value: number) {
  return `KES ${value.toLocaleString("en-KE")}`;
}

function downloadCsv(filename: string, rows: Array<Record<string, string | number | boolean>>) {
  const headers = Object.keys(rows[0] ?? {});
  const body = rows.map((row) =>
    headers.map((header) => `"${String(row[header] ?? "").replaceAll('"', '""')}"`).join(","),
  );
  const blob = new Blob([[headers.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function statusClass(status: string) {
  if (["ACTIVE", "PAID", "Healthy", "INFO"].includes(status)) return "status-good";
  if (["PENDING", "WARN", "DRAFT", "SENT"].includes(status)) return "status-warn";
  if (["SUSPENDED", "FAILED", "ERROR", "OVERDUE", "PAUSED"].includes(status)) return "status-bad";
  return "status-muted";
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? `${fallback} ${error.message}` : fallback;
}

export function AdminConsole({
  role,
  section,
}: {
  role: Role;
  section: ClientSection | SuperSection;
}) {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthSession | null>(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const [clientOverview, setClientOverview] = useState(defaultClientOverview);
  const [platformOverview, setPlatformOverview] = useState(defaultPlatformOverview);
  const [networkStatus, setNetworkStatus] = useState(defaultNetworkStatus);
  const [packages, setPackages] = useState(initialPackages);
  const [sessions, setSessions] = useState(initialSessions);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [outages, setOutages] = useState(initialOutages);
  const [tenants, setTenants] = useState(initialTenants);
  const [errors, setErrors] = useState(initialErrors);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionStatus, setSessionStatus] = useState("ALL");
  const [sessionPackage, setSessionPackage] = useState("ALL");
  const [sessionDate, setSessionDate] = useState("2026-06-17");
  const [transactionStatus, setTransactionStatus] = useState("ALL");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [packageDraft, setPackageDraft] = useState(emptyPackageDraft);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [zeroRating, setZeroRating] = useState(true);
  const [autoFailover, setAutoFailover] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [tenantSettings, setTenantSettings] = useState({
    location: "Karurina Market, Embu",
    mpesa: "123456",
    support: "+254 711 000 000",
    receiptName: "Karurina WiFi",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [tenantSearch, setTenantSearch] = useState("");
  const [tenantDraft, setTenantDraft] = useState({
    admin: "",
    business: "",
    location: "",
    plan: "KES 5,000/mo",
  });
  const [ispConfig, setIspConfig] = useState({
    threshold: "300",
    checks: "2",
    primary: "Primary",
    backup: "Backup",
    webhook: "https://hooks.example.com/network",
  });
  const [invoiceDraft, setInvoiceDraft] = useState({
    tenant: "Karurina Hotspot",
    amount: "7500",
    due: "2026-06-30",
  });
  const [toast, setToast] = useState("Checking backend connection.");

  const navItems = role === "client" ? clientNav : superNav;
  const activeNav = navItems.find((item) => item.id === section) ?? navItems[0];
  const loginPath = role === "client" ? "/admin/login" : "/super-admin/login";
  const totalRevenue = transactions
    .filter((transaction) => transaction.status === "PAID")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const activeUsers = apiConnected ? clientOverview.activeUsers : sessions.filter((session) => session.status === "ACTIVE").length;
  const clientRevenueBars = clientOverview.revenueSeries.some(Boolean) ? clientOverview.revenueSeries : revenueBars;
  const clientSessionsByHour = clientOverview.sessionsByHour.some(Boolean) ? clientOverview.sessionsByHour : sessionsByHour;
  const platformRevenueBars = platformOverview.revenueByTenant.some(Boolean)
    ? platformOverview.revenueByTenant
    : tenants.map((tenant) => Math.max(20, tenant.revenue / 16000));

  const loadWorkspace = useCallback(
    async () => {
      setLoadingWorkspace(true);
      try {
        if (role === "client") {
          const workspace = await loadClientWorkspace(role);
          setClientOverview(workspace.overview);
          setPackages(workspace.packages);
          setSessions(workspace.sessions);
          setTransactions(workspace.transactions);
          setOutages(workspace.outages);
          setTenantSettings(workspace.settings);
          setZeroRating(workspace.zeroRatingEnabled);
          setLogoPreview(workspace.logoUrl);
          setNetworkStatus(workspace.networkStatus);
        } else {
          const workspace = await loadSuperWorkspace(role);
          setTenants(workspace.tenants);
          setPlatformOverview(workspace.analytics);
          setIspConfig(workspace.ispConfig);
          setErrors(workspace.errors);
          setInvoices(workspace.invoices);
          if (workspace.tenants[0]) {
            setInvoiceDraft((draft) => ({ ...draft, tenant: workspace.tenants[0].business }));
          }
        }
        setApiConnected(true);
        setToast("Backend connected. Dashboard data is synced.");
      } catch (error) {
        setApiConnected(false);
        setToast(errorMessage(error, "Backend unavailable. Showing demo data."));
      } finally {
        setLoadingWorkspace(false);
      }
    },
    [role],
  );

  useEffect(() => {
    let cancelled = false;
    const storedAuth = getStoredAuth(role);
    if (!storedAuth) {
      router.replace(loginPath);
      return () => {
        cancelled = true;
      };
    }

    void Promise.resolve().then(() => {
      if (cancelled) return;
      setAuth(storedAuth);
      void loadWorkspace();
    });

    return () => {
      cancelled = true;
    };
  }, [loadWorkspace, loginPath, role, router]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesSearch =
        session.phone.toLowerCase().includes(sessionSearch.toLowerCase()) ||
        session.packageName.toLowerCase().includes(sessionSearch.toLowerCase());
      const matchesStatus = sessionStatus === "ALL" || session.status === sessionStatus;
      const matchesPackage = sessionPackage === "ALL" || session.packageName === sessionPackage;
      const matchesDate = !sessionDate || session.startedAt.startsWith(sessionDate);
      return matchesSearch && matchesStatus && matchesPackage && matchesDate;
    });
  }, [sessionDate, sessionPackage, sessionSearch, sessionStatus, sessions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesStatus = transactionStatus === "ALL" || transaction.status === transactionStatus;
      const matchesSearch =
        transaction.phone.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        transaction.mpesaId.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        transaction.packageName.toLowerCase().includes(transactionSearch.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [transactionSearch, transactionStatus, transactions]);

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) =>
      [tenant.admin, tenant.business, tenant.location, tenant.status]
        .join(" ")
        .toLowerCase()
        .includes(tenantSearch.toLowerCase()),
    );
  }, [tenantSearch, tenants]);

  async function savePackage() {
    const nextPackage: PackageItem = {
      id: editingPackageId ?? `pkg-${Date.now()}`,
      name: packageDraft.name.trim() || "Custom Pass",
      speed: Number(packageDraft.speed) || 1,
      duration: Number(packageDraft.duration) || 60,
      price: Number(packageDraft.price) || 10,
      active: packageDraft.active,
    };

    if (apiConnected && auth) {
      try {
        const sortOrder = editingPackageId
          ? Math.max(
              0,
              packages.findIndex((item) => item.id === editingPackageId),
            )
          : packages.length;
        const savedPackage = await savePackageApi(role, nextPackage, sortOrder, editingPackageId);
        setPackages((current) =>
          editingPackageId
            ? current.map((item) => (item.id === editingPackageId ? savedPackage : item))
            : [...current, savedPackage],
        );
        setEditingPackageId(null);
        setPackageDraft(emptyPackageDraft);
        setToast(`${savedPackage.name} package saved to backend.`);
        return;
      } catch (error) {
        setToast(errorMessage(error, "Package API sync failed. Saved locally for now."));
      }
    }

    setPackages((current) =>
      editingPackageId
        ? current.map((item) => (item.id === editingPackageId ? nextPackage : item))
        : [...current, nextPackage],
    );
    setEditingPackageId(null);
    setPackageDraft(emptyPackageDraft);
    setToast(`${nextPackage.name} package saved for captive portal display.`);
  }

  function editPackage(item: PackageItem) {
    setEditingPackageId(item.id);
    setPackageDraft({
      name: item.name,
      speed: String(item.speed),
      duration: String(item.duration),
      price: String(item.price),
      active: item.active,
    });
  }

  async function movePackage(id: string, direction: -1 | 1) {
    const index = packages.findIndex((item) => item.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= packages.length) return;

    const reordered = [...packages];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    setPackages(reordered);

    if (apiConnected && auth && reordered) {
      try {
        const synced = await reorderPackagesApi(
          role,
          reordered.map((item) => item.id),
        );
        setPackages(synced);
        setToast("Package order synced to captive portal.");
      } catch (error) {
        setToast(errorMessage(error, "Package order changed locally. Backend reorder failed."));
      }
    }
  }

  async function removePackage(id: string) {
    if (apiConnected && auth) {
      try {
        await deletePackageApi(role, id);
        setPackages((current) => current.filter((pkg) => pkg.id !== id));
        setToast("Package hidden from backend portal list.");
        return;
      } catch (error) {
        setToast(errorMessage(error, "Package delete failed. Removed locally for now."));
      }
    }

    setPackages((current) => current.filter((pkg) => pkg.id !== id));
  }

  function updateSessionStatus(id: string, status: SessionItem["status"]) {
    setSessions((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  async function handleLogoFile(file?: File) {
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    if (apiConnected && auth) {
      try {
        const upload = await uploadTenantLogo(role, file);
        setLogoPreview(upload.logoUrl);
        setToast(upload.message);
        return;
      } catch (error) {
        setToast(errorMessage(error, `${file.name} preview loaded. Backend upload failed.`));
      }
      return;
    }
    setToast(`${file.name} preview loaded.`);
  }

  function addOutage(formData: FormData) {
    const notes = String(formData.get("notes") || "Manual downtime note");
    setOutages((current) => [
      {
        id: `o-${Date.now()}`,
        timestamp: "2026-06-17 11:42",
        duration: String(formData.get("duration") || "5m"),
        affectedUsers: Number(formData.get("affectedUsers") || 0),
        isp: String(formData.get("isp") || "Primary"),
        notes,
        resolved: false,
      },
      ...current,
    ]);
    setToast("Downtime event logged.");
  }

  async function addTenant() {
    const business = tenantDraft.business.trim() || "New Hotspot";
    if (apiConnected && auth) {
      try {
        const created = await createTenantApi(role, tenantDraft);
        setTenants((current) => [created, ...current]);
        setTenantDraft({ admin: "", business: "", location: "", plan: "KES 5,000/mo" });
        setToast(`${created.business} tenant created with a seeded admin login.`);
        return;
      } catch (error) {
        setToast(errorMessage(error, "Tenant API create failed. Added locally for now."));
      }
    }

    setTenants((current) => [
      {
        id: `tenant-${Date.now()}`,
        admin: tenantDraft.admin.trim() || "New Admin",
        business,
        location: tenantDraft.location.trim() || "Kenya",
        plan: tenantDraft.plan,
        revenue: 0,
        status: "ACTIVE",
        createdAt: "2026-06-17",
        lastActive: "now",
      },
      ...current,
    ]);
    setTenantDraft({ admin: "", business: "", location: "", plan: "KES 5,000/mo" });
    setToast(`${business} tenant created in frontend state.`);
  }

  async function toggleTenantStatus(tenant: Tenant) {
    if (apiConnected && auth) {
      try {
        const updated = await updateTenantStatusApi(role, tenant);
        setTenants((current) => current.map((item) => (item.id === tenant.id ? updated : item)));
        setToast(`${updated.business} status updated.`);
        return;
      } catch (error) {
        setToast(errorMessage(error, "Tenant status API update failed. Toggled locally for now."));
      }
    }

    setTenants((current) =>
      current.map((item) =>
        item.id === tenant.id ? { ...item, status: item.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" } : item,
      ),
    );
  }

  async function removeTenant(tenant: Tenant) {
    if (apiConnected && auth) {
      try {
        await deleteTenantApi(role, tenant.id);
        setTenants((current) => current.filter((item) => item.id !== tenant.id));
        setToast(`${tenant.business} tenant deleted.`);
        return;
      } catch (error) {
        setToast(errorMessage(error, "Tenant delete failed. Removed locally for now."));
      }
    }

    setTenants((current) => current.filter((item) => item.id !== tenant.id));
  }

  async function saveSettings() {
    setSettingsSaved(true);
    if (apiConnected && auth) {
      try {
        const updated = await updateTenantSettingsApi(role, tenantSettings, zeroRating);
        setTenantSettings(updated.settings);
        setZeroRating(updated.zeroRatingEnabled);
        if (updated.zeroRatingEnabled) {
          await syncZeroRatedIps(role);
        }
        setToast("Tenant settings saved to backend.");
        return;
      } catch (error) {
        setToast(errorMessage(error, "Settings API update failed. Kept local changes."));
      }
      return;
    }
    setToast("Settings saved locally.");
  }

  async function saveIspRules() {
    if (apiConnected && auth) {
      try {
        const updated = await updateIspConfigApi(role, ispConfig);
        setIspConfig(updated);
        setToast("Global ISP config saved to backend.");
        return;
      } catch (error) {
        setToast(errorMessage(error, "ISP config API update failed. Kept local changes."));
      }
      return;
    }
    setToast("Global ISP config saved locally.");
  }

  async function generateInvoice() {
    if (apiConnected && auth) {
      try {
        const invoice = await createInvoiceApi(role, invoiceDraft, tenants);
        setInvoices((current) => [invoice, ...current]);
        setToast(`${invoice.id} invoice generated.`);
        return;
      } catch (error) {
        setToast(errorMessage(error, "Invoice API create failed. Generated local draft."));
      }
    }

    setInvoices((current) => [
      {
        id: `INV-${1031 + current.length}`,
        tenant: invoiceDraft.tenant,
        amount: Number(invoiceDraft.amount),
        due: invoiceDraft.due,
        status: "DRAFT",
      },
      ...current,
    ]);
    setToast("Invoice draft generated.");
  }

  async function logout() {
    await logoutApi(role);
    router.replace(loginPath);
  }

  function renderClientSection() {
    switch (section) {
      case "users":
        return (
          <SectionGrid>
            <Panel title="Session filters" icon={SlidersHorizontal}>
              <div className="filter-grid">
                <SearchField value={sessionSearch} onChange={setSessionSearch} placeholder="Search phone or package" />
                <SelectField value={sessionStatus} onChange={setSessionStatus}>
                  <option value="ALL">All statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="EXPIRED">Expired</option>
                </SelectField>
                <SelectField value={sessionPackage} onChange={setSessionPackage}>
                  <option value="ALL">All packages</option>
                  {packages.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </SelectField>
                <input
                  className="admin-input"
                  type="date"
                  value={sessionDate}
                  onChange={(event) => setSessionDate(event.target.value)}
                />
              </div>
            </Panel>

            <Panel
              title="Sessions"
              icon={Users}
              action={
                <Button
                  icon={Download}
                  onClick={() => downloadCsv("sessions.csv", filteredSessions)}
                  label="Export CSV"
                />
              }
            >
              <ResponsiveTable
                headers={["Phone", "Package", "Start", "Expiry", "Data", "Status", "Actions"]}
                rows={filteredSessions.map((session) => [
                  session.phone,
                  session.packageName,
                  session.startedAt,
                  session.expiresAt,
                  session.dataUsed,
                  <StatusBadge key="status" status={session.status} />,
                  <div key="actions" className="table-actions">
                    <button onClick={() => updateSessionStatus(session.id, "ACTIVE")}>Restore</button>
                    <button onClick={() => updateSessionStatus(session.id, "PAUSED")}>Pause</button>
                    <button onClick={() => updateSessionStatus(session.id, "EXPIRED")}>Expire</button>
                  </div>,
                ])}
              />
            </Panel>
          </SectionGrid>
        );

      case "packages":
        return (
          <SectionGrid>
            <Panel title={editingPackageId ? "Edit package" : "Create package"} icon={Package}>
              <div className="form-grid">
                <TextInput
                  label="Name"
                  value={packageDraft.name}
                  onChange={(value) => setPackageDraft((draft) => ({ ...draft, name: value }))}
                  placeholder="Market Pass"
                />
                <TextInput
                  label="Speed Mbps"
                  value={packageDraft.speed}
                  onChange={(value) => setPackageDraft((draft) => ({ ...draft, speed: value }))}
                  type="number"
                />
                <TextInput
                  label="Duration minutes"
                  value={packageDraft.duration}
                  onChange={(value) => setPackageDraft((draft) => ({ ...draft, duration: value }))}
                  type="number"
                />
                <TextInput
                  label="Price KES"
                  value={packageDraft.price}
                  onChange={(value) => setPackageDraft((draft) => ({ ...draft, price: value }))}
                  type="number"
                />
              </div>
              <div className="form-footer">
                <Toggle
                  checked={packageDraft.active}
                  onChange={(active) => setPackageDraft((draft) => ({ ...draft, active }))}
                  label="Show on captive portal"
                />
                <Button icon={Save} onClick={savePackage} label={editingPackageId ? "Update package" : "Add package"} />
              </div>
            </Panel>

            <Panel title="Portal package order" icon={ArrowUp}>
              <div className="package-admin-grid">
                {packages.map((item, index) => (
                  <div className="package-admin-card" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {item.speed} Mbps · {item.duration} min · {formatKes(item.price)}
                      </span>
                    </div>
                    <StatusBadge status={item.active ? "ACTIVE" : "HIDDEN"} />
                    <div className="table-actions">
                      <button disabled={index === 0} onClick={() => movePackage(item.id, -1)}>
                        Up
                      </button>
                      <button disabled={index === packages.length - 1} onClick={() => movePackage(item.id, 1)}>
                        Down
                      </button>
                      <button onClick={() => editPackage(item)}>Edit</button>
                      <button onClick={() => removePackage(item.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </SectionGrid>
        );

      case "financials":
        return (
          <SectionGrid>
            <MetricStrip
              metrics={[
                { label: "Month revenue", value: formatKes(totalRevenue * 42), icon: CircleDollarSign },
                { label: "Pending reconciliation", value: formatKes(120), icon: Clock3 },
                { label: "Refunds", value: formatKes(20), icon: RefreshCw },
              ]}
            />
            <Panel title="Ledger filters" icon={SlidersHorizontal}>
              <div className="filter-grid">
                <SearchField value={transactionSearch} onChange={setTransactionSearch} placeholder="Search phone, ID, package" />
                <SelectField value={transactionStatus} onChange={setTransactionStatus}>
                  <option value="ALL">All statuses</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </SelectField>
                <Button
                  icon={Download}
                  onClick={() => downloadCsv("transactions.csv", filteredTransactions)}
                  label="Export CSV"
                />
              </div>
            </Panel>
            <Panel title="Transaction ledger" icon={Receipt}>
              <ResponsiveTable
                headers={["Phone", "Package", "Amount", "M-Pesa ID", "Timestamp", "Status", "Actions"]}
                rows={filteredTransactions.map((transaction) => [
                  transaction.phone,
                  transaction.packageName,
                  formatKes(transaction.amount),
                  transaction.mpesaId,
                  transaction.timestamp,
                  <StatusBadge key="status" status={transaction.status} />,
                  <button
                    key="refund"
                    className="inline-action"
                    disabled={transaction.status !== "PAID"}
                    onClick={() =>
                      setTransactions((current) =>
                        current.map((item) =>
                          item.id === transaction.id ? { ...item, status: "REFUNDED" } : item,
                        ),
                      )
                    }
                  >
                    Refund
                  </button>,
                ])}
              />
            </Panel>
          </SectionGrid>
        );

      case "network":
        return (
          <SectionGrid>
            <MetricStrip
              metrics={[
                { label: "Primary latency", value: `${networkStatus.latencyMs} ms`, icon: Gauge },
                { label: "Packet loss", value: `${networkStatus.packetLossPercent}%`, icon: Activity },
                { label: "Uptime", value: `${clientOverview.networkUptime.toFixed(2)}%`, icon: ShieldCheck },
              ]}
            />
            <Panel title="ISP health" icon={Network}>
              <div className="network-grid">
                <NetworkCard
                  name="Primary ISP"
                  latency={`${networkStatus.latencyMs} ms`}
                  packetLoss={`${networkStatus.packetLossPercent}%`}
                  status={networkStatus.failoverActive ? "Ready" : "Healthy"}
                />
                <NetworkCard
                  name="Backup ISP"
                  latency={`${Math.max(networkStatus.latencyMs + 16, networkStatus.latencyMs)} ms`}
                  packetLoss={`${networkStatus.packetLossPercent}%`}
                  status={networkStatus.failoverActive ? "Healthy" : "Ready"}
                />
              </div>
              <MiniBarChart values={uptimeSeries} label="Last 7 days uptime" />
              <div className="form-footer">
                <Toggle checked={autoFailover} onChange={setAutoFailover} label="Auto failover enabled" />
                <Button
                  icon={RefreshCw}
                  onClick={() => {
                    setOutages((current) => [
                      {
                        id: `o-${Date.now()}`,
                        timestamp: "2026-06-17 11:45",
                        duration: "test",
                        affectedUsers: 0,
                        isp: "Backup",
                        notes: "Manual failover test completed",
                        resolved: true,
                      },
                      ...current,
                    ]);
                    setToast("Failover test event added.");
                  }}
                  label="Test failover"
                />
              </div>
            </Panel>
            <Panel title="Failover event log" icon={History}>
              <ResponsiveTable
                headers={["Timestamp", "Reason", "Duration", "Auto-resolved"]}
                rows={outages.map((outage) => [
                  outage.timestamp,
                  outage.notes,
                  outage.duration,
                  outage.resolved ? "Yes" : "No",
                ])}
              />
            </Panel>
          </SectionGrid>
        );

      case "downtime":
        return (
          <SectionGrid>
            <Panel title="Log outage" icon={Plus}>
              <form
                className="form-grid"
                action={(formData) => {
                  addOutage(formData);
                }}
              >
                <label>
                  Duration
                  <input className="admin-input" name="duration" placeholder="8m" />
                </label>
                <label>
                  Affected users
                  <input className="admin-input" name="affectedUsers" type="number" placeholder="24" />
                </label>
                <label>
                  ISP in use
                  <select className="admin-input" name="isp" defaultValue="Primary">
                    <option>Primary</option>
                    <option>Backup</option>
                  </select>
                </label>
                <label>
                  Notes
                  <input className="admin-input" name="notes" placeholder="Short outage note" />
                </label>
                <button className="admin-primary-button" type="submit">
                  <Plus size={16} /> Add outage
                </button>
              </form>
            </Panel>
            <Panel title="Downtime log" icon={History}>
              <ResponsiveTable
                headers={["Timestamp", "Duration", "Affected", "ISP", "Notes", "Resolved"]}
                rows={outages.map((outage) => [
                  outage.timestamp,
                  outage.duration,
                  outage.affectedUsers,
                  outage.isp,
                  outage.notes,
                  <Toggle
                    key="resolved"
                    compact
                    checked={outage.resolved}
                    onChange={(resolved) =>
                      setOutages((current) =>
                        current.map((item) => (item.id === outage.id ? { ...item, resolved } : item)),
                      )
                    }
                    label="Resolved"
                  />,
                ])}
              />
            </Panel>
          </SectionGrid>
        );

      case "settings":
        return (
          <SectionGrid>
            <Panel title="Branding" icon={UploadCloud}>
              <div
                className="drop-zone"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event: DragEvent<HTMLDivElement>) => {
                  event.preventDefault();
                  handleLogoFile(event.dataTransfer.files[0]);
                }}
              >
                <div className="logo-preview">
                  {logoPreview ? <span style={{ backgroundImage: `url(${logoPreview})` }} /> : "TB"}
                </div>
                <div>
                  <strong>Upload tenant logo</strong>
                  <p>Drag an image here or choose a file for live preview.</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => handleLogoFile(event.target.files?.[0])}
                  />
                </div>
              </div>
            </Panel>
            <Panel title="Hotspot settings" icon={Settings2}>
              <div className="form-grid">
                <TextInput
                  label="Location name"
                  value={tenantSettings.location}
                  onChange={(location) => setTenantSettings((settings) => ({ ...settings, location }))}
                />
                <TextInput
                  label="M-Pesa till/paybill"
                  value={tenantSettings.mpesa}
                  onChange={(mpesa) => setTenantSettings((settings) => ({ ...settings, mpesa }))}
                />
                <TextInput
                  label="Support WhatsApp"
                  value={tenantSettings.support}
                  onChange={(support) => setTenantSettings((settings) => ({ ...settings, support }))}
                />
                <TextInput
                  label="Receipt sender name"
                  value={tenantSettings.receiptName}
                  onChange={(receiptName) => setTenantSettings((settings) => ({ ...settings, receiptName }))}
                />
              </div>
              <div className="settings-list">
                <Toggle checked={zeroRating} onChange={setZeroRating} label="WhatsApp text zero-rating" />
                <Toggle checked onChange={() => undefined} label="Send payment receipts by SMS" />
                <Toggle checked onChange={() => undefined} label="Email failover alerts" />
              </div>
              <div className="form-footer">
                <Button icon={Save} onClick={saveSettings} label="Save settings" />
                {settingsSaved && <span className="save-note">{apiConnected ? "Synced" : "Saved locally"}</span>}
              </div>
            </Panel>
          </SectionGrid>
        );

      default:
        return (
          <SectionGrid>
            <MetricStrip
              metrics={[
                { label: "Active users", value: String(activeUsers), icon: Wifi },
                {
                  label: "Today revenue",
                  value: formatKes(apiConnected ? clientOverview.todayRevenue : totalRevenue),
                  icon: CircleDollarSign,
                },
                {
                  label: "Sessions today",
                  value: String(apiConnected ? clientOverview.sessionsToday : sessions.length),
                  icon: Users,
                },
                { label: "Zero-rate conversions", value: String(clientOverview.zeroRatingConversions), icon: MessageCircle },
              ]}
            />
            <Panel title="Revenue over 30 days" icon={BarChart3}>
              <MiniBarChart values={clientRevenueBars} label="Revenue trend" />
            </Panel>
            <Panel title="Sessions by hour" icon={Activity}>
              <MiniBarChart values={clientSessionsByHour} label="Hourly sessions" />
            </Panel>
            <Panel title="Zero-rating funnel" icon={MessageCircle}>
              <div className="funnel-line">
                <span style={{ width: "40%" }} />
              </div>
              <div className="insight-grid">
                <Insight label="Free users" value="47" />
                <Insight label="Paid users" value="19" />
                <Insight label="Revenue" value="KES 1,140" />
              </div>
            </Panel>
            <Panel title="Live active sessions" icon={Wifi}>
              <ResponsiveTable
                headers={["Phone", "Package", "Data", "Status"]}
                rows={sessions.slice(0, 4).map((session) => [
                  session.phone,
                  session.packageName,
                  session.dataUsed,
                  <StatusBadge key="status" status={session.status} />,
                ])}
              />
            </Panel>
          </SectionGrid>
        );
    }
  }

  function renderSuperSection() {
    switch (section) {
      case "tenants":
        return (
          <SectionGrid>
            <Panel title="Create client admin" icon={Plus}>
              <div className="form-grid">
                <TextInput
                  label="Admin name"
                  value={tenantDraft.admin}
                  onChange={(admin) => setTenantDraft((draft) => ({ ...draft, admin }))}
                  placeholder="Jane Mwangi"
                />
                <TextInput
                  label="Business"
                  value={tenantDraft.business}
                  onChange={(business) => setTenantDraft((draft) => ({ ...draft, business }))}
                  placeholder="Market WiFi"
                />
                <TextInput
                  label="Location"
                  value={tenantDraft.location}
                  onChange={(location) => setTenantDraft((draft) => ({ ...draft, location }))}
                  placeholder="Embu"
                />
                <label>
                  Plan
                  <select
                    className="admin-input"
                    value={tenantDraft.plan}
                    onChange={(event) => setTenantDraft((draft) => ({ ...draft, plan: event.target.value }))}
                  >
                    <option>KES 5,000/mo</option>
                    <option>KES 7,500/mo</option>
                    <option>Revenue Share</option>
                  </select>
                </label>
              </div>
              <Button icon={Plus} onClick={addTenant} label="Create tenant" />
            </Panel>
            <Panel title="Tenant management" icon={Building2}>
              <div className="filter-grid">
                <SearchField value={tenantSearch} onChange={setTenantSearch} placeholder="Search tenants" />
              </div>
              <ResponsiveTable
                headers={["Admin", "Business", "Location", "Plan", "Revenue", "Status", "Actions"]}
                rows={filteredTenants.map((tenant) => [
                  tenant.admin,
                  tenant.business,
                  tenant.location,
                  tenant.plan,
                  formatKes(tenant.revenue),
                  <StatusBadge key="status" status={tenant.status} />,
                  <div key="actions" className="table-actions">
                    <button onClick={() => toggleTenantStatus(tenant)}>Toggle</button>
                    <button onClick={() => setToast(`Password reset link prepared for ${tenant.admin}.`)}>
                      Reset
                    </button>
                    <button onClick={() => removeTenant(tenant)}>Delete</button>
                  </div>,
                ])}
              />
            </Panel>
          </SectionGrid>
        );

      case "analytics":
        return (
          <SectionGrid>
            <MetricStrip
              metrics={[
                { label: "Platform revenue", value: formatKes(platformOverview.totalRevenue), icon: Landmark },
                { label: "Active sessions", value: platformOverview.totalActiveSessions.toLocaleString("en-KE"), icon: Wifi },
                { label: "Regions", value: String(Math.max(1, platformOverview.sessionsByRegion.length)), icon: Globe2 },
              ]}
            />
            <Panel title="Revenue by tenant" icon={BarChart3}>
              <MiniBarChart values={platformRevenueBars} label="Tenant revenue" />
            </Panel>
            <Panel title="Sessions by region" icon={Globe2}>
              <ResponsiveTable
                headers={["Region", "Sessions", "Revenue", "Conversion"]}
                rows={platformOverview.sessionsByRegion.map((region) => [
                  region.region,
                  region.sessions.toLocaleString("en-KE"),
                  region.revenue ? formatKes(region.revenue) : "N/A",
                  region.conversion,
                ])}
              />
            </Panel>
          </SectionGrid>
        );

      case "isp-config":
        return (
          <SectionGrid>
            <Panel title="Global failover rules" icon={RadioTower}>
              <div className="form-grid">
                <TextInput
                  label="Latency threshold ms"
                  value={ispConfig.threshold}
                  onChange={(threshold) => setIspConfig((config) => ({ ...config, threshold }))}
                  type="number"
                />
                <TextInput
                  label="Consecutive checks"
                  value={ispConfig.checks}
                  onChange={(checks) => setIspConfig((config) => ({ ...config, checks }))}
                  type="number"
                />
                <TextInput
                  label="Primary route label"
                  value={ispConfig.primary}
                  onChange={(primary) => setIspConfig((config) => ({ ...config, primary }))}
                />
                <TextInput
                  label="Backup route label"
                  value={ispConfig.backup}
                  onChange={(backup) => setIspConfig((config) => ({ ...config, backup }))}
                />
                <TextInput
                  label="Notification webhook"
                  value={ispConfig.webhook}
                  onChange={(webhook) => setIspConfig((config) => ({ ...config, webhook }))}
                />
              </div>
              <div className="form-footer">
                <Button icon={Save} onClick={saveIspRules} label="Save rules" />
                <Button icon={Send} onClick={() => setToast("Test notification queued in frontend state.")} label="Test webhook" secondary />
              </div>
            </Panel>
            <Panel title="Priority order" icon={ArrowDown}>
              <div className="priority-list">
                <div><span>1</span>{ispConfig.primary}</div>
                <div><span>2</span>{ispConfig.backup}</div>
              </div>
            </Panel>
          </SectionGrid>
        );

      case "error-logs":
        return (
          <SectionGrid>
            <Panel title="Platform error stream" icon={AlertTriangle}>
              <ResponsiveTable
                headers={["Tenant", "Source", "Message", "Severity", "Timestamp", "Resolved"]}
                rows={errors.map((error) => [
                  error.tenant,
                  error.source,
                  error.message,
                  <StatusBadge key="severity" status={error.severity} />,
                  error.timestamp,
                  <Toggle
                    key="resolved"
                    compact
                    checked={error.resolved}
                    onChange={(resolved) =>
                      setErrors((current) =>
                        current.map((item) => (item.id === error.id ? { ...item, resolved } : item)),
                      )
                    }
                    label="Resolved"
                  />,
                ])}
              />
            </Panel>
          </SectionGrid>
        );

      case "billing":
        return (
          <SectionGrid>
            <Panel title="Generate invoice" icon={FileText}>
              <div className="form-grid">
                <label>
                  Tenant
                  <select
                    className="admin-input"
                    value={invoiceDraft.tenant}
                    onChange={(event) => setInvoiceDraft((draft) => ({ ...draft, tenant: event.target.value }))}
                  >
                    {tenants.map((tenant) => (
                      <option key={tenant.id}>{tenant.business}</option>
                    ))}
                  </select>
                </label>
                <TextInput
                  label="Amount KES"
                  value={invoiceDraft.amount}
                  onChange={(amount) => setInvoiceDraft((draft) => ({ ...draft, amount }))}
                  type="number"
                />
                <TextInput
                  label="Due date"
                  value={invoiceDraft.due}
                  onChange={(due) => setInvoiceDraft((draft) => ({ ...draft, due }))}
                  type="date"
                />
              </div>
              <Button icon={Plus} onClick={generateInvoice} label="Generate invoice" />
            </Panel>
            <Panel title="SaaS billing" icon={CreditCard}>
              <ResponsiveTable
                headers={["Invoice", "Tenant", "Amount", "Due", "Status", "Actions"]}
                rows={invoices.map((invoice) => [
                  invoice.id,
                  invoice.tenant,
                  formatKes(invoice.amount),
                  invoice.due,
                  <StatusBadge key="status" status={invoice.status} />,
                  <div key="actions" className="table-actions">
                    <button
                      onClick={() =>
                        setInvoices((current) =>
                          current.map((item) => (item.id === invoice.id ? { ...item, status: "SENT" } : item)),
                        )
                      }
                    >
                      Send
                    </button>
                    <button
                      onClick={() =>
                        setInvoices((current) =>
                          current.map((item) => (item.id === invoice.id ? { ...item, status: "PAID" } : item)),
                        )
                      }
                    >
                      Mark paid
                    </button>
                  </div>,
                ])}
              />
            </Panel>
          </SectionGrid>
        );

      default:
        return (
          <SectionGrid>
            <MetricStrip
              metrics={[
                { label: "Platform revenue", value: formatKes(platformOverview.totalRevenue), icon: Landmark },
                { label: "Active tenants", value: String(tenants.filter((tenant) => tenant.status === "ACTIVE").length), icon: Building2 },
                { label: "Active sessions", value: platformOverview.totalActiveSessions.toLocaleString("en-KE"), icon: Wifi },
                { label: "Platform uptime", value: `${platformOverview.platformUptime.toFixed(2)}%`, icon: ShieldCheck },
              ]}
            />
            <Panel title="Revenue by tenant" icon={BarChart3}>
              <MiniBarChart values={platformRevenueBars} label="Revenue by tenant" />
            </Panel>
            <Panel title="Tenant health" icon={Building2}>
              <ResponsiveTable
                headers={["Business", "Location", "Revenue", "Status", "Last active"]}
                rows={tenants.map((tenant) => [
                  tenant.business,
                  tenant.location,
                  formatKes(tenant.revenue),
                  <StatusBadge key="status" status={tenant.status} />,
                  tenant.lastActive,
                ])}
              />
            </Panel>
            <Panel title="Recent platform errors" icon={AlertTriangle}>
              <ResponsiveTable
                headers={["Tenant", "Source", "Severity", "Resolved"]}
                rows={errors.map((error) => [
                  error.tenant,
                  error.source,
                  <StatusBadge key="severity" status={error.severity} />,
                  error.resolved ? "Yes" : "No",
                ])}
              />
            </Panel>
          </SectionGrid>
        );
    }
  }

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-back" href="/">
          <ArrowLeft size={16} />
          Captive portal
        </Link>
        <div className="dashboard-brand">
          <div className="brand-mark h-11 w-11">TB</div>
          <div>
            <strong>{role === "client" ? "Client Admin" : "Super Admin"}</strong>
            <span>{role === "client" ? "Karurina Market" : "Platform Owner"}</span>
          </div>
        </div>
        <nav className="dashboard-nav" aria-label={`${role} navigation`}>
          {navItems.map((item) => (
            <Link key={item.id} className={cx("dashboard-nav-item", activeNav.id === item.id && "is-active")} href={item.href}>
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p>{role === "client" ? "Tenant workspace" : "Global workspace"}</p>
            <h1>{activeNav.label}</h1>
          </div>
          <div className="dashboard-actions">
            <span className={cx("sync-pill", !apiConnected && !loadingWorkspace && "is-muted")}>
              {loadingWorkspace ? <RefreshCw size={15} /> : <CheckCircle2 size={15} />}
              {loadingWorkspace ? "Syncing backend" : apiConnected ? "Backend connected" : "Demo fallback"}
            </span>
            <Link className="admin-secondary-button" href={role === "client" ? "/super-admin" : "/admin"}>
              {role === "client" ? "Open Super" : "Open Client"}
            </Link>
            <button className="admin-secondary-button" type="button" onClick={logout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <div className="toast-line">
          <Bell size={16} />
          {toast}
          <button onClick={() => setToast(apiConnected ? "Backend connected. Dashboard data is synced." : "Demo fallback active.")}>
            <X size={15} />
          </button>
        </div>

        {role === "client" ? renderClientSection() : renderSuperSection()}
      </section>
    </main>
  );
}

function SectionGrid({ children }: { children: React.ReactNode }) {
  return <div className="admin-section-grid">{children}</div>;
}

function Panel({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <Icon size={18} />
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function MetricStrip({
  metrics,
}: {
  metrics: Array<{ label: string; value: string; icon: LucideIcon }>;
}) {
  return (
    <div className="admin-metric-strip">
      {metrics.map((metric) => (
        <div className="admin-metric" key={metric.label}>
          <metric.icon size={18} />
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
        </div>
      ))}
    </div>
  );
}

function Button({
  icon: Icon,
  label,
  onClick,
  secondary,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  secondary?: boolean;
}) {
  return (
    <button type="button" className={secondary ? "admin-secondary-button" : "admin-primary-button"} onClick={onClick}>
      <Icon size={16} />
      {label}
    </button>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label>
      {label}
      <input
        className="admin-input"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="search-field">
      <Search size={16} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function SelectField({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select className="admin-input" value={value} onChange={(event) => onChange(event.target.value)}>
      {children}
    </select>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  compact,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  compact?: boolean;
}) {
  return (
    <label className={cx("toggle-row", compact && "is-compact")}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span />
      {!compact && <strong>{label}</strong>}
    </label>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className={cx("admin-status", statusClass(status))}>{status}</span>;
}

function ResponsiveTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<Array<React.ReactNode>>;
}) {
  return (
    <div className="table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`cell-${rowIndex}-${cellIndex}`} data-label={headers[cellIndex]}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MiniBarChart({ values, label }: { values: number[]; label: string }) {
  const max = Math.max(...values, 1);
  return (
    <div>
      <p className="chart-label">{label}</p>
      <div className="admin-bar-chart">
        {values.map((value, index) => (
          <span key={`${value}-${index}`} style={{ height: `${Math.max(12, (value / max) * 100)}%` }} />
        ))}
      </div>
    </div>
  );
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div className="insight-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function NetworkCard({
  name,
  latency,
  packetLoss,
  status,
}: {
  name: string;
  latency: string;
  packetLoss: string;
  status: string;
}) {
  return (
    <div className="network-card">
      <Router size={20} />
      <div>
        <strong>{name}</strong>
        <span>
          {latency} · {packetLoss} loss
        </span>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}
