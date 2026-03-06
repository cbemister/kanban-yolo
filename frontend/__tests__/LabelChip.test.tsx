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

  it("uses the label color as text color (bordered style)", () => {
    render(<LabelChip label={darkLabel} />);
    const chip = screen.getByText("Bug");
    expect(chip).toHaveStyle({ color: "#032147" });
  });

  it("uses the label color as border color", () => {
    render(<LabelChip label={lightLabel} />);
    const chip = screen.getByText("Feature");
    expect(chip).toHaveStyle({ borderColor: "#ecad0a" });
  });

  it("applies the label-chip class", () => {
    render(<LabelChip label={darkLabel} />);
    const chip = screen.getByText("Bug");
    expect(chip.className).toContain("label-chip");
  });

  it("renders sm size as a colored dot with no text", () => {
    render(<LabelChip label={darkLabel} size="sm" />);
    // sm renders a dot — text is not visible, accessed via title
    expect(screen.queryByText("Bug")).not.toBeInTheDocument();
    const dot = document.querySelector(".label-chip-dot");
    expect(dot).toBeInTheDocument();
  });

  it("sm dot uses label color as background", () => {
    render(<LabelChip label={darkLabel} size="sm" />);
    const dot = document.querySelector(".label-chip-dot") as HTMLElement;
    expect(dot).toHaveStyle({ background: "#032147" });
  });

  it("sm dot exposes label name via title attribute", () => {
    render(<LabelChip label={darkLabel} size="sm" />);
    expect(screen.getByTitle("Bug")).toBeInTheDocument();
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
});
