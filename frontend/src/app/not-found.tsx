import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-dvh flex items-center justify-center px-4"
      style={{ position: "relative", zIndex: 1 }}
    >
      <div
        className="modal-panel modal-panel-sm text-center"
        style={{ padding: "48px 40px 40px" }}
      >
        <p
          className="text-section-title mb-4"
          style={{ color: "var(--text-muted)", letterSpacing: "0.12em" }}
        >
          ERROR
        </p>
        <h1
          className="heading-serif mb-1"
          style={{ fontSize: 72, letterSpacing: "-0.04em", lineHeight: 1 }}
        >
          404
        </h1>
        <hr className="title-rule" style={{ margin: "20px 0 24px" }} />
        <p
          className="text-sm mb-8"
          style={{ color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 280, margin: "0 auto 32px" }}
        >
          This page does not exist or has been moved.
        </p>
        <Link href="/boards" className="btn btn-primary">
          Back to boards
        </Link>
      </div>
    </div>
  );
}
