"use client";

import React, { useState } from "react";

export default function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);

    const errorId = error ? "login-component-error" : undefined;
    const statusId = status ? "login-component-status" : undefined;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setStatus("Signing in...");

        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        setLoading(false);

        if (res.ok) {
            setStatus("Login successful. Redirecting...");
            window.location.href = "/"; // redirect
        } else {
            const data = await res.json();
            setStatus(null);
            setError("Login failed: " + (data?.message || "Unknown error"));
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            aria-busy={loading}
            style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px" }}
        >
            {error && (
                <p className="error" id="login-component-error" role="alert" aria-live="assertive">
                    {error}
                </p>
            )}

            {status && (
                <p id="login-component-status" role="status" aria-live="polite">
                    {status}
                </p>
            )}

            <label htmlFor="login-component-username">Username</label>
            <input
                id="login-component-username"
                type="text"
                placeholder="Username"
                title="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                aria-invalid={Boolean(error)}
                aria-describedby={errorId || statusId}
            />

            <label htmlFor="login-component-password">Password</label>
            <input
                id="login-component-password"
                type="password"
                placeholder="Password"
                title="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                aria-invalid={Boolean(error)}
                aria-describedby={errorId || statusId}
            />
            <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
            </button>
        </form>
    );
}
