"use client";

interface UpgradePromptProps {
  message: string;
}

export default function UpgradePrompt({ message }: UpgradePromptProps) {
  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-center">
      <p className="text-sm mb-3" style={{ color: "#032147" }}>{message}</p>
      <a
        href="/pricing"
        className="inline-block px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
        style={{ background: "#753991" }}
      >
        Upgrade to Pro
      </a>
    </div>
  );
}
