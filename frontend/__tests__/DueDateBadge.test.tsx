import React from "react";
import { render, screen } from "@testing-library/react";
import DueDateBadge from "@/components/DueDateBadge";
import { addDays, subDays, format } from "date-fns";

// Freeze time so relative date tests are stable
const FIXED_NOW = new Date("2026-02-26T12:00:00.000Z");

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

function isoFor(date: Date): string {
  return date.toISOString();
}

describe("DueDateBadge", () => {
  it("shows 'Today' for today's date", () => {
    render(<DueDateBadge dueDate={isoFor(FIXED_NOW)} />);
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("uses yellow color for today", () => {
    render(<DueDateBadge dueDate={isoFor(FIXED_NOW)} />);
    expect(screen.getByText("Today")).toHaveStyle({ color: "#ecad0a" });
  });

  it("shows 'Tomorrow' for tomorrow's date", () => {
    render(<DueDateBadge dueDate={isoFor(addDays(FIXED_NOW, 1))} />);
    expect(screen.getByText("Tomorrow")).toBeInTheDocument();
  });

  it("uses yellow color for tomorrow", () => {
    render(<DueDateBadge dueDate={isoFor(addDays(FIXED_NOW, 1))} />);
    expect(screen.getByText("Tomorrow")).toHaveStyle({ color: "#ecad0a" });
  });

  it("shows formatted date and yellow color for 2 days away", () => {
    const twoDays = addDays(FIXED_NOW, 2);
    render(<DueDateBadge dueDate={isoFor(twoDays)} />);
    expect(screen.getByText(format(twoDays, "MMM d"))).toBeInTheDocument();
    expect(screen.getByText(format(twoDays, "MMM d"))).toHaveStyle({ color: "#ecad0a" });
  });

  it("shows formatted date and gray color for dates far in the future", () => {
    const future = addDays(FIXED_NOW, 10);
    render(<DueDateBadge dueDate={isoFor(future)} />);
    expect(screen.getByText(format(future, "MMM d"))).toHaveStyle({ color: "#888888" });
  });

  it("shows formatted date and red color for overdue dates", () => {
    const past = subDays(FIXED_NOW, 3);
    render(<DueDateBadge dueDate={isoFor(past)} />);
    expect(screen.getByText(format(past, "MMM d"))).toHaveStyle({ color: "#ef4444" });
  });

  it("shows formatted date and red color for yesterday", () => {
    const yesterday = subDays(FIXED_NOW, 1);
    render(<DueDateBadge dueDate={isoFor(yesterday)} />);
    expect(screen.getByText(format(yesterday, "MMM d"))).toHaveStyle({ color: "#ef4444" });
  });

  it("renders a span element", () => {
    const { container } = render(<DueDateBadge dueDate={isoFor(FIXED_NOW)} />);
    expect(container.querySelector("span")).toBeInTheDocument();
  });
});
