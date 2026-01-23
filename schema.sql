
-- ============================
-- Database Schema for ArtGuard
-- PostgreSQL SQL File
-- ============================

-- Drop tables if they already exist (optional but helpful for development)
DROP TABLE IF EXISTS discussion_forum CASCADE;
DROP TABLE IF EXISTS websites CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;

-- ============================
-- ACCOUNTS TABLE
-- ============================
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,   -- Store hashed passwords, not plaintext
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert two built-in accounts (example hashes, replace with real hashed passwords)
INSERT INTO accounts (username, password_hash)
VALUES
    ('admin', 'password'),
    ('testuser', 'hashed_password_2');

-- ============================
-- WEBSITES TABLE
-- ============================
CREATE TABLE websites (
    id SERIAL PRIMARY KEY,
    website_name VARCHAR(255) NOT NULL,
    report_count INTEGER DEFAULT 0
);

-- Optional sample records
INSERT INTO websites (website_name, report_count)
VALUES
    ('example.com', 3),
    ('artstealer.net', 12);

-- ============================
-- DISCUSSION FORUM TABLE
-- ============================
CREATE TABLE discussion_forum (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

--  sample forum post
INSERT INTO discussion_forum (author_id, title, body)
VALUES
    (1, 'Welcome to ArtGuard', 'This is the first discussion thread in our community.'),
	(2, 'NightShade Use Cases', 'This is a discussion about NightShade and how we can use it.');


-- Create comments table linked to discussion_forum and accounts (if not exists)
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES discussion_forum(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert example comments for existing forum posts (adjust author selection if needed)
WITH author AS (
  SELECT id AS author_id FROM accounts WHERE username = 'admin' LIMIT 1
),
fallback AS (
  SELECT id AS author_id FROM accounts LIMIT 1
),
chosen_author AS (
  SELECT COALESCE((SELECT author_id FROM author), (SELECT author_id FROM fallback)) AS author_id
),
posts AS (
  SELECT id FROM discussion_forum ORDER BY id
)
INSERT INTO comments (post_id, author_id, body)
SELECT p.id, ca.author_id, 'Example comment for post #' || p.id || '. Welcome to the discussion!'
FROM posts p
CROSS JOIN chosen_author ca;

-- ============================
-- ARTICLES TABLE
-- ============================
DROP TABLE IF EXISTS articles;

CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
	URL TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================
-- Sample articles
-- ============================
INSERT INTO articles (title, body, URL)
VALUES
    ('The Impact of AI on Modern Art', 'Artificial intelligence is reshaping how artists create, interpret, and monetize their work. This article explores both the benefits and challenges.', 'placeholder1'),
    ('Understanding Copyright in Digital Art', 'Digital art raises unique copyright issues. Learn how to protect your creations and navigate online platforms safely.','placeholder2');


UPDATE accounts SET password_hash = '$2b$10$mUo5MN1YQox3PMU/7FGmR.iwSNU0D44WcAFgkmrTNlce.9gT4htUK' WHERE username = 'admin';
	SELECT id, username, password_hash FROM accounts ORDER BY id;
SELECT * FROM accounts WHERE username = 'admin';
