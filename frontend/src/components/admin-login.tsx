"use client";

import { AlertCircle, LockKeyhole, LogIn, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { login, type AdminRole } from "@/lib/api-client";

const defaults: Record<AdminRole, { email: string; password: string; title: string; label: string; target: string }> = {
  client: {
    email: "admin@karurina.local",
    password: "ChangeMe123!",
    title: "Client Admin",
    label: "Karurina Market",
    target: "/admin",
  },
  super: {
    email: "owner@tbilling.local",
    password: "ChangeMe123!",
    title: "Super Admin",
    label: "Platform Owner",
    target: "/super-admin",
  },
};

export function AdminLogin({ role }: { role: AdminRole }) {
  const router = useRouter();
  const config = defaults[role];
  const [email, setEmail] = useState(config.email);
  const [password, setPassword] = useState(config.password);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(role, email, password);
      router.replace(config.target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-labelledby="login-title">
        <div className="login-brand">
          <div className="brand-mark h-12 w-12">TB</div>
          <div>
            <span>TBilling System</span>
            <strong>{config.title}</strong>
          </div>
        </div>

        <form className="login-panel" onSubmit={handleSubmit}>
          <div className="login-panel-head">
            <ShieldCheck size={20} />
            <div>
              <p>{config.label}</p>
              <h1 id="login-title">Sign in</h1>
            </div>
          </div>

          <label>
            Email
            <span className="login-input">
              <Mail size={17} />
              <input value={email} type="email" autoComplete="email" onChange={(event) => setEmail(event.target.value)} />
            </span>
          </label>

          <label>
            Password
            <span className="login-input">
              <LockKeyhole size={17} />
              <input
                value={password}
                type="password"
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
              />
            </span>
          </label>

          {error && (
            <div className="login-error" role="alert">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button className="admin-primary-button login-submit" type="submit" disabled={loading}>
            <LogIn size={17} />
            {loading ? "Signing in" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
