"use client";

interface UpgradePromptProps {
  message: string;
}

export default function UpgradePrompt({ message }: UpgradePromptProps) {
  return (
    <div
      style={{
        border: "1px solid var(--border-color)",
        background: "var(--bg-card)",
        padding: "20px 24px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: "14px",
          lineHeight: "1.6",
          color: "var(--text-secondary)",
          marginBottom: "16px",
        }}
      >
        {message}
      </p>
      <a href="/pricing" className="btn btn-primary" style={{ display: "inline-flex" }}>
        Upgrade to Pro
      </a>
    </div>
  );
}
