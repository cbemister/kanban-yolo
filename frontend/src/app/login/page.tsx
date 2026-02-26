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
      style={{ background: "#032147" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-10 rounded-full" style={{ background: "#ecad0a" }} />
          <h1 className="text-2xl font-bold" style={{ color: "#032147" }}>
            Sign in to Kanban
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#032147" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "#209dd7" } as React.CSSProperties}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#032147" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "#209dd7" } as React.CSSProperties}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "#753991" }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm" style={{ color: "#888888" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium" style={{ color: "#209dd7" }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
