"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const themeOrder = ["blueprint", "dark", "light"] as const;
const themeLabels: Record<string, string> = {
  blueprint: "Blueprint",
  dark: "Dark",
  light: "Light",
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span style={{ width: 60, display: "inline-block" }} />;

  const currentIndex = themeOrder.indexOf(theme as typeof themeOrder[number]);
  const nextIndex = (currentIndex + 1) % themeOrder.length;
  const label = themeLabels[theme || "blueprint"] || "Blueprint";

  return (
    <button
      onClick={() => setTheme(themeOrder[nextIndex])}
      aria-label={`Switch to ${themeLabels[themeOrder[nextIndex]]} theme`}
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        transition: "color var(--transition-fast)",
        padding: "4px 0",
        cursor: "pointer",
        border: "none",
        background: "none",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
    >
      {label}
    </button>
  );
}
