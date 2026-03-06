interface ShortcutsHelpProps {
  onClose: () => void;
}

interface Shortcut {
  key: string;
  description: string;
}

const SHORTCUTS: Shortcut[] = [
  { key: "n", description: "New card in first column" },
  { key: "/", description: "Focus search" },
  { key: "Cmd+K", description: "Open command palette" },
  { key: "Ctrl+Z", description: "Undo last action" },
  { key: "Ctrl+Shift+Z", description: "Redo" },
  { key: "?", description: "Show this help" },
  { key: "Esc", description: "Close modal / clear search" },
];

export default function ShortcutsHelp({ onClose }: ShortcutsHelpProps) {
  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-panel modal-panel-sm"
        style={{ padding: "28px 32px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2
              className="heading-serif"
              style={{ fontSize: "26px", marginBottom: "6px" }}
            >
              Keyboard Shortcuts
            </h2>
            <div className="title-rule" />
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "var(--accent)",
              flexShrink: 0,
            }}
          >
            [X] CLOSE
          </button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {SHORTCUTS.map((s) => (
              <tr
                key={s.key}
                style={{ borderBottom: "1px solid var(--border-light)" }}
              >
                <td style={{ padding: "10px 16px 10px 0", width: "1%", whiteSpace: "nowrap" }}>
                  <kbd
                    style={{
                      display: "inline-block",
                      padding: "2px 7px",
                      fontSize: "11px",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      color: "var(--text-primary)",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    {s.key}
                  </kbd>
                </td>
                <td
                  style={{
                    padding: "10px 0",
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                  }}
                >
                  {s.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
