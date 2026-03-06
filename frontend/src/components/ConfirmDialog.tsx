"use client";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="modal-backdrop-overlay" onClick={onCancel}>
      <div
        className="modal-panel modal-panel-sm"
        style={{ padding: "28px 32px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="heading-serif"
          style={{ fontSize: "22px", marginBottom: "12px" }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: "14px",
            lineHeight: "1.6",
            color: "var(--text-secondary)",
            marginBottom: "28px",
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
