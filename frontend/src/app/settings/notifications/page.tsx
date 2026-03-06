import Link from "next/link";

export default function NotificationSettingsPage() {
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
      <h1 className="heading-serif mb-2" style={{ fontSize: 32 }}>Notification Preferences</h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
        You receive notifications when you are assigned to a card or a card you are assigned to is due tomorrow.
      </p>
      <div className="p-6 space-y-4" style={{ border: "1px solid var(--border-color)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Card assignments</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>When someone assigns you to a card</p>
          </div>
          <span
            className="label-chip"
            style={{ color: "var(--label-sage)", borderColor: "var(--label-sage)" }}
          >
            Enabled
          </span>
        </div>
        <div
          style={{ borderTop: "1px solid var(--border-light)" }}
        />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Due date reminders</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>The day before a card is due</p>
          </div>
          <span
            className="label-chip"
            style={{ color: "var(--label-sage)", borderColor: "var(--label-sage)" }}
          >
            Enabled
          </span>
        </div>
      </div>
    </main>
  );
}
