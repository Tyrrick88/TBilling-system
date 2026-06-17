"use client";

import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  Gauge,
  Globe2,
  HeartPulse,
  History,
  Landmark,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  MessageCircle,
  MousePointer2,
  Network,
  Phone,
  Receipt,
  RefreshCw,
  Router,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Plan = {
  id: string;
  name: string;
  speed: string;
  duration: string;
  price: string;
  detail: string;
  perks: string[];
  icon: LucideIcon;
  aura: string;
  cta: string;
};

type PaymentState = "idle" | "pushing" | "provisioning" | "connected";
type ViewMode = "portal" | "admin" | "super";

const plans: Plan[] = [
  {
    id: "free",
    name: "FREE",
    speed: "WhatsApp",
    duration: "Always on",
    price: "KES 0",
    detail: "Text messaging only, fair use active.",
    perks: ["No expiry", "Texts stay open", "Upgrade anytime"],
    icon: MessageCircle,
    aura: "from-emerald-300/40 via-teal-200/20 to-transparent",
    cta: "Active",
  },
  {
    id: "starter",
    name: "Starter",
    speed: "2 Mbps",
    duration: "1 hour",
    price: "KES 20",
    detail: "Fast browsing, social, and WhatsApp calls.",
    perks: ["STK Push", "Auto-provision", "Calls unlocked"],
    icon: Zap,
    aura: "from-amber-300/40 via-emerald-300/20 to-transparent",
    cta: "Pay now",
  },
  {
    id: "day",
    name: "Day Pass",
    speed: "5 Mbps",
    duration: "24 hours",
    price: "KES 80",
    detail: "Best value for work, classes, and streaming.",
    perks: ["Streaming ready", "Media exchange", "Priority RADIUS"],
    icon: Globe2,
    aura: "from-cyan-300/40 via-sky-300/20 to-transparent",
    cta: "Pay now",
  },
  {
    id: "max",
    name: "Stream Max",
    speed: "10 Mbps",
    duration: "6 hours",
    price: "KES 120",
    detail: "A high-speed burst for heavy download sessions.",
    perks: ["Low latency", "4K capable", "VIP queue"],
    icon: Gauge,
    aura: "from-lime-300/35 via-orange-300/20 to-transparent",
    cta: "Pay now",
  },
];

const dashboardMetrics = [
  {
    label: "Active users",
    value: "128",
    delta: "+18 live",
    icon: Wifi,
  },
  {
    label: "Today revenue",
    value: "KES 18.4k",
    delta: "+24% vs Tue",
    icon: TrendingUp,
  },
  {
    label: "Uptime",
    value: "99.94%",
    delta: "Primary link healthy",
    icon: HeartPulse,
  },
  {
    label: "Zero-rate CVR",
    value: "40%",
    delta: "47 free to 19 paid",
    icon: MessageCircle,
  },
];

const activityFeed = [
  {
    title: "STK paid",
    detail: "254 7XX 918 204 · Starter · KES 20",
    time: "12s",
    icon: Receipt,
  },
  {
    title: "RADIUS provisioned",
    detail: "2 Mbps profile pushed to MikroTik",
    time: "31s",
    icon: Router,
  },
  {
    title: "Zero-rate conversion",
    detail: "Free WhatsApp user upgraded to Day Pass",
    time: "1m",
    icon: MessageCircle,
  },
  {
    title: "Failover ready",
    detail: "Backup route tested at 42 ms",
    time: "4m",
    icon: Network,
  },
];

const superTenantRows = [
  ["Karurina Market", "KES 1.42m", "99.94%", "Healthy"],
  ["Kutus Stage", "KES 780k", "99.81%", "Watch"],
  ["Runyenjes Plaza", "KES 618k", "99.98%", "Healthy"],
];

const chartBars = [36, 42, 58, 52, 76, 64, 88, 82, 94, 71, 62, 79];
const sessionRows = [
  ["254 7XX 514 900", "Day Pass", "3.8 GB", "48m left"],
  ["254 7XX 020 118", "Starter", "180 MB", "37m left"],
  ["254 7XX 804 712", "Stream Max", "1.6 GB", "5h left"],
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const parentIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

const itemIn: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

export function WifiBillingExperience() {
  const [selectedPlan, setSelectedPlan] = useState(plans[1]);
  const [phone, setPhone] = useState("2547");
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [mode, setMode] = useState<ViewMode>("portal");
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const paymentCopy = useMemo(() => {
    if (selectedPlan.id === "free") {
      return {
        title: "WhatsApp text access is live",
        body: "No payment needed. Upgrade when you want calls, media, browsing, or streaming.",
      };
    }

    if (paymentState === "pushing") {
      return {
        title: "STK Push sent",
        body: `Approve ${selectedPlan.price} on ${phone || "your phone"} to continue.`,
      };
    }

    if (paymentState === "provisioning") {
      return {
        title: "Payment received",
        body: "Creating your RADIUS session and applying the speed profile.",
      };
    }

    if (paymentState === "connected") {
      return {
        title: "You are connected",
        body: `${selectedPlan.name} is active. Enjoy full browsing, calls, and streaming.`,
      };
    }

    return {
      title: "M-Pesa checkout",
      body: "Enter your phone number and approve the secure STK Push.",
    };
  }, [paymentState, phone, selectedPlan]);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  function runPaymentFlow() {
    if (selectedPlan.id === "free") {
      setPaymentState("idle");
      return;
    }

    timers.current.forEach((timer) => clearTimeout(timer));
    setPaymentState("pushing");
    timers.current = [
      setTimeout(() => setPaymentState("provisioning"), 1700),
      setTimeout(() => setPaymentState("connected"), 3400),
    ];
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06120f] text-white">
      <Image
        src="/assets/market-hotspot.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(3,9,8,0.96)_0%,rgba(5,18,15,0.74)_44%,rgba(3,8,8,0.9)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(41,217,150,0.18),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(80,203,230,0.17),transparent_30%),radial-gradient(circle_at_66%_83%,rgba(244,181,71,0.14),transparent_30%)]" />
      <SignalCanvas />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <TopBar activeMode={mode} onModeChange={setMode} />

        <section className="grid flex-1 grid-cols-1 gap-4 pb-8 pt-4 xl:grid-cols-[minmax(0,1fr)_430px]">
          <motion.section
            variants={parentIn}
            initial="hidden"
            animate="visible"
            className="portal-shell min-h-[720px] overflow-hidden"
          >
            <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.96fr)_minmax(340px,0.74fr)]">
              <div className="flex min-w-0 flex-col justify-between gap-7 p-5 sm:p-7 lg:p-8">
                <motion.div variants={itemIn} className="flex flex-wrap gap-2">
                  <StatusPill icon={MessageCircle} label="WhatsApp texts free" tone="green" pulsing />
                </motion.div>

                <motion.div variants={itemIn} className="max-w-3xl">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="brand-mark h-12 w-12">TB</div>
                    <div>
                      <p className="text-sm text-white/62">Tenant captive portal</p>
                      <div className="flex items-center gap-2 text-sm text-emerald-100">
                        <MapPin size={15} />
                        Karurina Market, Embu
                      </div>
                    </div>
                  </div>
                  <h1 className="max-w-4xl text-4xl font-semibold leading-[1.03] text-white md:text-6xl">
                    WhatsApp texts are free. Full internet unlocks in seconds.
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
                    Pick a package, confirm M-Pesa STK Push, and the hotspot provisions access
                    automatically through MikroTik RADIUS.
                  </p>
                </motion.div>

                <motion.div
                  variants={parentIn}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  {plans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      active={selectedPlan.id === plan.id}
                      onSelect={() => {
                        setSelectedPlan(plan);
                        setPaymentState("idle");
                      }}
                    />
                  ))}
                </motion.div>

                <motion.div variants={itemIn} className="fair-use-note">
                  <LockKeyhole size={16} />
                  Free WhatsApp access is for personal text messaging only and subject to fair use.
                </motion.div>
              </div>

              <motion.aside
                variants={itemIn}
                className="payment-console m-3 flex min-h-[520px] flex-col justify-between rounded-[8px] p-4 sm:m-4 sm:p-5"
              >
                <div>
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-white/58">Selected package</p>
                      <h2 className="mt-1 text-3xl font-semibold text-white">{selectedPlan.name}</h2>
                    </div>
                    <motion.div
                      key={selectedPlan.id}
                      initial={{ rotate: -8, scale: 0.88, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      className="package-orb"
                    >
                      <selectedPlan.icon size={24} />
                    </motion.div>
                  </div>

                  <div className="package-price-row">
                    <div>
                      <span>{selectedPlan.price}</span>
                      <p>{selectedPlan.duration}</p>
                    </div>
                    <div>
                      <span>{selectedPlan.speed}</span>
                      <p>Speed profile</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    {selectedPlan.perks.map((perk) => (
                      <div key={perk} className="mini-check">
                        <CheckCircle2 size={16} />
                        {perk}
                      </div>
                    ))}
                  </div>

                  <div className="session-preview">
                    <div>
                      <p>Session preview</p>
                      <strong>{selectedPlan.id === "free" ? "Always on" : "00:59:58"}</strong>
                      <span>{selectedPlan.id === "free" ? "Text lane open" : "Timer starts after STK"}</span>
                    </div>
                    <motion.div
                      key={selectedPlan.speed}
                      initial={{ scale: 0.84, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="speed-ring"
                    >
                      <span>{selectedPlan.speed.replace(" Mbps", "M")}</span>
                    </motion.div>
                  </div>
                </div>

                <div className="mt-7">
                  <label className="mb-2 block text-sm text-white/64" htmlFor="phone">
                    M-Pesa phone
                  </label>
                  <div className="phone-field">
                    <Phone size={18} />
                    <input
                      id="phone"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value.replace(/[^\d]/g, ""))}
                      inputMode="numeric"
                      placeholder="2547XXXXXXXX"
                      maxLength={12}
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${paymentState}-${selectedPlan.id}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.22 }}
                      className="payment-status"
                    >
                      <PaymentIcon state={paymentState} free={selectedPlan.id === "free"} />
                      <div>
                        <h3>{paymentCopy.title}</h3>
                        <p>{paymentCopy.body}</p>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <button
                    type="button"
                    className="primary-command mt-4"
                    onClick={runPaymentFlow}
                    disabled={paymentState === "pushing" || paymentState === "provisioning"}
                  >
                    {paymentState === "pushing" || paymentState === "provisioning" ? (
                      <LoaderCircle className="animate-spin" size={18} />
                    ) : (
                      <CreditCard size={18} />
                    )}
                    {selectedPlan.id === "free" ? "Keep WhatsApp free" : selectedPlan.cta}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.aside>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.18 }}
            className="operator-panel"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-white/58">Live command center</p>
                <h2 className="text-2xl font-semibold text-white">
                  {mode === "portal" && "Portal Flow"}
                  {mode === "admin" && "Client Admin"}
                  {mode === "super" && "Super Admin"}
                </h2>
              </div>
              <button className="icon-command" type="button" aria-label="Refresh network data">
                <RefreshCw size={18} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode === "portal" && <PortalPanel key="portal" />}
              {mode === "admin" && <ClientAdminPanel key="admin" />}
              {mode === "super" && <SuperAdminPanel key="super" />}
            </AnimatePresence>
          </motion.aside>
        </section>
      </div>
    </main>
  );
}

function TopBar({
  activeMode,
  onModeChange,
}: {
  activeMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}) {
  const modes: Array<{ id: ViewMode; label: string; icon: LucideIcon; href?: string }> = [
    { id: "portal", label: "Portal", icon: MousePointer2 },
    { id: "admin", label: "Admin", icon: BarChart3, href: "/admin" },
    { id: "super", label: "Super", icon: Landmark, href: "/super-admin" },
  ];

  return (
    <header className="top-bar">
      <div className="flex min-w-0 items-center gap-3">
        <div className="brand-mark h-11 w-11">TB</div>
        <div className="min-w-0">
          <p className="truncate text-sm text-white/58">TBIlling multi-tenant hotspot platform</p>
          <h2 className="truncate text-lg font-semibold text-white">
            M-Pesa WiFi access with free WhatsApp texts
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="segmented-control" role="tablist" aria-label="Dashboard view">
          {modes.map((mode) =>
            mode.href ? (
              <Link key={mode.id} href={mode.href} className="segmented-button" role="tab">
                <mode.icon size={16} />
                <span>{mode.label}</span>
              </Link>
            ) : (
              <button
                key={mode.id}
                type="button"
                role="tab"
                aria-selected={activeMode === mode.id}
                onClick={() => onModeChange(mode.id)}
                className={cn("segmented-button", activeMode === mode.id && "is-active")}
              >
                <mode.icon size={16} />
                <span>{mode.label}</span>
              </button>
            ),
          )}
        </div>
        <button className="icon-command hidden sm:inline-flex" type="button" aria-label="Open settings">
          <Settings2 size={18} />
        </button>
      </div>
    </header>
  );
}

function StatusPill({
  icon: Icon,
  label,
  tone,
  pulsing,
}: {
  icon: LucideIcon;
  label: string;
  tone: "green";
  pulsing?: boolean;
}) {
  return (
    <div className={cn("status-pill", `status-${tone}`)}>
      <span className={cn("status-dot", pulsing && "is-pulsing")} />
      <Icon size={16} />
      {label}
    </div>
  );
}

function PlanCard({
  plan,
  active,
  onSelect,
}: {
  plan: Plan;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      variants={itemIn}
      whileHover={{ y: -5, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onSelect}
      className={cn("plan-card text-left", active && "is-selected")}
    >
      <span className={cn("plan-aura bg-gradient-to-br", plan.aura)} />
      <span className="relative z-10 flex items-start justify-between gap-3">
        <span className="plan-icon">
          <plan.icon size={19} />
        </span>
        {active && <BadgeCheck className="text-emerald-200" size={19} />}
      </span>
      <span className="relative z-10 mt-5 block text-xl font-semibold text-white">{plan.name}</span>
      <span className="relative z-10 mt-2 block text-3xl font-semibold text-white">{plan.price}</span>
      <span className="relative z-10 mt-3 grid grid-cols-2 gap-2 text-sm text-white/62">
        <span>{plan.speed}</span>
        <span>{plan.duration}</span>
      </span>
      <span className="relative z-10 mt-4 block min-h-[44px] text-sm leading-6 text-white/68">
        {plan.detail}
      </span>
      <span className="relative z-10 mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-100">
        {plan.cta}
        <ChevronRight size={15} />
      </span>
    </motion.button>
  );
}

function PaymentIcon({ state, free }: { state: PaymentState; free: boolean }) {
  if (free || state === "connected") {
    return <CheckCircle2 className="text-emerald-200" size={20} />;
  }

  if (state === "pushing" || state === "provisioning") {
    return <LoaderCircle className="animate-spin text-cyan-100" size={20} />;
  }

  return <CreditCard className="text-amber-100" size={20} />;
}

function PortalPanel() {
  return (
    <PanelMotion>
      <div className="conversion-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/58">Conversion funnel</p>
            <h3 className="mt-1 text-2xl font-semibold text-white">47 free users today</h3>
          </div>
          <MessageCircle className="text-emerald-200" size={24} />
        </div>
        <div className="funnel-track mt-5">
          <motion.span
            initial={{ width: "18%" }}
            animate={{ width: "40%" }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <MetricChip label="Free" value="47" />
          <MetricChip label="Paid" value="19" />
          <MetricChip label="Revenue" value="KES 1,140" />
        </div>
      </div>

      <FlowStack />
    </PanelMotion>
  );
}

function ClientAdminPanel() {
  return (
    <PanelMotion>
      <div className="metric-grid">
        {dashboardMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="metric-card"
          >
            <metric.icon size={18} />
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
            <span>{metric.delta}</span>
          </motion.div>
        ))}
      </div>

      <div className="data-panel">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/58">Revenue over 12 hours</p>
            <h3 className="text-lg font-semibold text-white">KES 18,420</h3>
          </div>
          <Download size={18} className="text-white/55" />
        </div>
        <div className="bar-chart" aria-label="Revenue chart">
          {chartBars.map((height, index) => (
            <motion.span
              key={`${height}-${index}`}
              initial={{ height: 8 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.75, delay: index * 0.035, ease: "easeOut" }}
            />
          ))}
        </div>
      </div>

      <LiveActivity />
    </PanelMotion>
  );
}

function SuperAdminPanel() {
  return (
    <PanelMotion>
      <div className="global-health">
        <div>
          <p className="text-sm text-white/58">Platform revenue</p>
          <h3 className="mt-1 text-3xl font-semibold text-white">KES 2.81m</h3>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          className="radar-disc"
        >
          <span />
        </motion.div>
      </div>

      <div className="tenant-table">
        {superTenantRows.map(([name, revenue, uptime, status]) => (
          <div key={name} className="tenant-row">
            <div>
              <strong>{name}</strong>
              <span>{revenue}</span>
            </div>
            <div>
              <strong>{uptime}</strong>
              <span>{status}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="data-panel">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-white/58">Global ISP rule</p>
            <h3 className="text-lg font-semibold text-white">Fail over above 300 ms</h3>
          </div>
          <ShieldCheck className="text-emerald-200" size={22} />
        </div>
      </div>
    </PanelMotion>
  );
}

function PanelMotion({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
      transition={{ duration: 0.34, ease: "easeOut" }}
      className="space-y-4"
    >
      {children}
    </motion.div>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-chip">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FlowStack() {
  const steps = [
    { label: "Phone", value: "2547 entered", icon: Phone },
    { label: "Daraja", value: "STK Push", icon: CreditCard },
    { label: "RouterOS", value: "RADIUS user", icon: Router },
    { label: "Online", value: "Session timer", icon: Activity },
  ];

  return (
    <div className="data-panel">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/58">Payment pipeline</p>
          <h3 className="text-lg font-semibold text-white">M-Pesa to MikroTik</h3>
        </div>
        <Sparkles size={18} className="text-amber-100" />
      </div>
      <div className="flow-stack">
        {steps.map((step, index) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="flow-step"
          >
            <step.icon size={17} />
            <div>
              <strong>{step.label}</strong>
              <span>{step.value}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function LiveActivity() {
  return (
    <div className="data-panel">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/58">Live event stream</p>
          <h3 className="text-lg font-semibold text-white">Active sessions</h3>
        </div>
        <History size={18} className="text-white/55" />
      </div>

      <div className="space-y-3">
        {activityFeed.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className="feed-row"
          >
            <span className="feed-icon">
              <item.icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <time>{item.time}</time>
          </motion.div>
        ))}
      </div>

      <div className="session-list mt-4">
        {sessionRows.map(([phone, plan, used, left]) => (
          <div key={`${phone}-${plan}`} className="session-row">
            <div>
              <strong>{phone}</strong>
              <span>{plan}</span>
            </div>
            <div>
              <strong>{used}</strong>
              <span>{left}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SignalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduceMotion) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let width = 0;
    let height = 0;
    let frame = 0;

    const nodes = Array.from({ length: 24 }, (_, index) => ({
      x: (index * 137.5) % 100,
      y: 18 + ((index * 29) % 70),
      size: 1.2 + (index % 4) * 0.45,
      phase: index * 0.72,
    }));

    function resize() {
      if (!canvas || !context) {
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(time: number) {
      if (!context) {
        return;
      }

      context.clearRect(0, 0, width, height);

      nodes.forEach((node, index) => {
        const x = (node.x / 100) * width + Math.sin(time / 1600 + node.phase) * 18;
        const y = (node.y / 100) * height + Math.cos(time / 1900 + node.phase) * 14;
        const pulse = (Math.sin(time / 500 + node.phase) + 1) / 2;

        context.beginPath();
        context.fillStyle = `rgba(96, 255, 202, ${0.18 + pulse * 0.38})`;
        context.arc(x, y, node.size + pulse * 1.9, 0, Math.PI * 2);
        context.fill();

        if (index % 3 === 0) {
          const next = nodes[(index + 5) % nodes.length];
          const nx = (next.x / 100) * width;
          const ny = (next.y / 100) * height;
          const gradient = context.createLinearGradient(x, y, nx, ny);
          gradient.addColorStop(0, "rgba(76, 255, 199, 0)");
          gradient.addColorStop(0.5, "rgba(76, 255, 199, 0.22)");
          gradient.addColorStop(1, "rgba(255, 190, 92, 0)");
          context.strokeStyle = gradient;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(x, y);
          context.quadraticCurveTo(width * 0.52, height * 0.18, nx, ny);
          context.stroke();
        }
      });

      frame = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, [reduceMotion]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[1] h-full w-full" />;
}
