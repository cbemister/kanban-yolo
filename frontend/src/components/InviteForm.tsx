"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface InviteFormProps {
  boardId: string;
  onSuccess: () => void;
}

export default function InviteForm({ boardId, onSuccess }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"EDITOR" | "VIEWER">("EDITOR");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/boards/${boardId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to send invitation");
        return;
      }
      toast.success(`Invitation sent to ${email.trim()}`);
      setEmail("");
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        required
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
        style={{ "--tw-ring-color": "#209dd7" } as React.CSSProperties}
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as "EDITOR" | "VIEWER")}
        className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2"
        style={{ "--tw-ring-color": "#209dd7" } as React.CSSProperties}
      >
        <option value="EDITOR">Editor</option>
        <option value="VIEWER">Viewer</option>
      </select>
      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: "#753991" }}
      >
        {loading ? "Sending..." : "Invite"}
      </button>
    </form>
  );
}
