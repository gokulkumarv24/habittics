"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      await signIn("credentials", {
        email: form.email,
        password: form.password,
        callbackUrl: "/dashboard",
      });
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left brand panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-violet-500/10 via-primary/8 to-background">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-20 right-10 w-80 h-80 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-20 -left-10 w-60 h-60 rounded-full bg-primary/12 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-30" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="logo-mark w-10 h-10 rounded-xl flex items-center justify-center shadow-glow-sm">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">HabitFlow</span>
        </div>

        {/* Brand copy */}
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            Free forever for personal use
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-3">
              Your journey to{" "}
              <span className="text-gradient">better habits</span>{" "}
              starts here.
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Join thousands of people who use HabitFlow to build consistency,
              track their goals, and transform their daily routines.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "10K+",  label: "Active users" },
              { value: "2.4M",  label: "Habits tracked" },
              { value: "98%",   label: "Satisfaction" },
              { value: "Free",  label: "Forever" },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-xl bg-card/60 border border-border/60">
                <p className="text-xl font-bold text-gradient">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-muted-foreground">
          © 2026 HabitFlow. No credit card required.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-mesh">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="logo-mark w-12 h-12 rounded-2xl flex items-center justify-center shadow-glow">
              <Flame className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Create your account</h1>
            <p className="text-muted-foreground text-sm">Start building better habits today — it&apos;s free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/8 border border-destructive/20 px-3.5 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                minLength={2}
                className="h-11 rounded-xl border-border/60 focus:border-primary/40 bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="h-11 rounded-xl border-border/60 focus:border-primary/40 bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                className="h-11 rounded-xl border-border/60 focus:border-primary/40 bg-background"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold shadow-glow-sm btn-glow gap-2 mt-2"
              disabled={loading}
            >
              {loading ? "Creating account…" : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-4">
            By signing up you agree to our{" "}
            <span className="text-primary cursor-pointer hover:underline">Terms</span> &amp;{" "}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>
          </p>

          <p className="text-sm text-center text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
