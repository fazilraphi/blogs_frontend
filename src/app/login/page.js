"use client";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setTokens } from "@/lib/auth";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setTokens(data.access_token, data.refresh_token);
        router.push("/");
      } else {
        setError(data.error || "Invalid email or password.");
      }
    } catch {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-apple-green)]/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="glass p-8 md:p-12 rounded-3xl w-full max-w-md border border-white/10 relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-bold tracking-tighter mb-2 inline-block">
            Blig<span className="text-[var(--color-apple-green)]">.</span>
          </Link>
          <p className="text-gray-400">Welcome back! Please login to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--color-apple-green)] focus:ring-1 focus:ring-[var(--color-apple-green)] transition-all"
              required
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--color-apple-green)] focus:ring-1 focus:ring-[var(--color-apple-green)] transition-all"
              required
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-apple-green)] text-black font-bold py-3.5 rounded-xl hover:bg-[var(--color-apple-green-hover)] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(76,201,54,0.3)] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[var(--color-apple-green)] hover:underline font-medium">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
