"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  FormEvent,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

function getSafeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/")) {
    return "/results?track=dsa";
  }
  return value;
}

async function getResponseErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json().catch(() => null)) as {
      error?: unknown;
    } | null;
    if (typeof payload?.error === "string" && payload.error.trim().length > 0) {
      return payload.error;
    }
  }

  const text = await response.text().catch(() => "");
  if (text.trim().length > 0) {
    return text.trim().slice(0, 180);
  }

  return fallbackMessage;
}

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => getSafeNextPath(searchParams.get("next")),
    [searchParams],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);
  const inFlightRequestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      inFlightRequestRef.current?.abort();
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const submittedEmail = String(formData.get("email") ?? "").trim();
    const submittedPassword = String(formData.get("password") ?? "");

    if (submittedEmail.length === 0 || submittedPassword.length === 0) {
      setError("Please enter both email and password.");
      return;
    }

    setEmail(submittedEmail);
    setPassword(submittedPassword);

    inFlightRequestRef.current?.abort();
    const controller = new AbortController();
    inFlightRequestRef.current = controller;

    setIsSubmitting(true);
    setError(null);

    try {
      let response: Response;
      try {
        response = await fetch("/api/auth/sign-in", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            email: submittedEmail,
            password: submittedPassword,
          }),
        });
      } catch (networkError) {
        if (
          networkError instanceof DOMException &&
          networkError.name === "AbortError"
        ) {
          return;
        }

        if (isMountedRef.current) {
          setError(
            "Could not reach server. Please check your connection and try again.",
          );
        }
        return;
      }

      if (!response.ok) {
        if (isMountedRef.current) {
          setError(
            await getResponseErrorMessage(response, "Could not sign in."),
          );
        }
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch (submitError) {
      if (isMountedRef.current) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Could not sign in right now.",
        );
      }
    } finally {
      if (inFlightRequestRef.current === controller) {
        inFlightRequestRef.current = null;
      }
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }

  return (
    <main className="page-shell flex min-h-[calc(100vh-90px)] items-center py-8 sm:py-12">
      <div className="grid w-full gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="card-surface hidden p-8 lg:block"
        >
          <p className="section-eyebrow">Welcome Back</p>
          <h1 className="mt-3 text-5xl text-foreground">
            Your prep cockpit is ready.
          </h1>
          <p className="mt-3 text-base text-ink-soft">
            Continue from your latest diagnosis, review concept gaps, and
            execute the next roadmap cycle without losing momentum.
          </p>

          <div className="mt-6 grid gap-3">
            <div className="feature-surface px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                Signal
              </p>
              <p className="mt-1 text-sm text-neutral-200">
                Concept-level accuracy and trend tracking
              </p>
            </div>
            <div className="feature-surface px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                Action
              </p>
              <p className="mt-1 text-sm text-neutral-200">
                Roadmap tasks ordered by weakness and prerequisites
              </p>
            </div>
            <div className="feature-surface px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                Validation
              </p>
              <p className="mt-1 text-sm text-neutral-200">
                Follow-up quizzes to verify measurable improvement
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="card-surface mx-auto w-full max-w-md p-7"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">
            Account Access
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-foreground">
            Sign in
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Continue your adaptive prep with personalized analytics and roadmap
            tracking.
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label
                htmlFor="email"
                className="text-xs font-medium text-neutral-300"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input-surface mt-2 w-full rounded-xl px-3 py-2.5 text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-xs font-medium text-neutral-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="input-surface mt-2 w-full rounded-xl px-3 py-2.5 text-sm"
                placeholder="Enter your password"
              />
            </div>

            {error ? (
              <p className="error-surface rounded-xl px-3 py-2 text-sm">
                {error}
              </p>
            ) : null}

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </motion.button>
          </form>

          <p className="mt-5 text-sm text-neutral-400">
            New here?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-foreground hover:text-neutral-300"
            >
              Create account
            </Link>
          </p>
        </motion.section>
      </div>
    </main>
  );
}

function SignInPageFallback() {
  return (
    <main className="page-shell flex min-h-[calc(100vh-90px)] items-center py-8 sm:py-12">
      <section className="card-surface mx-auto w-full max-w-md p-7">
        <p className="text-sm text-neutral-400">Loading sign-in...</p>
      </section>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInPageFallback />}>
      <SignInPageContent />
    </Suspense>
  );
}
