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
    <main className="min-h-screen px-4 py-12 max-w-2xl mx-auto">
      <Link href="/boards" className="text-sm mb-6 inline-block" style={{ color: "#209dd7" }}>
        Back to boards
      </Link>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#032147" }}>Billing</h1>
      {loading ? (
        <p className="text-sm" style={{ color: "#888888" }}>Loading...</p>
      ) : sub ? (
        <div className="border rounded-xl p-6">
          <p className="text-sm font-semibold mb-1" style={{ color: "#888888" }}>Current plan</p>
          <p className="text-2xl font-bold capitalize mb-4" style={{ color: "#032147" }}>{sub.plan}</p>
          {sub.currentPeriodEnd && (
            <p className="text-sm mb-4" style={{ color: "#888888" }}>
              Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
          {sub.plan === "pro" ? (
            <button
              onClick={openPortal}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors"
              style={{ color: "#032147" }}
            >
              Manage subscription
            </button>
          ) : (
            <Link
              href="/pricing"
              className="inline-block px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "#753991" }}
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      ) : (
        <div className="border rounded-xl p-6">
          <p className="text-sm mb-4" style={{ color: "#888888" }}>You are on the Free plan.</p>
          <Link
            href="/pricing"
            className="inline-block px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: "#753991" }}
          >
            Upgrade to Pro
          </Link>
        </div>
      )}
    </main>
  );
}
