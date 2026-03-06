"use client";

interface LabelChipProps {
  label: { id: string; name: string; color: string };
  size?: "sm" | "md";
}

export default function LabelChip({ label, size = "md" }: LabelChipProps) {
  if (size === "sm") {
    return (
      <span
        className="label-chip-dot"
        style={{ background: label.color }}
        title={label.name}
      />
    );
  }

  return (
    <span
      className="label-chip"
      style={{ color: label.color, borderColor: label.color }}
    >
      {label.name}
    </span>
  );
}
