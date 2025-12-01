// lib/db.ts
import { Pool } from "pg";
import { Website } from "./types";

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "artguard",
    password: "password",
    port: 5432,
});


// Articles

export async function getArticles() {
    const res = await pool.query(
        "SELECT id, title, body, URL FROM articles ORDER BY created_at DESC"
    );
    return res.rows;
}


// Get all forum posts
export async function getForumPosts() {
    const res = await pool.query(
        `SELECT f.id, f.title, f.body, f.author_id, a.username, f.created_at
         FROM discussion_forum f
         JOIN accounts a ON f.author_id = a.id
         ORDER BY f.created_at DESC`
    );
    return res.rows;
}

// Create a forum post
export async function createForumPost(authorId: number, title: string, body: string) {
    const res = await pool.query(
        "INSERT INTO discussion_forum (author_id, title, body) VALUES ($1, $2, $3) RETURNING *",
        [authorId, title, body]
    );
    return res.rows[0];
}

// Update a forum post
export async function updateForumPost(postId: number, title: string, body: string) {
    const res = await pool.query(
        "UPDATE discussion_forum SET title=$1, body=$2 WHERE id=$3 RETURNING *",
        [title, body, postId]
    );
    return res.rows[0];
}

export async function getWebsites(): Promise<Website[]> {
    const res = await pool.query("SELECT id, website_name, report_count FROM websites ORDER BY website_name ASC");
    return res.rows;
}

// Increment report count
export async function incrementReport(id: number) {
    await pool.query("UPDATE websites SET report_count = report_count + 1 WHERE id = $1", [id]);
}


export { pool };
