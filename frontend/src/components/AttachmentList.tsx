"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
}

interface AttachmentListProps {
  cardId: string;
  currentUserId: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentList({ cardId, currentUserId }: AttachmentListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cards/${cardId}/attachments`)
      .then((r) => r.json())
      .then(setAttachments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cardId]);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/attachments/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Failed to delete attachment"); return; }
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) return <p className="text-xs" style={{ color: "#888888" }}>Loading...</p>;
  if (!attachments.length) return <p className="text-xs italic" style={{ color: "#888888" }}>No attachments.</p>;

  return (
    <ul className="space-y-2">
      {attachments.map((a) => (
        <li key={a.id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 bg-gray-50">
          {a.mimeType.startsWith("image/") ? (
            <img src={a.fileUrl} alt={a.fileName} className="w-10 h-10 object-cover rounded" />
          ) : (
            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
              {a.fileName.split(".").pop() ?? "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <a
              href={a.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium truncate block hover:underline"
              style={{ color: "#209dd7" }}
            >
              {a.fileName}
            </a>
            <p className="text-xs" style={{ color: "#888888" }}>{formatBytes(a.fileSize)}</p>
          </div>
          {a.user.id === currentUserId && (
            <button
              onClick={() => handleDelete(a.id)}
              className="text-xs text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
              aria-label="Delete"
            >
              Remove
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
