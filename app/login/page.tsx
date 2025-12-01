"use client";

import React, { useState } from "react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
                // Login successful
                window.location.href = "/forums";
            } else {
                // Try to read JSON error safely, fall back to text
                let msg = "Invalid login";
                try {
                    const json = await res.json();
                    msg = json?.error || json?.message || msg;
                } catch {
                    // non-json response (HTML) — show a generic message and advise checking server logs
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
        <div className="login-container" style={{ padding: 40 }}>
            <h1>Login</h1>
            <form onSubmit={handleSubmit} className="login-form">
                {error && <p className="error">{error}</p>}

                <label htmlFor="username">Username</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="username"
                />

                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="password"
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Log In"}
                </button>
            </form>
        </div>
    );
}
