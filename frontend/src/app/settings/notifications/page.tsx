import Link from "next/link";

export default function NotificationSettingsPage() {
  return (
    <main className="min-h-screen px-4 py-12 max-w-2xl mx-auto">
      <Link href="/boards" className="text-sm mb-6 inline-block" style={{ color: "#209dd7" }}>
        Back to boards
      </Link>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "#032147" }}>Notification Preferences</h1>
      <p className="text-sm mb-8" style={{ color: "#888888" }}>
        You receive notifications when you are assigned to a card or a card you are assigned to is due tomorrow.
      </p>
      <div className="border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: "#032147" }}>Card assignments</p>
            <p className="text-xs" style={{ color: "#888888" }}>When someone assigns you to a card</p>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">Enabled</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: "#032147" }}>Due date reminders</p>
            <p className="text-xs" style={{ color: "#888888" }}>The day before a card is due</p>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">Enabled</span>
        </div>
      </div>
    </main>
  );
}
