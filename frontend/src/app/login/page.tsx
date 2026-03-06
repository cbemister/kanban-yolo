"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const isDev = process.env.NODE_ENV === "development";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error("Invalid email or password");
    } else {
      router.push("/boards");
    }
  }

  return (
    <div
      className="min-h-dvh flex items-center justify-center px-4"
      style={{ position: "relative", zIndex: 1 }}
    >
      <div className="modal-panel modal-panel-sm" style={{ padding: "40px 40px 32px" }}>
        {/* Brand */}
        <div className="mb-7">
          <p
            className="text-section-title mb-2"
            style={{ color: "var(--text-muted)", letterSpacing: "0.12em" }}
          >
            KANBAN
          </p>
          <h1
            className="heading-serif mb-3"
            style={{ fontSize: 30, letterSpacing: "-0.02em", lineHeight: 1.1 }}
          >
            Sign in to your account
          </h1>
          <hr className="title-rule" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div suppressHydrationWarning>
            <label className="text-section-title block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              required
              autoFocus
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="text-section-title block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full"
              required
              suppressHydrationWarning
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {isDev && (
          <div
            className="mt-5"
            style={{
              borderTop: "1px solid var(--border-light)",
              paddingTop: 20,
            }}
          >
            <a
              href="/api/auth/dev-login"
              className="btn w-full"
              style={{
                display: "block",
                textAlign: "center",
                background: "rgba(255,255,255,0.05)",
                border: "1px dashed var(--border-color)",
                color: "var(--text-secondary)",
                fontSize: 12,
                letterSpacing: "0.08em",
                padding: "8px 16px",
              }}
            >
              DEV LOGIN (skip auth)
            </a>
          </div>
        )}

        <div
          className="mt-6 text-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium"
            style={{ color: "var(--accent)" }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
