"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  getPasswordIssues,
  passwordIssueMessage,
  passwordIsStrong,
} from "../../lib/passwordRules";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const errorId = error ? "signup-form-error" : undefined;

  const issues = useMemo(() => getPasswordIssues(password), [password]);
  const strong = passwordIsStrong(password);
  const matches = password.length > 0 && password === confirmPassword;

  const canSubmit = !loading && username.trim().length > 0 && strong && matches;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!matches) {
      setError("Passwords do not match");
      return;
    }
    if (!strong) {
      setError("Password does not meet requirements");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, confirmPassword }),
      });

      if (res.ok) {
        window.location.href = "/forums";
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await res.json();
        setError(json?.error || json?.message || "Unable to create account");
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        setError(`Server error (${res.status}). Check logs.`);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h1 className="auth-form-title">Create Account</h1>

        {error && (
          <p className="error" id="signup-form-error" role="alert" aria-live="assertive">
            {error}
          </p>
        )}

        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Enter your username"
          autoComplete="username"
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter password"
          autoComplete="new-password"
          aria-invalid={Boolean(error)}
          aria-describedby={errorId ? `${errorId} signup-password-requirements` : "signup-password-requirements"}
        />

        {/* Strength checklist */}
        <div className="password-requirements" id="signup-password-requirements">
          <div className="requirements-title">Password requirements:</div>
          <ul className="requirements-list">
            {(
              [
                "too_short",
                "no_lower",
                "no_upper",
                "no_number",
                "no_symbol",
              ] as const
            ).map((rule) => {
              const unmet = issues.includes(rule);
              return (
                <li key={rule} className={unmet ? "unmet" : "met"}>
                  {passwordIssueMessage(rule)}
                </li>
              );
            })}
          </ul>
        </div>

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Confirm password"
          autoComplete="new-password"
          aria-invalid={Boolean(error) || (confirmPassword.length > 0 && !matches)}
          aria-describedby={errorId ? `${errorId} password-match-status` : "password-match-status"}
        />

        {confirmPassword.length > 0 && (
          <p id="password-match-status" className={`password-match ${matches ? "matched" : "unmatched"}`} role="status" aria-live="polite">
            {matches ? "Passwords match ✓" : "Passwords do not match"}
          </p>
        )}

        <button type="submit" disabled={!canSubmit} className="btn-primary">
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="auth-footer-text">
        Already have an account? <Link href="/login">Log in here.</Link>
      </p>
    </div>
  );
}