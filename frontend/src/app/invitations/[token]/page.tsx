"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";

interface InvitationPageProps {
  params: Promise<{ token: string }>;
}

export default function InvitationPage({ params }: InvitationPageProps) {
  const { token } = use(params);
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setAccepting(true);
    setError(null);
    try {
      const res = await fetch(`/api/invitations/${token}/accept`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to accept invitation");
        return;
      }
      const data = await res.json();
      router.push(`/boards/${data.boardId}`);
    } finally {
      setAccepting(false);
    }
  }

  async function handleDecline() {
    setDeclining(true);
    setError(null);
    try {
      const res = await fetch(`/api/invitations/${token}/decline`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to decline invitation");
        return;
      }
      router.push("/boards");
    } finally {
      setDeclining(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center" style={{ background: "#032147" }}>
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md mx-4">
        <div className="mb-1 w-1 h-8 rounded-full" style={{ background: "#ecad0a" }} />
        <h1 className="text-2xl font-bold mb-2" style={{ color: "#032147" }}>
          Board Invitation
        </h1>
        <p className="mb-8" style={{ color: "#888888" }}>
          You have been invited to collaborate on a Kanban board. Accept to join or decline to dismiss this invitation.
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            disabled={accepting || declining}
            className="flex-1 py-2.5 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "#753991" }}
          >
            {accepting ? "Accepting..." : "Accept"}
          </button>
          <button
            onClick={handleDecline}
            disabled={accepting || declining}
            className="flex-1 py-2.5 rounded-lg font-semibold transition-colors bg-gray-100 hover:bg-gray-200 disabled:opacity-60"
            style={{ color: "#888888" }}
          >
            {declining ? "Declining..." : "Decline"}
          </button>
        </div>
      </div>
    </div>
  );
}
