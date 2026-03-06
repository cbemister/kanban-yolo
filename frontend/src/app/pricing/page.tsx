import Link from "next/link";

export default function PricingPage() {
  const proMonthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ?? "";

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ position: "relative", zIndex: 1 }}
    >
      <h1
        className="heading-serif mb-2"
        style={{ fontSize: "clamp(32px, 5vw, 48px)", letterSpacing: "-0.03em" }}
      >
        Simple, transparent pricing
      </h1>
      <p className="mb-4" style={{ color: "var(--text-muted)", fontSize: 14 }}>
        Start free. Upgrade when your team grows.
      </p>
      <hr className="title-rule" style={{ marginBottom: 48 }} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Free */}
        <div
          className="p-8"
          style={{
            border: "1px solid var(--border-color)",
            background: "var(--bg-card)",
          }}
        >
          <h2 className="heading-serif mb-1" style={{ fontSize: 24 }}>Free</h2>
          <p className="heading-serif mb-1" style={{ fontSize: 40 }}>$0</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Forever free</p>
          <ul className="space-y-2 mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>
            <li>3 boards</li>
            <li>2 members per board</li>
            <li>Labels, due dates, search</li>
            <li>Comments</li>
          </ul>
          <Link href="/boards" className="btn btn-secondary w-full text-center block">
            Get started
          </Link>
        </div>

        {/* Pro */}
        <div
          className="editorial-card-urgent p-8"
          style={{
            border: "2px solid var(--accent)",
            background: "var(--bg-card-hover)",
            borderLeft: "4px solid var(--accent)",
          }}
        >
          <h2 className="heading-serif mb-1" style={{ fontSize: 24 }}>Pro</h2>
          <p className="heading-serif mb-1" style={{ fontSize: 40, color: "var(--accent)" }}>$12</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>per user / month</p>
          <ul className="space-y-2 mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>
            <li>Unlimited boards</li>
            <li>Unlimited members</li>
            <li>File attachments (10MB)</li>
            <li>Advanced filtering &amp; saved filters</li>
            <li>Activity feed</li>
            <li>Priority support</li>
          </ul>
          <a
            href={`/api/billing/create-checkout?priceId=${proMonthlyPriceId}`}
            className="btn btn-primary w-full text-center block"
          >
            Upgrade to Pro
          </a>
        </div>
      </div>

      <Link
        href="/boards"
        className="mt-8 text-sm transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        Back to boards
      </Link>
    </main>
  );
}
