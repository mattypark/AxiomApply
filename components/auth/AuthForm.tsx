"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassButton } from "@/components/glass/GlassButton";

/** Translate Supabase error strings into human words — no "coding stuff". */
function friendlyAuthError(raw: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes("invalid login credentials")) {
    return "Wrong email or password — try again.";
  }
  if (msg.includes("rate limit") || msg.includes("too many")) {
    return "Too many attempts — give it a couple of minutes and try again.";
  }
  if (msg.includes("password") && msg.includes("6")) {
    return "Password needs at least 6 characters.";
  }
  if (msg.includes("already registered")) {
    return "That email already has an account — sign in instead.";
  }
  if (msg.includes("invalid") && msg.includes("email")) {
    return "That email doesn't look right — double-check and try again.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Couldn't reach the sign-in service — check your connection and retry.";
  }
  return "Couldn't sign you in just now — try again in a moment.";
}

export function AuthForm({
  next,
  mode = "signin",
}: {
  next: string;
  /** "signup" creates the account with a password; "signin" logs in */
  mode?: "signin" | "signup";
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  const [message, setMessage] = useState("");

  const supabase = getBrowserSupabase();

  // Prefill from the landing-page CTA (sessionStorage, never URL params)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("ax_email");
      if (saved) setEmail(saved);
    } catch {
      /* private mode */
    }
  }, []);

  if (!supabase) {
    return (
      <p className="max-w-[40ch] text-[0.9rem] leading-relaxed text-muted">
        Accounts aren&apos;t switched on yet — Supabase keys land here soon.
        Everything else works without signing in.
      </p>
    );
  }

  const redirectTo = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const google = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || state === "busy") return;
    setState("busy");

    const { data, error } =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: redirectTo() },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setState("error");
      setMessage(friendlyAuthError(error.message));
      return;
    }
    if (data.session) {
      // Signed in immediately — full navigation so the server sees the cookies.
      window.location.assign(next);
      return;
    }
    // No session back means "Confirm email" is still ON in Supabase, so the
    // account exists but is unusable until the link is clicked. Turning that
    // setting off is what makes sign-up instant; until then, say so plainly
    // rather than parking the user on a dead-end screen.
    setState("error");
    setMessage(
      "Account created, but it needs email confirmation before you can sign in.",
    );
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <GlassButton tone="forest" type="button" onClick={google} className="w-full">
        <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#fff" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
        </svg>
        Continue with Google
      </GlassButton>

      <span className="text-center font-mono text-[0.64rem] tracking-[0.18em] text-faint uppercase">
        or
      </span>

      <form onSubmit={submitPassword} className="flex flex-col gap-3">
        <GlassInput
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@school.edu"
          autoComplete="email"
          aria-label="Email"
        />
        <GlassInput
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "signup" ? "Create a password (6+ characters)" : "Password"}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          aria-label="Password"
        />
        <GlassButton tone="glass" type="submit" disabled={state === "busy"}>
          {state === "busy"
            ? "One sec…"
            : mode === "signup"
              ? "Create account →"
              : "Sign in →"}
        </GlassButton>
      </form>

      {state === "error" && (
        <p className="text-center text-[0.85rem] text-error">{message}</p>
      )}
    </div>
  );
}
