"use client";

import React, { useState } from "react";

export default function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        setLoading(false);

        if (res.ok) {
            alert("Login successful!");
            window.location.href = "/"; // redirect
        } else {
            const data = await res.json();
            alert("Login failed: " + data.message);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px" }}
        >
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
            </button>
        </form>
    );
}
