// lib/db.ts
import { Pool } from "pg";
import { Website } from "./types";

const defaultLocalConnection = "postgres://postgres:password@localhost:5432/artguard";
const connectionString = process.env.DATABASE_URL ?? defaultLocalConnection;

const pool = new Pool({
  connectionString,
});

//Role check
export async function isTrusted(userId: number): Promise<boolean> {
  const res = await pool.query("SELECT is_trusted FROM accounts WHERE id = $1", [userId]);
  return Boolean(res.rows[0]?.is_trusted);
}

export async function isAdmin(userId: number): Promise<boolean> {
  const res = await pool.query("SELECT is_admin FROM accounts WHERE id = $1", [userId]);
  return Boolean(res.rows[0]?.is_admin);
}

// Articles
export async function getPublishedArticlesWithCounts() {
  const sql = `
    SELECT
      ar.id,
      ar.title,
      ar.blurb,
      ar.body,
      ar.url,
      ar.difficulty,
      ar.created_at,
      ar.published_at,
      COUNT(ac.id)::int AS comment_count
    FROM articles ar
    LEFT JOIN article_comments ac ON ac.article_id = ar.id
    WHERE ar.is_published = TRUE
    GROUP BY ar.id
    ORDER BY ar.published_at DESC NULLS LAST, ar.created_at DESC
  `.trim();

  try {
    const res = await pool.query(sql);
    return res.rows;
  } catch (err: any) {
    console.error("PG ERROR:", err.message);
    console.error("PG POSITION:", err.position);
    console.error("SQL SENT:\n" + sql);

    // If Postgres gave a character position, show the area around it:
    if (err.position) {
      const pos = Number(err.position);
      console.error("SQL AROUND POSITION:\n" + sql.slice(Math.max(0, pos - 50), pos + 50));
    }
    throw err;
  }
}

export async function getFeaturedArticles() {
  const sql = `
    WITH newest AS (
      SELECT
        ar.id,
        ar.title,
        ar.blurb,
        ar.difficulty,
        ar.published_at,
        ar.created_at,
        COUNT(ac.id)::int AS comment_count
      FROM articles ar
      LEFT JOIN article_comments ac ON ac.article_id = ar.id
      WHERE ar.is_published = TRUE
      GROUP BY ar.id
      ORDER BY ar.published_at DESC NULLS LAST, ar.created_at DESC
      LIMIT 3
    ),
    most_commented AS (
      SELECT
        ar.id,
        ar.title,
        ar.blurb,
        ar.difficulty,
        ar.published_at,
        ar.created_at,
        COUNT(ac.id)::int AS comment_count
      FROM articles ar
      LEFT JOIN article_comments ac ON ac.article_id = ar.id
      WHERE ar.is_published = TRUE
      GROUP BY ar.id
      ORDER BY COUNT(ac.id) DESC, ar.published_at DESC NULLS LAST, ar.created_at DESC
      LIMIT 3
    ),
    combined AS (
      SELECT * FROM newest
      UNION
      SELECT * FROM most_commented
    )
    SELECT *
    FROM combined
    ORDER BY comment_count DESC, published_at DESC NULLS LAST, created_at DESC
    LIMIT 3
  `;
  const res = await pool.query(sql);
  return res.rows;
}

export async function getArticleCommentsByArticle(articleId: number) {
    const res = await pool.query(
        `SELECT ac.id, ac.article_id, ac.author_id, a.username, ac.body, ac.created_at
         FROM article_comments ac
         JOIN accounts a ON ac.author_id = a.id
         WHERE ac.article_id = $1
         ORDER BY ac.created_at ASC`,
        [articleId]
    );
    return res.rows;
}

// Get a single published article (for /articles/[id])
export async function getPublishedArticleById(id: number) {
  const res = await pool.query(
    `
    SELECT id, title, blurb, body, url, difficulty, created_at, published_at
    FROM articles
    WHERE id = $1 AND is_published = TRUE
    LIMIT 1
    `,
    [id]
  );
  return res.rows[0] ?? null;
}

export async function createPublishedArticle(
  authorId: number,
  title: string,
  body: string,
  blurb: string,
  difficulty: "Beginner" | "Intermediate" | "Advanced"
) {
  const res = await pool.query(
    `
    INSERT INTO articles (author_id, title, body, blurb, difficulty, url, is_published, status, published_at, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NULL, TRUE, 'Published', NOW(), NOW(), NOW())
    RETURNING id, title, status, published_at
    `,
    [authorId, title, body, blurb, difficulty]
  );
  return res.rows[0];
}

export async function createPendingArticle(
  authorId: number,
  title: string,
  body: string,
  blurb: string,
  difficulty: "Beginner" | "Intermediate" | "Advanced"
) {
  const res = await pool.query(
    `
    INSERT INTO articles (author_id, title, body, blurb, difficulty, url, is_published, status, submitted_at, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NULL, FALSE, 'Pending Review', NOW(), NOW(), NOW())
    RETURNING id, title, status, submitted_at
    `,
    [authorId, title, body, blurb, difficulty]
  );
  return res.rows[0];
}

export async function notifyUser(userId: number, type: string, message: string, articleId: number | null) {
  await pool.query(
    `INSERT INTO notifications (user_id, type, message, article_id) VALUES ($1, $2, $3, $4)`,
    [userId, type, message, articleId]
  );
}

export async function getPendingArticles() {
  const res = await pool.query(
    `
    SELECT ar.id, ar.author_id, a.username, ar.title, ar.blurb, ar.difficulty, ar.submitted_at, ar.created_at
    FROM articles ar
    JOIN accounts a ON a.id = ar.author_id
    WHERE ar.status = 'Pending Review'
    ORDER BY ar.submitted_at DESC NULLS LAST, ar.created_at DESC
    `
  );
  return res.rows;
}

export async function getPendingArticleById(id: number) {
  const res = await pool.query(
    `
    SELECT ar.id, ar.author_id, a.username, ar.title, ar.blurb, ar.body, ar.difficulty, ar.submitted_at, ar.created_at
    FROM articles ar
    JOIN accounts a ON a.id = ar.author_id
    WHERE ar.id = $1 AND ar.status = 'Pending Review'
    LIMIT 1
    `,
    [id]
  );
  return res.rows[0] ?? null;
}

export async function approvePendingArticle(articleId: number) {
  const res = await pool.query(
    `
    UPDATE articles
    SET status = 'Published',
        is_published = TRUE,
        published_at = NOW(),
        updated_at = NOW()
    WHERE id = $1 AND status = 'Pending Review'
    RETURNING id, author_id, title
    `,
    [articleId]
  );
  return res.rows[0] ?? null;
}

export async function denyPendingArticle(articleId: number) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const found = await client.query(
      `SELECT id, author_id, title FROM articles WHERE id = $1 AND status = 'Pending Review'`,
      [articleId]
    );
    const row = found.rows[0];
    if (!row) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(`DELETE FROM articles WHERE id = $1`, [articleId]);

    await client.query("COMMIT");
    return row as { id: number; author_id: number; title: string };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function getPendingArticlesCount(): Promise<number> {
  const res = await pool.query(
    `SELECT COUNT(*)::int AS count FROM articles WHERE status = 'Pending Review'`
  );
  return res.rows[0]?.count ?? 0;
}

// Admin create draft
export async function createDraftArticle(
  authorId: number,
  title: string,
  body: string,
  blurb: string,
  difficulty: "Beginner" | "Intermediate" | "Advanced"
) {
  const res = await pool.query(
    `
    INSERT INTO articles (author_id, title, body, blurb, difficulty, url, is_published, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NULL, FALSE, NOW(), NOW())
    RETURNING id, title, blurb, difficulty, is_published, created_at
    `,
    [authorId, title, body, blurb, difficulty]
  );

  return res.rows[0];
}

// Admin publish
export async function publishArticle(articleId: number) {
  const res = await pool.query(
    `
    UPDATE articles
    SET is_published = TRUE,
        published_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, title, is_published, published_at
    `,
    [articleId]
  );
  return res.rows[0] ?? null;
}

export async function addArticleComment(articleId: number, authorId: number, body: string) {
    const res = await pool.query(
        "INSERT INTO article_comments (article_id, author_id, body) VALUES ($1, $2, $3) RETURNING id, article_id, author_id, body, created_at",
        [articleId, authorId, body]
    );

    // Attach username
    const comment = res.rows[0];
    const userRes = await pool.query("SELECT username FROM accounts WHERE id = $1", [authorId]);
    comment.username = userRes.rows[0]?.username ?? null;
    return comment;
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

// Get popular forum threads (by comment count)
export async function getPopularForumThreads(limit: number = 5) {
    const res = await pool.query(
        `SELECT 
            f.id, 
            f.title, 
            f.body, 
            f.author_id, 
            a.username, 
            f.created_at,
            COUNT(c.id)::INTEGER as comment_count
         FROM discussion_forum f
         JOIN accounts a ON f.author_id = a.id
         LEFT JOIN comments c ON c.post_id = f.id
         GROUP BY f.id, f.title, f.body, f.author_id, a.username, f.created_at
         ORDER BY comment_count DESC, f.created_at DESC
         LIMIT $1`,
        [limit]
    );
    return res.rows;
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
    const res = await pool.query(`
        SELECT 
            w.id, 
            w.website_name, 
            COALESCE(COUNT(r.id), 0)::INTEGER as report_count
        FROM websites w
        LEFT JOIN ratings r ON w.id = r.website_id
        GROUP BY w.id, w.website_name
        ORDER BY w.website_name ASC
    `);
    return res.rows;
}

// Get a single website by ID
export async function getWebsite(websiteId: number) {
    const res = await pool.query(
        `SELECT 
            w.id, 
            w.website_name, 
            COALESCE(COUNT(r.id), 0)::INTEGER as report_count
        FROM websites w
        LEFT JOIN ratings r ON w.id = r.website_id
        WHERE w.id = $1
        GROUP BY w.id, w.website_name`,
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

export async function getRecentlyRatedWebsites(): Promise<Website[]> {
    const res = await pool.query(`
        SELECT 
            w.id, 
            w.website_name, 
            COALESCE(COUNT(r.id), 0)::INTEGER as report_count,
            MAX(r.created_at) as last_rated
        FROM websites w
        INNER JOIN ratings r ON w.id = r.website_id
        GROUP BY w.id, w.website_name
        ORDER BY last_rated DESC
        LIMIT 3
    `);
    return res.rows;
}

// Get top rated websites by number of ratings (top 3)
export async function getTopRatedWebsites(): Promise<Website[]> {
    const res = await pool.query(`
        SELECT 
            w.id, 
            w.website_name, 
            COUNT(r.id)::INTEGER as report_count
        FROM websites w
        INNER JOIN ratings r ON w.id = r.website_id
        GROUP BY w.id, w.website_name
        ORDER BY report_count DESC
        LIMIT 3
    `);
    return res.rows;
}

// Get popular websites by combined ratings and reviews count
export async function getPopularWebsites(limit: number = 5) {
    const res = await pool.query(`
        SELECT 
            w.id, 
            w.website_name, 
            COALESCE(COUNT(DISTINCT r.id), 0)::INTEGER as rating_count,
            COALESCE(COUNT(DISTINCT rr.id), 0)::INTEGER as review_count,
            (COALESCE(COUNT(DISTINCT r.id), 0) + COALESCE(COUNT(DISTINCT rr.id), 0))::INTEGER as total_activity
        FROM websites w
        LEFT JOIN ratings r ON w.id = r.website_id
        LEFT JOIN ratings_reviews rr ON w.id = rr.website_id
        GROUP BY w.id, w.website_name
        HAVING (COALESCE(COUNT(DISTINCT r.id), 0) + COALESCE(COUNT(DISTINCT rr.id), 0)) > 0
        ORDER BY total_activity DESC, w.website_name ASC
        LIMIT $1
    `, [limit]);
    return res.rows;
}

// Ratings Reviews
let ratingsReviewsTableReady = false;

async function ensureRatingsReviewsTable() {
  if (ratingsReviewsTableReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ratings_reviews (
      id SERIAL PRIMARY KEY,
      website_id INTEGER NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
      author_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(
    "CREATE INDEX IF NOT EXISTS ratings_reviews_website_idx ON ratings_reviews(website_id, created_at ASC)"
  );

  ratingsReviewsTableReady = true;
}

export async function getRatingReviewsByWebsite(websiteId: number) {
  await ensureRatingsReviewsTable();

    const res = await pool.query(
        `SELECT rr.id, rr.website_id, rr.author_id, a.username, rr.body, rr.created_at
         FROM ratings_reviews rr
         JOIN accounts a ON rr.author_id = a.id
         WHERE rr.website_id = $1
         ORDER BY rr.created_at ASC`,
        [websiteId]
    );
    return res.rows;
}

export async function addRatingReview(websiteId: number, authorId: number, body: string) {
  await ensureRatingsReviewsTable();

    const res = await pool.query(
        "INSERT INTO ratings_reviews (website_id, author_id, body) VALUES ($1, $2, $3) RETURNING id, website_id, author_id, body, created_at",
        [websiteId, authorId, body]
    );

    // Attach username
    const review = res.rows[0];
    const userRes = await pool.query("SELECT username FROM accounts WHERE id = $1", [authorId]);
    review.username = userRes.rows[0]?.username ?? null;
    return review;
}

export { pool };
