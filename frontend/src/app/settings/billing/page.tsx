"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface SubData {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
}

export default function BillingPage() {
  const [sub, setSub] = useState<SubData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/billing/subscription")
      .then((r) => (r.ok ? r.json() : null))
      .then(setSub)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function openPortal() {
    const res = await fetch("/api/billing/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnUrl: window.location.href }),
    });
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <main
      className="min-h-screen px-4 py-12 max-w-2xl mx-auto"
      style={{ position: "relative", zIndex: 1 }}
    >
      <Link
        href="/boards"
        className="text-sm mb-6 inline-block"
        style={{ color: "var(--accent)" }}
      >
        Back to boards
      </Link>
      <h1 className="heading-serif mb-6" style={{ fontSize: 32 }}>Billing</h1>
      {loading ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading...</p>
      ) : sub ? (
        <div className="p-6" style={{ border: "1px solid var(--border-color)" }}>
          <p className="text-section-title mb-1">Current plan</p>
          <p className="heading-serif capitalize mb-4" style={{ fontSize: 28 }}>{sub.plan}</p>
          {sub.currentPeriodEnd && (
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
              Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
          {sub.plan === "pro" ? (
            <button onClick={openPortal} className="btn btn-secondary">
              Manage subscription
            </button>
          ) : (
            <Link href="/pricing" className="btn btn-primary">
              Upgrade to Pro
            </Link>
          )}
        </div>
      ) : (
        <div className="p-6" style={{ border: "1px solid var(--border-color)" }}>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>You are on the Free plan.</p>
          <Link href="/pricing" className="btn btn-primary">
            Upgrade to Pro
          </Link>
        </div>
      )}
    </main>
  );
}
