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

// Forums
export async function getForumPosts() {
    const res = await pool.query(
        `SELECT f.id, f.title, f.body, f.author_id, a.username, f.created_at
         FROM discussion_forum f
         JOIN accounts a ON f.author_id = a.id
         ORDER BY f.created_at DESC`
    );
    return res.rows;
}

export async function getForumPost(postId: number) {
    const res = await pool.query(
        `SELECT f.id, f.title, f.body, f.author_id, a.username, f.created_at
         FROM discussion_forum f
         JOIN accounts a ON f.author_id = a.id
         WHERE f.id = $1`,
        [postId]
    );
    return res.rows[0];
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

// Comments
export async function getCommentsByPost(postId: number) {
    const res = await pool.query(
        `SELECT c.id, c.post_id, c.author_id, a.username, c.body, c.created_at
         FROM comments c
         JOIN accounts a ON c.author_id = a.id
         WHERE c.post_id = $1
         ORDER BY c.created_at ASC`,
        [postId]
    );
    return res.rows;
}

export async function addComment(postId: number, authorId: number, body: string) {
    const res = await pool.query(
        "INSERT INTO comments (post_id, author_id, body) VALUES ($1, $2, $3) RETURNING id, post_id, author_id, body, created_at",
        [postId, authorId, body]
    );

    // Attach username
    const comment = res.rows[0];
    const userRes = await pool.query("SELECT username FROM accounts WHERE id = $1", [authorId]);
    comment.username = userRes.rows[0]?.username ?? null;
    return comment;
}

export async function getWebsites(): Promise<Website[]> {
    const res = await pool.query("SELECT id, website_name, report_count FROM websites ORDER BY website_name ASC");
    return res.rows;
}

// Get a single website by ID
export async function getWebsite(websiteId: number) {
    const res = await pool.query(
        "SELECT id, website_name, report_count FROM websites WHERE id = $1",
        [websiteId]
    );
    return res.rows[0];
}

// Get all ratings for a website with aggregated stats
export async function getWebsiteRatings(websiteId: number) {
    const res = await pool.query(
        `SELECT 
            COUNT(CASE WHEN rating = 1 THEN 1 END) as positive_count,
            COUNT(CASE WHEN rating = -1 THEN 1 END) as negative_count,
            COUNT(*) as total_ratings
         FROM ratings 
         WHERE website_id = $1`,
        [websiteId]
    );
    return res.rows[0];
}

// Get user's rating for a specific website (if exists)
export async function getUserRating(websiteId: number, userId: number) {
    const res = await pool.query(
        "SELECT * FROM ratings WHERE website_id = $1 AND user_id = $2",
        [websiteId, userId]
    );
    return res.rows[0];
}

// Create or update a rating (upsert)
export async function createOrUpdateRating(websiteId: number, userId: number, rating: number) {
    const res = await pool.query(
        `INSERT INTO ratings (website_id, user_id, rating) 
         VALUES ($1, $2, $3)
         ON CONFLICT (website_id, user_id) 
         DO UPDATE SET rating = $3, created_at = NOW()
         RETURNING *`,
        [websiteId, userId, rating]
    );
    return res.rows[0];
}

// Increment report count
export async function incrementReport(id: number) {
    await pool.query("UPDATE websites SET report_count = report_count + 1 WHERE id = $1", [id]);
}

export { pool };
