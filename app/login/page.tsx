"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const errorId = error ? "login-form-error" : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        window.location.href = "/";
      } else {
        let msg = "Invalid login";
        try {
          const json = await res.json();
          msg = json?.error || json?.message || msg;
        } catch {
          msg = "Server returned non-JSON response. Check server logs.";
        }
        setError(msg);
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
        <h1 className="auth-form-title">Login</h1>

        {error && (
          <p className="error" id="login-form-error" role="alert" aria-live="assertive">
            {error}
          </p>
        )}

        <label htmlFor="username">Username</label>
        <input
          type="text"
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
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
          autoComplete="current-password"
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
        />

        <button type="submit" disabled={loading} className="btn-primary" aria-describedby="login-submit-status">
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p id="login-submit-status" className="sr-only" role="status" aria-live="polite">
          {loading ? "Attempting to log in" : ""}
        </p>
      </form>

      <p className="auth-footer-text">
        New user? <Link href="/signup">Sign up for an account.</Link>
      </p>
    </div>
  );
}
