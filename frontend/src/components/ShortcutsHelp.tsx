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
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "#032147" }}>Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-500"
          >
            x
          </button>
        </div>
        <table className="w-full">
          <tbody>
            {SHORTCUTS.map((s) => (
              <tr key={s.key} className="border-b border-gray-50 last:border-0">
                <td className="py-2 pr-4">
                  <kbd className="px-2 py-0.5 rounded text-xs font-mono bg-gray-100 border border-gray-200 text-gray-700">
                    {s.key}
                  </kbd>
                </td>
                <td className="py-2 text-sm" style={{ color: "#032147" }}>{s.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
