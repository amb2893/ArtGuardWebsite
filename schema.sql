

-- ============================
-- Database Schema for ArtGuard
-- PostgreSQL SQL File
-- ============================

-- Drop tables if they already exist (optional but helpful for development)
DROP TABLE IF EXISTS article_comments CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
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
-- Additional Sample Websites
-- ============================
INSERT INTO websites (website_name, report_count)
VALUES
    ('artshare.io', 1),
    ('openportfolio.org', 0),
    ('aiartlab.fake', 18),
    ('creatorshub.test', 2),
    ('promptvault.xyz', 9),
    ('digitalcanvas.app', 0),
    ('scrapeart.ai', 25),
    ('fairgallery.co', 0),
    ('imageharvester.net', 14),
    ('artistfirst.social', 0),
    ('modeltrainers.ai', 21),
    ('ethicalpixels.org', 0),
    ('stockbrush.fake', 6),
    ('nocreditart.com', 30),
    ('opensourceart.dev', 0);

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

-- ============================
-- COMMENTS TABLE
-- ============================
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES discussion_forum(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

--  sample forum post
INSERT INTO discussion_forum (author_id, title, body)
VALUES
    (1, 'Welcome to ArtGuard', 'This is the first discussion thread in our community.'),
	(2, 'NightShade UseCa', 'This is the first discussion thread in our community.');


CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  website_id INTEGER NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating IN (1, -1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(website_id, user_id)
);

-- ============================
-- Seed Ratings (Fake Data)
-- ============================

-- Admin ratings
INSERT INTO ratings (website_id, user_id, rating)
SELECT w.id, a.id,
       CASE
           WHEN w.report_count = 0 THEN 1
           WHEN w.report_count < 5 THEN 1
           ELSE -1
       END
FROM websites w
JOIN accounts a ON a.username = 'admin'
ON CONFLICT DO NOTHING;

-- Test user ratings (more opinionated)
INSERT INTO ratings (website_id, user_id, rating)
SELECT w.id, a.id,
       CASE
           WHEN w.report_count > 10 THEN -1
           ELSE 1
       END
FROM websites w
JOIN accounts a ON a.username = 'testuser'
ON CONFLICT DO NOTHING;


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
-- ARTICLE COMMENTS TABLE
-- ============================
CREATE TABLE article_comments (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
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

