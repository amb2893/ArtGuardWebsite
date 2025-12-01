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
                window.location.href = "/"; // redirect to homepage
            } else {
                const data = await res.json();
                setError(data.error || "Login failed");
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred");
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
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
                />

                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
