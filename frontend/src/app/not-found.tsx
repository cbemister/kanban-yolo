import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-dvh flex items-center justify-center px-4"
      style={{ position: "relative", zIndex: 1 }}
    >
      <div className="modal-panel modal-panel-sm p-8 text-center">
        <h1
          className="heading-serif mb-2"
          style={{ fontSize: 48, letterSpacing: "-0.03em" }}
        >
          404
        </h1>
        <hr className="title-rule" style={{ marginBottom: 24 }} />
        <p
          className="text-sm mb-6"
          style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
        >
          The page you are looking for does not exist.
        </p>
        <Link href="/boards" className="btn btn-primary">
          Back to boards
        </Link>
      </div>
    </div>
  );
}
