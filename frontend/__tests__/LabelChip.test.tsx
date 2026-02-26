import React from "react";
import { render, screen } from "@testing-library/react";
import LabelChip from "@/components/LabelChip";

const darkLabel = { id: "l1", name: "Bug", color: "#032147" };
const lightLabel = { id: "l2", name: "Feature", color: "#ecad0a" };
const midLabel = { id: "l3", name: "Docs", color: "#888888" };

describe("LabelChip", () => {
  it("renders the label name", () => {
    render(<LabelChip label={darkLabel} />);
    expect(screen.getByText("Bug")).toBeInTheDocument();
  });

  it("uses white text on dark background", () => {
    render(<LabelChip label={darkLabel} />);
    const chip = screen.getByText("Bug");
    expect(chip).toHaveStyle({ color: "#ffffff" });
  });

  it("uses black text on light background", () => {
    render(<LabelChip label={lightLabel} />);
    const chip = screen.getByText("Feature");
    expect(chip).toHaveStyle({ color: "#000000" });
  });

  it("uses the label color as background", () => {
    render(<LabelChip label={darkLabel} />);
    const chip = screen.getByText("Bug");
    expect(chip).toHaveStyle({ background: "#032147" });
  });

  it("applies sm size classes", () => {
    render(<LabelChip label={darkLabel} size="sm" />);
    const chip = screen.getByText("Bug");
    expect(chip.className).toContain("text-xs");
    expect(chip.className).toContain("px-2");
  });

  it("applies md size classes by default", () => {
    render(<LabelChip label={darkLabel} />);
    const chip = screen.getByText("Bug");
    expect(chip.className).toContain("text-sm");
    expect(chip.className).toContain("px-2.5");
  });

  it("renders multiple chips independently", () => {
    render(
      <>
        <LabelChip label={darkLabel} />
        <LabelChip label={lightLabel} />
        <LabelChip label={midLabel} />
      </>
    );
    expect(screen.getByText("Bug")).toBeInTheDocument();
    expect(screen.getByText("Feature")).toBeInTheDocument();
    expect(screen.getByText("Docs")).toBeInTheDocument();
  });

  it("treats mid-range luminance as light (black text)", () => {
    render(<LabelChip label={midLabel} />);
    const chip = screen.getByText("Docs");
    // #888888 luminance ≈ 0.53 — just above the 0.5 threshold → black text
    expect(chip).toHaveStyle({ color: "#000000" });
  });
});
