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
    <div
      className="min-h-dvh flex items-center justify-center px-4"
      style={{ position: "relative", zIndex: 1 }}
    >
      <div className="modal-panel modal-panel-sm p-8">
        <div className="mb-8">
          <h1
            className="heading-serif mb-2"
            style={{ fontSize: 28, letterSpacing: "-0.02em" }}
          >
            Board Invitation
          </h1>
          <hr className="title-rule" />
        </div>
        <p className="mb-8" style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>
          You have been invited to collaborate on a Kanban board. Accept to join or decline to dismiss this invitation.
        </p>

        {error && (
          <p
            className="mb-4 text-sm px-3 py-2"
            style={{
              color: "var(--accent-danger)",
              border: "1px solid var(--accent-danger)",
              background: "transparent",
            }}
          >
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            disabled={accepting || declining}
            className="btn btn-primary flex-1"
          >
            {accepting ? "Accepting..." : "Accept"}
          </button>
          <button
            onClick={handleDecline}
            disabled={accepting || declining}
            className="btn btn-secondary flex-1"
          >
            {declining ? "Declining..." : "Decline"}
          </button>
        </div>
      </div>
    </div>
  );
}
