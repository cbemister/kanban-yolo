"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
      <div className="modal-panel modal-panel-sm p-8">
        <div className="mb-8">
          <h1
            className="heading-serif mb-2"
            style={{ fontSize: 28, letterSpacing: "-0.02em" }}
          >
            Sign in to Kanban
          </h1>
          <hr className="title-rule" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-section-title block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              required
              autoFocus
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
