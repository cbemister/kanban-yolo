import Link from "next/link";

export default function PricingPage() {
  const proMonthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ?? "";
  const proYearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID ?? "";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16" style={{ background: "#032147" }}>
      <h1 className="text-3xl font-bold text-white mb-2">Simple, transparent pricing</h1>
      <p className="text-white/60 mb-12">Start free. Upgrade when your team grows.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Free */}
        <div className="bg-white rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-1" style={{ color: "#032147" }}>Free</h2>
          <p className="text-4xl font-bold mb-1" style={{ color: "#032147" }}>$0</p>
          <p className="text-sm mb-6" style={{ color: "#888888" }}>Forever free</p>
          <ul className="space-y-2 mb-8 text-sm" style={{ color: "#032147" }}>
            <li>3 boards</li>
            <li>2 members per board</li>
            <li>Labels, due dates, search</li>
            <li>Comments</li>
          </ul>
          <Link
            href="/boards"
            className="block w-full text-center py-2 rounded-lg font-medium border"
            style={{ borderColor: "#032147", color: "#032147" }}
          >
            Get started
          </Link>
        </div>

        {/* Pro */}
        <div className="rounded-2xl p-8 text-white" style={{ background: "#753991" }}>
          <h2 className="text-xl font-bold mb-1">Pro</h2>
          <p className="text-4xl font-bold mb-1">$12</p>
          <p className="text-sm mb-6 opacity-70">per user / month</p>
          <ul className="space-y-2 mb-8 text-sm">
            <li>Unlimited boards</li>
            <li>Unlimited members</li>
            <li>File attachments (10MB)</li>
            <li>Advanced filtering &amp; saved filters</li>
            <li>Activity feed</li>
            <li>Priority support</li>
          </ul>
          <a
            href={`/api/billing/create-checkout?priceId=${proMonthlyPriceId}`}
            className="block w-full text-center py-2 rounded-lg font-medium bg-white transition-opacity hover:opacity-90"
            style={{ color: "#753991" }}
          >
            Upgrade to Pro
          </a>
        </div>
      </div>

      <Link href="/boards" className="mt-8 text-sm text-white/50 hover:text-white/80 transition-colors">
        Back to boards
      </Link>
    </main>
  );
}
