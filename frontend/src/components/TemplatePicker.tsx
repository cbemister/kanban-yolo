"use client";

import { useState } from "react";
import { BOARD_TEMPLATES, DEFAULT_TEMPLATE_ID, BoardTemplate } from "@/lib/board-templates";

interface Props {
  isPending: boolean;
  onSubmit: (title: string, templateId: string) => void;
  onCancel: () => void;
}

export default function TemplatePicker({ isPending, onSubmit, onCancel }: Props) {
  const [selected, setSelected] = useState<string>(DEFAULT_TEMPLATE_ID);
  const [title, setTitle] = useState("");

  const selectedTemplate = BOARD_TEMPLATES.find((t) => t.id === selected)!;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = title.trim() || selectedTemplate.name;
    onSubmit(name, selected);
  }

  function handleTemplateSelect(template: BoardTemplate) {
    setSelected(template.id);
    // Auto-fill the name only if the user hasn't typed anything or if it still
    // matches a template name (i.e. they haven't customised it yet).
    const currentIsTemplateName = BOARD_TEMPLATES.some((t) => t.name === title);
    if (!title || currentIsTemplateName) {
      setTitle(template.name);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
    >
      <div
        className="modal-panel"
        style={{ width: "100%", maxWidth: 560 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: 20 }}>
          <p className="text-section-title" style={{ marginBottom: 4 }}>
            New Board
          </p>
          <h2
            className="heading-serif"
            style={{ fontSize: 22, letterSpacing: "-0.02em" }}
          >
            Choose a template
          </h2>
        </div>

        {/* Template grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
            gap: 8,
            marginBottom: 20,
          }}
        >
          {BOARD_TEMPLATES.map((template) => {
            const isSelected = selected === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => handleTemplateSelect(template)}
                style={{
                  textAlign: "left",
                  padding: "12px 14px",
                  border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                  background: isSelected ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
                  cursor: "pointer",
                  transition: "border-color var(--transition-fast), background var(--transition-fast)",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: isSelected ? "var(--accent)" : "var(--text-primary)",
                    marginBottom: 4,
                  }}
                >
                  {template.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>
                  {template.description}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 10,
                    color: "var(--text-muted)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {template.columns.join(" · ")}
                </div>
              </button>
            );
          })}
        </div>

        {/* Board name + actions */}
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="board-name"
            className="text-section-title"
            style={{ display: "block", marginBottom: 6, fontSize: 10 }}
          >
            Board name
          </label>
          <input
            id="board-name"
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={selectedTemplate.name}
            className="input"
            style={{ width: "100%", marginBottom: 16 }}
          />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn btn-primary">
              {isPending ? "Creating..." : "Create Board"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
