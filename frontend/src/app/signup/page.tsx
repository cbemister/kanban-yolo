"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Registration failed");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error("Account created but sign-in failed. Please try logging in.");
      router.push("/login");
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
            Create your account
          </h1>
          <hr className="title-rule" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-section-title block mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="text-section-title block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="text-section-title block mb-2">
              Password
              <span
                className="font-normal ml-1"
                style={{ color: "var(--text-muted)", fontSize: 10 }}
              >
                (min. 8 characters)
              </span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full"
              minLength={8}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div
          className="mt-6 text-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium"
            style={{ color: "var(--accent)" }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
