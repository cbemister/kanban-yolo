"use client";

export default function ScaleIndicator() {
  return (
    <div className="scale-indicator" aria-hidden="true">
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="scale-bar-tick" />
        <div className="scale-bar-segment" />
        <div className="scale-bar-tick" />
        <div className="scale-bar-segment" />
        <div className="scale-bar-tick" />
        <div className="scale-bar-segment" />
        <div className="scale-bar-tick" />
      </div>
      <span className="scale-text">1:1</span>
    </div>
  );
}
