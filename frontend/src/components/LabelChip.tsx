"use client";

interface LabelChipProps {
  label: { id: string; name: string; color: string };
  size?: "sm" | "md";
}

function isColorDark(hex: string): boolean {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

export default function LabelChip({ label, size = "md" }: LabelChipProps) {
  const dark = isColorDark(label.color);
  const textColor = dark ? "#ffffff" : "#000000";

  const sizeClass = size === "sm"
    ? "text-xs px-2 py-0.5"
    : "text-sm px-2.5 py-1";

  return (
    <span
      className={`inline-block rounded-full font-medium leading-none ${sizeClass}`}
      style={{ background: label.color, color: textColor }}
    >
      {label.name}
    </span>
  );
}
