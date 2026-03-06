"use client";

import { redirect } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

/* ------------------------------------------------------------------ */
/*  Color swatch data                                                  */
/* ------------------------------------------------------------------ */
const backgroundColors = [
  { token: "--bg-base", label: "Base" },
  { token: "--bg-card", label: "Card" },
  { token: "--bg-card-hover", label: "Card Hover" },
  { token: "--bg-surface", label: "Surface" },
  { token: "--bg-overlay", label: "Overlay" },
];

const borderColors = [
  { token: "--border-color", label: "Border" },
  { token: "--border-light", label: "Border Light" },
];

const textColors = [
  { token: "--text-primary", label: "Primary" },
  { token: "--text-secondary", label: "Secondary" },
  { token: "--text-muted", label: "Muted" },
];

const accentColors = [
  { token: "--accent", label: "Accent" },
  { token: "--accent-hover", label: "Accent Hover" },
  { token: "--accent-danger", label: "Danger" },
];

const labelColors = [
  { token: "--label-dusty-blue", label: "Dusty Blue" },
  { token: "--label-sage", label: "Sage" },
  { token: "--label-warm-gray", label: "Warm Gray" },
  { token: "--label-slate", label: "Slate" },
];

const gridColors = [
  { token: "--grid-major", label: "Grid Major" },
  { token: "--grid-minor", label: "Grid Minor" },
];

/* ------------------------------------------------------------------ */
/*  Serif heading sizes                                                */
/* ------------------------------------------------------------------ */
const serifSizes = [
  { size: 48, label: "48px -- Page Title" },
  { size: 32, label: "32px -- Section Heading" },
  { size: 24, label: "24px -- Card Title" },
  { size: 18, label: "18px -- Subsection" },
  { size: 15, label: "15px -- Body Serif" },
];

const sansSizes = [
  { size: 14, weight: 400, label: "14px / 400 -- Body" },
  { size: 13, weight: 500, label: "13px / 500 -- UI Default" },
  { size: 12, weight: 400, label: "12px / 400 -- Small" },
  { size: 11, weight: 600, label: "11px / 600 -- Micro" },
  { size: 10, weight: 700, label: "10px / 700 -- Section Title" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);

  if (process.env.NODE_ENV === "production") {
    redirect("/");
  }

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "64px 40px 120px",
        }}
      >
        {/* ============================================================
            HEADER
            ============================================================ */}
        <header style={{ marginBottom: 80 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <h1
              className="heading-serif"
              style={{ fontSize: 48 }}
            >
              Design System
            </h1>
            <ThemeToggle />
          </div>
          <hr className="title-rule" />
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 14,
              marginTop: 16,
              maxWidth: 560,
              lineHeight: 1.6,
            }}
          >
            Living reference for the Editorial Grid design language. All tokens,
            components, and patterns used across the Kanban application. Switch
            themes to verify cross-theme consistency.
          </p>
        </header>

        {/* ============================================================
            1. COLOR PALETTE
            ============================================================ */}
        <Section title="Color Palette">
          <ColorGroup label="Backgrounds" colors={backgroundColors} />
          <ColorGroup label="Borders" colors={borderColors} />
          <ColorGroup label="Text" colors={textColors} isText />
          <ColorGroup label="Accent" colors={accentColors} />
          <ColorGroup label="Labels" colors={labelColors} />
          <ColorGroup label="Grid" colors={gridColors} />
        </Section>

        {/* ============================================================
            2. TYPOGRAPHY SCALE
            ============================================================ */}
        <Section title="Typography">
          <Subsection label="Serif Headings (Instrument Serif)">
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {serifSizes.map((s) => (
                <div key={s.size}>
                  <span
                    className="heading-serif"
                    style={{ fontSize: s.size }}
                  >
                    The quick brown fox
                  </span>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginTop: 4,
                      fontFamily: "var(--font-sans)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </Subsection>

          <Subsection label="Sans Body (Inter)">
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {sansSizes.map((s) => (
                <div key={`${s.size}-${s.weight}`}>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: s.size,
                      fontWeight: s.weight,
                      color: "var(--text-primary)",
                    }}
                  >
                    Pack my box with five dozen liquor jugs
                  </span>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginTop: 4,
                      fontFamily: "var(--font-sans)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </Subsection>

          <Subsection label="Section Title Treatment">
            <div className="text-section-title">
              Section Title
            </div>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginTop: 8,
                fontFamily: "var(--font-sans)",
              }}
            >
              .text-section-title -- 10px / 700 / uppercase / 0.15em spacing
            </p>
          </Subsection>
        </Section>

        {/* ============================================================
            3. BUTTONS
            ============================================================ */}
        <Section title="Buttons">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 32,
            }}
          >
            <ButtonDemo
              label="Primary"
              className="btn btn-primary"
              description="Main actions, form submits"
            />
            <ButtonDemo
              label="Primary (disabled)"
              className="btn btn-primary"
              description="Disabled state -- 50% opacity"
              disabled
            />
            <ButtonDemo
              label="Secondary"
              className="btn btn-secondary"
              description="Secondary actions, cancel"
            />
            <ButtonDemo
              label="Secondary (disabled)"
              className="btn btn-secondary"
              description="Disabled state -- 50% opacity"
              disabled
            />
            <ButtonDemo
              label="Ghost"
              className="btn btn-ghost"
              description="Minimal presence, tertiary actions"
            />
            <ButtonDemo
              label="Danger"
              className="btn btn-danger"
              description="Destructive actions, delete"
            />
            <ButtonDemo
              label="Primary Small"
              className="btn btn-primary btn-sm"
              description=".btn-sm -- Compact variant, 11px/4px 10px"
            />
            <div>
              <div className="text-section-title" style={{ marginBottom: 10 }}>
                Icon Button
              </div>
              <button
                className="btn-icon"
                aria-label="Settings"
                style={{ fontSize: 18 }}
              >
                +
              </button>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 8,
                  fontFamily: "var(--font-sans)",
                }}
              >
                .btn-icon -- Icon-only, no border/bg
              </p>
            </div>
          </div>
        </Section>

        {/* ============================================================
            4. INPUTS
            ============================================================ */}
        <Section title="Inputs">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 40,
            }}
          >
            <div>
              <div className="text-section-title" style={{ marginBottom: 10 }}>
                Standard Input
              </div>
              <input
                type="text"
                className="input"
                placeholder="Enter text..."
                style={{ marginBottom: 8 }}
              />
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                .input -- 1px border, transparent bg, accent focus ring
              </p>
            </div>

            <div>
              <div className="text-section-title" style={{ marginBottom: 10 }}>
                Underline Input
              </div>
              <input
                type="text"
                className="input-underline"
                placeholder="Search..."
                style={{ width: "100%", marginBottom: 8 }}
              />
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                .input-underline -- Bottom border only, search-style
              </p>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <div className="text-section-title" style={{ marginBottom: 10 }}>
                Textarea
              </div>
              <textarea
                className="input"
                rows={3}
                placeholder="Multi-line text area..."
                style={{ resize: "vertical" }}
              />
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 8,
                  fontFamily: "var(--font-sans)",
                }}
              >
                textarea.input -- Same styling as text input, resizable
              </p>
            </div>
          </div>
        </Section>

        {/* ============================================================
            5. CARDS
            ============================================================ */}
        <Section title="Cards">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              gridAutoRows: "min-content",
            }}
          >
            {/* Small card */}
            <div className="editorial-card" style={{ padding: 16 }}>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <span
                  className="label-chip"
                  style={{ color: "var(--label-dusty-blue)" }}
                >
                  Design
                </span>
              </div>
              <h3
                className="heading-serif"
                style={{ fontSize: 15, marginBottom: 4 }}
              >
                Update icon set
              </h3>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Small card -- single column, minimal content
              </p>
            </div>

            {/* Medium card */}
            <div className="editorial-card" style={{ padding: 20 }}>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 10,
                }}
              >
                <span
                  className="label-chip"
                  style={{ color: "var(--label-sage)" }}
                >
                  Frontend
                </span>
                <span
                  className="label-chip"
                  style={{ color: "var(--label-warm-gray)" }}
                >
                  Backend
                </span>
              </div>
              <h3
                className="heading-serif"
                style={{ fontSize: 18, marginBottom: 6 }}
              >
                Refactor authentication flow
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-sans)",
                  lineHeight: 1.5,
                  marginBottom: 12,
                }}
              >
                Migrate from session-based to JWT tokens. Update middleware,
                refresh token rotation, and client-side state management.
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Due Mar 15
                </span>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    background: "var(--bg-card-hover)",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  JD
                </div>
              </div>
            </div>

            {/* Large featured card */}
            <div
              className="editorial-card"
              style={{
                padding: 24,
                gridColumn: "span 2",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                <span
                  className="label-chip"
                  style={{ color: "var(--label-dusty-blue)" }}
                >
                  Design
                </span>
                <span
                  className="label-chip"
                  style={{ color: "var(--label-sage)" }}
                >
                  Frontend
                </span>
                <span
                  className="label-chip"
                  style={{ color: "var(--label-slate)" }}
                >
                  Research
                </span>
              </div>
              <h3
                className="heading-serif"
                style={{ fontSize: 24, marginBottom: 8 }}
              >
                Design system overhaul -- v2.0
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-sans)",
                  lineHeight: 1.6,
                  marginBottom: 16,
                  maxWidth: 680,
                }}
              >
                Complete redesign of the token system, component library, and
                documentation. Introduce blueprint grid, editorial card pattern,
                and Swiss-typographic heading hierarchy. Audit all existing
                components for consistency.
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Due Feb 28
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <AvatarSquare initials="AL" size={24} />
                  <AvatarSquare initials="MB" size={24} />
                  <AvatarSquare initials="CK" size={24} />
                </div>
              </div>
            </div>

            {/* Urgent card */}
            <div
              className="editorial-card editorial-card-urgent"
              style={{ padding: 16, gridColumn: "span 2" }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 8,
                  paddingLeft: 12,
                }}
              >
                <span
                  className="label-chip"
                  style={{ color: "var(--accent)" }}
                >
                  Urgent
                </span>
                <span
                  className="label-chip"
                  style={{ color: "var(--label-warm-gray)" }}
                >
                  Backend
                </span>
              </div>
              <div style={{ paddingLeft: 12 }}>
                <h3
                  className="heading-serif"
                  style={{ fontSize: 18, marginBottom: 6 }}
                >
                  Fix production memory leak
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-sans)",
                    lineHeight: 1.5,
                  }}
                >
                  Urgent card -- permanent 4px accent stripe on left edge.
                  Hover does not change stripe width.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* ============================================================
            6. LABELS
            ============================================================ */}
        <Section title="Labels">
          <Subsection label="Bordered Label Chips">
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                className="label-chip"
                style={{ color: "var(--label-dusty-blue)" }}
              >
                Design
              </span>
              <span
                className="label-chip"
                style={{ color: "var(--label-sage)" }}
              >
                Frontend
              </span>
              <span
                className="label-chip"
                style={{ color: "var(--label-warm-gray)" }}
              >
                Backend
              </span>
              <span
                className="label-chip"
                style={{ color: "var(--label-slate)" }}
              >
                Research
              </span>
              <span
                className="label-chip"
                style={{ color: "var(--accent)" }}
              >
                Urgent
              </span>
            </div>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginTop: 12,
                fontFamily: "var(--font-sans)",
              }}
            >
              .label-chip -- 10px / 700 / uppercase / 0.12em spacing / 1px
              border currentColor
            </p>
          </Subsection>

          <Subsection label="Dot Variants">
            <div
              style={{
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {[
                { color: "var(--label-dusty-blue)", name: "Dusty Blue" },
                { color: "var(--label-sage)", name: "Sage" },
                { color: "var(--label-warm-gray)", name: "Warm Gray" },
                { color: "var(--label-slate)", name: "Slate" },
                { color: "var(--accent)", name: "Accent" },
              ].map((l) => (
                <div
                  key={l.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    className="label-chip-dot"
                    style={{ background: l.color }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {l.name}
                  </span>
                </div>
              ))}
            </div>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginTop: 12,
                fontFamily: "var(--font-sans)",
              }}
            >
              .label-chip-dot -- 8x8px solid square, no border/padding
            </p>
          </Subsection>
        </Section>

        {/* ============================================================
            7. AVATARS
            ============================================================ */}
        <Section title="Avatars">
          <div
            style={{
              display: "flex",
              gap: 32,
              alignItems: "flex-end",
            }}
          >
            {[
              { size: 24, label: "24px (sm)" },
              { size: 32, label: "32px (md)" },
              { size: 40, label: "40px (lg)" },
            ].map((a) => (
              <div
                key={a.size}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <AvatarSquare
                  initials="JD"
                  size={a.size}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {a.label}
                </span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", gap: 4 }}>
                <AvatarSquare initials="AL" size={24} />
                <AvatarSquare initials="MB" size={24} />
                <AvatarSquare initials="CK" size={24} />
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Stacked group
              </span>
            </div>
          </div>
          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 16,
              fontFamily: "var(--font-sans)",
            }}
          >
            Square avatars with initials. No border-radius -- matches the
            angular editorial aesthetic.
          </p>
        </Section>

        {/* ============================================================
            8. DUE DATE BADGES
            ============================================================ */}
        <Section title="Due Date Badges">
          <div
            style={{
              display: "flex",
              gap: 24,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Overdue
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Accent color, bold, uppercase
              </span>
            </div>

            <div
              style={{
                width: 1,
                height: 32,
                background: "var(--border-light)",
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Due Soon
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Accent color, uppercase (within 2 days)
              </span>
            </div>

            <div
              style={{
                width: 1,
                height: 32,
                background: "var(--border-light)",
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Mar 30
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Muted, uppercase (future date)
              </span>
            </div>
          </div>
        </Section>

        {/* ============================================================
            9. MODAL
            ============================================================ */}
        <Section title="Modal">
          <button
            className="btn btn-secondary"
            onClick={() => setModalOpen(true)}
          >
            Open Sample Modal
          </button>
          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 12,
              fontFamily: "var(--font-sans)",
            }}
          >
            .modal-backdrop-overlay + .modal-panel -- Fixed overlay with centered
            panel. 2px border, max-width 640px.
          </p>

          {modalOpen && (
            <div
              className="modal-backdrop-overlay"
              onClick={(e) => {
                if (e.target === e.currentTarget) setModalOpen(false);
              }}
            >
              <div className="modal-panel" style={{ padding: 32 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 8,
                  }}
                >
                  <h2
                    className="heading-serif"
                    style={{ fontSize: 24 }}
                  >
                    Modal Title
                  </h2>
                  <button
                    className="btn-icon"
                    onClick={() => setModalOpen(false)}
                    aria-label="Close modal"
                    style={{ fontSize: 18 }}
                  >
                    x
                  </button>
                </div>
                <hr className="title-rule" style={{ marginBottom: 20 }} />
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-sans)",
                    lineHeight: 1.6,
                    marginBottom: 24,
                  }}
                >
                  This is a sample modal panel demonstrating the modal system.
                  The backdrop uses var(--bg-overlay) with flex centering. The
                  panel gets a 2px border in var(--border-color) and sits on the
                  base background. Click outside or the close button to dismiss.
                </p>
                <div
                  style={{ marginBottom: 20 }}
                >
                  <div className="text-section-title" style={{ marginBottom: 8 }}>
                    Sample Input
                  </div>
                  <input
                    type="text"
                    className="input"
                    placeholder="Type something..."
                  />
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setModalOpen(false)}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ============================================================
            10. DROPDOWN
            ============================================================ */}
        <Section title="Dropdown">
          <div style={{ position: "relative", display: "inline-block" }}>
            <div
              className="dropdown-panel"
              style={{
                position: "relative",
                width: 200,
                padding: "4px 0",
              }}
            >
              {["Dashboard", "Projects", "Settings", "Sign Out"].map(
                (item, i) => (
                  <div
                    key={item}
                    style={{
                      padding: "8px 16px",
                      fontSize: 13,
                      fontFamily: "var(--font-sans)",
                      color:
                        i === 3
                          ? "var(--accent-danger)"
                          : "var(--text-primary)",
                      cursor: "pointer",
                      transition: "background var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-card-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </div>
          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 12,
              fontFamily: "var(--font-sans)",
            }}
          >
            .dropdown-panel -- bg-card-hover background, 1px border, 12px blur
            backdrop-filter. Positioned absolutely in real usage.
          </p>
        </Section>

        {/* ============================================================
            11. CATEGORY SECTION
            ============================================================ */}
        <Section title="Category Section">
          <div style={{ maxWidth: 600 }}>
            <hr className="category-rule" />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <span className="category-marker" />
              <h3
                className="heading-serif"
                style={{ fontSize: 18 }}
              >
                In Progress
              </h3>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                4
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="editorial-card" style={{ padding: 12 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  <span
                    className="label-chip"
                    style={{ color: "var(--label-sage)" }}
                  >
                    Frontend
                  </span>
                </div>
                <h4
                  className="heading-serif"
                  style={{ fontSize: 15 }}
                >
                  Implement drag-and-drop reorder
                </h4>
              </div>
              <div className="editorial-card" style={{ padding: 12 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  <span
                    className="label-chip"
                    style={{ color: "var(--label-warm-gray)" }}
                  >
                    Backend
                  </span>
                </div>
                <h4
                  className="heading-serif"
                  style={{ fontSize: 15 }}
                >
                  API rate limiting middleware
                </h4>
              </div>
            </div>
          </div>
          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 16,
              fontFamily: "var(--font-sans)",
            }}
          >
            .category-rule -- Chain-line (dash-dot-dash) divider.
            .category-marker -- Triangle accent marker before heading.
          </p>
        </Section>

        {/* ============================================================
            12. Z-INDEX SCALE
            ============================================================ */}
        <Section title="Z-Index Scale">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 12,
            }}
          >
            {[
              { token: "--z-base", value: 1, label: "Base" },
              { token: "--z-dropdown", value: 20, label: "Dropdown" },
              { token: "--z-sidebar", value: 30, label: "Sidebar" },
              { token: "--z-modal-backdrop", value: 40, label: "Modal BG" },
              { token: "--z-modal", value: 50, label: "Modal" },
              { token: "--z-toast", value: 60, label: "Toast" },
            ].map((z) => (
              <div
                key={z.token}
                style={{
                  border: "1px solid var(--border-color)",
                  padding: "12px 16px",
                  background: "var(--bg-card)",
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontFamily: "var(--font-serif)",
                    color: "var(--text-primary)",
                    marginBottom: 4,
                  }}
                >
                  {z.value}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-sans)",
                    marginBottom: 2,
                  }}
                >
                  {z.label}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-sans)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {z.token}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ============================================================
            13. TRANSITIONS & RADIUS
            ============================================================ */}
        <Section title="Transitions & Radius">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 40,
            }}
          >
            <div>
              <div className="text-section-title" style={{ marginBottom: 12 }}>
                Transition
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <code
                  style={{
                    fontSize: 13,
                    color: "var(--text-primary)",
                    fontFamily: "monospace",
                  }}
                >
                  150ms linear
                </code>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  --transition-fast
                </span>
              </div>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 8,
                  fontFamily: "var(--font-sans)",
                  lineHeight: 1.5,
                }}
              >
                Single transition speed for all interactive states. Linear
                easing for mechanical, blueprint-precise feel.
              </p>
            </div>

            <div>
              <div className="text-section-title" style={{ marginBottom: 12 }}>
                Border Radius
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-card)",
                      borderRadius: "var(--radius-none)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    0px
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-card)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    2px
                  </span>
                </div>
              </div>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 12,
                  fontFamily: "var(--font-sans)",
                  lineHeight: 1.5,
                }}
              >
                Square aesthetic by default. Minimal 2px radius for softened
                edges where needed.
              </p>
            </div>
          </div>
        </Section>

        {/* ============================================================
            14. SCALE INDICATOR
            ============================================================ */}
        <Section title="Scale Indicator">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div className="scale-bar-tick" />
            <div className="scale-bar-segment" />
            <div className="scale-bar-tick" />
            <div className="scale-bar-segment" />
            <div className="scale-bar-tick" />
            <div className="scale-bar-segment" />
            <div className="scale-bar-tick" />
            <div className="scale-bar-segment" />
            <div className="scale-bar-tick" />
            <span className="scale-text">1:1</span>
          </div>
          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 12,
              fontFamily: "var(--font-sans)",
            }}
          >
            Fixed bottom-right indicator. .scale-bar-segment (20x1px),
            .scale-bar-tick (1x8px), .scale-text (9px tabular-nums).
          </p>
        </Section>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  HELPER COMPONENTS                                                  */
/* ================================================================== */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 72 }}>
      <div
        className="text-section-title"
        style={{ marginBottom: 24 }}
      >
        {title}
      </div>
      {children}
    </section>
  );
}

function Subsection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3
        className="heading-serif"
        style={{
          fontSize: 18,
          marginBottom: 16,
        }}
      >
        {label}
      </h3>
      {children}
    </div>
  );
}

function ColorGroup({
  label,
  colors,
  isText,
}: {
  label: string;
  colors: { token: string; label: string }[];
  isText?: boolean;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--text-secondary)",
          fontFamily: "var(--font-sans)",
          marginBottom: 12,
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </h3>
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        {colors.map((c) => (
          <div
            key={c.token}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              minWidth: 72,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                background: isText ? "var(--bg-base)" : `var(${c.token})`,
                border: "1px solid var(--border-color)",
                position: "relative",
              }}
            >
              {isText && (
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: `var(${c.token})`,
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Aa
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "var(--text-secondary)",
                fontFamily: "var(--font-sans)",
                textAlign: "center",
              }}
            >
              {c.label}
            </span>
            <span
              style={{
                fontSize: 9,
                color: "var(--text-muted)",
                fontFamily: "monospace",
                textAlign: "center",
                wordBreak: "break-all",
                maxWidth: 80,
              }}
            >
              {c.token}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ButtonDemo({
  label,
  className,
  description,
  disabled,
}: {
  label: string;
  className: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="text-section-title" style={{ marginBottom: 10 }}>
        {label}
      </div>
      <button className={className} disabled={disabled}>
        {label}
      </button>
      <p
        style={{
          fontSize: 11,
          color: "var(--text-muted)",
          marginTop: 8,
          fontFamily: "var(--font-sans)",
        }}
      >
        {description}
      </p>
    </div>
  );
}

function AvatarSquare({
  initials,
  size,
}: {
  initials: string;
  size: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "var(--bg-card-hover)",
        border: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size <= 24 ? 9 : size <= 32 ? 11 : 13,
        fontWeight: 700,
        color: "var(--text-secondary)",
        fontFamily: "var(--font-sans)",
        letterSpacing: "0.04em",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
