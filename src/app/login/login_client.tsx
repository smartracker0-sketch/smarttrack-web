"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LuMail,
  LuLockKeyhole,
  LuEye,
  LuEyeOff,
  LuArrowRight,
  LuCircleAlert,
  LuLoaderCircle,
  LuMapPinned,
  LuFuel,
  LuVideo,
} from "react-icons/lu";
import BrandMark from "@/components/BrandMark";
import styles from "./login.module.css";

export default function LoginClient({ nextPath }: { nextPath: string }) {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [showPassword, setShowPassword] = useState(false),
    [submitting, setSubmitting] = useState(false),
    [error, setError] = useState("");
  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(
          body?.message ?? "Sign-in failed. Check your email and password.",
        );
        return;
      }
      const session = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!session.ok) {
        setError(
          session.status === 401
            ? "Your sign-in could not be completed. Please try again."
            : "The server is temporarily unavailable. Please try again.",
        );
        return;
      }
      const safePath =
        nextPath.startsWith("/") &&
        !nextPath.startsWith("//") &&
        !/[\\\r\n]/.test(nextPath)
          ? nextPath
          : "/app/dashboard";
      window.location.replace(safePath || "/app/dashboard");
    } catch {
      setError("Unable to connect. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <main className={styles.page}>
      <section
        className={styles.marketing}
        aria-labelledby="login-marketing-title"
      >
        <Image
          src="/login-wallpaper.webp"
          alt=""
          fill
          sizes="(max-width:860px) 0px,54vw"
          preload
          className={styles.wallpaper}
        />
        <Link
          href="/"
          className={styles.brand}
          aria-label="Smart Tracker Telematics home"
        >
          <BrandMark size={56} />
        </Link>
        <div className={styles.marketingCopy}>
          <h2 id="login-marketing-title">A clear view of your fleet.</h2>
          <p>
            Track vehicles, monitor fuel and review safety events in one
            workspace.
          </p>
          <ul className={styles.features}>
            <li>
              <LuMapPinned />
              <span><strong>Live tracking</strong><small>Vehicle locations and operating status</small></span>
            </li>
            <li>
              <LuFuel />
              <span><strong>Fuel monitoring</strong><small>Consumption, refuels and unusual drops</small></span>
            </li>
            <li>
              <LuVideo />
              <span><strong>Video &amp; safety</strong><small>Camera events and driver performance</small></span>
            </li>
          </ul>
        </div>
        <a
          className={styles.credit}
          href="https://www.freepik.com/free-photo/delivery-truck-good-distribution-services_17433801.htm"
          target="_blank"
          rel="noreferrer"
        >
          Photo: rawpixel.com / Freepik
        </a>
      </section>
      <section className={styles.formSide} aria-label="Account sign-in">
        <div className={styles.card}>
          <Link
            href="/"
            className={styles.brand}
            aria-label="Smart Tracker Telematics home"
          >
            <BrandMark size={44} />
          </Link>
          <h1>Sign in</h1>
          <p className={styles.intro}>Access your fleet dashboard.</p>
          {error && (
            <p className={styles.error} role="alert" id="login-error">
              <LuCircleAlert aria-hidden="true" />
              {error}
            </p>
          )}
          <form
            onSubmit={signIn}
            className={styles.form}
            aria-busy={submitting}
          >
            <div className={styles.field}>
              <label htmlFor="login-email">Email address</label>
              <div className={styles.inputWrap}>
                <LuMail aria-hidden="true" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  autoCapitalize="none"
                  spellCheck={false}
                  value={email}
                  disabled={submitting}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="you@company.com"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                />
              </div>
            </div>
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="login-password">Password</label>
                <a href="mailto:support@smarttracker.cloud?subject=Password%20reset%20request">
                  Forgot password?
                </a>
              </div>
              <div className={styles.inputWrap}>
                <LuLockKeyhole aria-hidden="true" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  disabled={submitting}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <LuEyeOff /> : <LuEye />}
                </button>
              </div>
            </div>
            <button
              className={styles.submit}
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <LuLoaderCircle
                    className={styles.spinner}
                    aria-hidden="true"
                  />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <LuArrowRight aria-hidden="true" />
                </>
              )}
            </button>
          </form>
          <p className={styles.access}>
            Need an account?{" "}
            <Link href="/company/contact-us">Request access</Link>
          </p>
        </div>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Smart Tracker Telematics.
          <br />
          All rights reserved.
        </p>
      </section>
    </main>
  );
}
