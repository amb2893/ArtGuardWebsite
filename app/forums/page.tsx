"use client";

import React, { useEffect, useState } from "react";

interface Post {
    id: number;
    title: string;
    body: string;
    username: string;
}

export default function ForumsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    async function fetchPosts() {
        const res = await fetch("/api/forums");
        const data = await res.json();
        setPosts(data);
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        await fetch("/api/forums", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, body }),
        });
        setTitle("");
        setBody("");
        fetchPosts();
    }

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div>
            <h1>Discussion Forums</h1>
            <form onSubmit={handleCreate}>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
                <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Body" required />
                <button type="submit">Create Post</button>
            </form>

            {posts.map(post => (
                <div key={post.id}>
                    <h2>{post.title}</h2>
                    <p>{post.body}</p>
                    <p>By: {post.username}</p>
                </div>
            ))}
        </div>
    );
}
