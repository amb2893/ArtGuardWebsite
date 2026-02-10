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
    <div className="login-container" style={{ padding: 40 }}>
      <h1>Sign up</h1>

      <form onSubmit={handleSubmit} className="login-form">
        {error && <p className="error">{error}</p>}

        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="username"
          autoComplete="username"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="password"
          autoComplete="new-password"
        />

        {/* Strength checklist */}
        <div style={{ fontSize: 14 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Password requirements:</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
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
                <li key={rule} style={{ color: unmet ? "crimson" : "green" }}>
                  {passwordIssueMessage(rule)}
                </li>
              );
            })}
          </ul>
        </div>

        <label htmlFor="confirmPassword">Confirm password</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="confirm password"
          autoComplete="new-password"
        />

        {confirmPassword.length > 0 && (
          <p style={{ margin: 0, fontSize: 14, color: matches ? "green" : "crimson" }}>
            {matches ? "Passwords match" : "Passwords do not match"}
          </p>
        )}

        <button type="submit" disabled={!canSubmit}>
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "1rem" }}>
        Already have an account? <Link href="/login">Log in here.</Link>
      </p>
    </div>
  );
}