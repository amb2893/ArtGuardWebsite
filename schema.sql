-- ============================
-- Database Schema for ArtGuard
-- PostgreSQL SQL File
-- ============================

-- Drop tables (development reset)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS article_comments CASCADE;
DROP TABLE IF EXISTS articles CASCADE;

DROP TABLE IF EXISTS ratings_reviews CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;

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
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_trusted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed accounts (replace test hashes with real bcrypt hashes)
INSERT INTO accounts (username, password_hash, is_admin, is_trusted)
VALUES
    ('admin', '$2b$10$mUo5MN1YQox3PMU/7FGmR.iwSNU0D44WcAFgkmrTNlce.9gT4htUK', TRUE, TRUE),
  ('testuser', 'password', FALSE, TRUE),
  ('trend_alpha', '$2b$10$mUo5MN1YQox3PMU/7FGmR.iwSNU0D44WcAFgkmrTNlce.9gT4htUK', FALSE, FALSE),
  ('trend_beta', '$2b$10$mUo5MN1YQox3PMU/7FGmR.iwSNU0D44WcAFgkmrTNlce.9gT4htUK', FALSE, FALSE),
  ('trend_gamma', '$2b$10$mUo5MN1YQox3PMU/7FGmR.iwSNU0D44WcAFgkmrTNlce.9gT4htUK', FALSE, FALSE),
  ('trend_delta', '$2b$10$mUo5MN1YQox3PMU/7FGmR.iwSNU0D44WcAFgkmrTNlce.9gT4htUK', FALSE, FALSE),
  ('trend_epsilon', '$2b$10$mUo5MN1YQox3PMU/7FGmR.iwSNU0D44WcAFgkmrTNlce.9gT4htUK', FALSE, FALSE);

-- ============================
-- WEBSITES TABLE
-- ============================
CREATE TABLE websites (
    id SERIAL PRIMARY KEY,
    website_name VARCHAR(255) NOT NULL,
    report_count INTEGER NOT NULL DEFAULT 0
);

-- Sample records
INSERT INTO websites (website_name, report_count)
VALUES
    ('example.com', 3),
    ('artstealer.net', 12),
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
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- COMMENTS TABLE (forum)
-- ============================
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES discussion_forum(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sample forum post
INSERT INTO discussion_forum (author_id, title, body)
VALUES
    ((SELECT id FROM accounts WHERE username='admin'), 'Welcome to ArtGuard', 'This is the first discussion thread in our community.'),
    ((SELECT id FROM accounts WHERE username='testuser'), 'NightShade UseCase', 'This is the first discussion thread in our community.');

-- ============================
-- RATINGS
-- ============================
CREATE TABLE ratings (
  id SERIAL PRIMARY KEY,
  website_id INTEGER NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating IN (1, -1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(website_id, user_id)
);

-- ============================
-- RATINGS REVIEWS
-- ============================
CREATE TABLE ratings_reviews (
  id SERIAL PRIMARY KEY,
  website_id INTEGER NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX ratings_reviews_website_idx ON ratings_reviews(website_id, created_at ASC);

-- Seed ratings (optional)
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

INSERT INTO ratings (website_id, user_id, rating)
SELECT w.id, a.id,
       CASE
           WHEN w.report_count > 10 THEN -1
           ELSE 1
       END
FROM websites w
JOIN accounts a ON a.username = 'testuser'
ON CONFLICT DO NOTHING;

-- Extra backdated ratings so the per-website trend charts show month-by-month movement.
INSERT INTO ratings (website_id, user_id, rating, created_at)
VALUES
  ((SELECT id FROM websites WHERE website_name = 'example.com'), (SELECT id FROM accounts WHERE username = 'trend_alpha'), 1, NOW() - INTERVAL '5 months'),
  ((SELECT id FROM websites WHERE website_name = 'example.com'), (SELECT id FROM accounts WHERE username = 'trend_beta'), 1, NOW() - INTERVAL '4 months'),
  ((SELECT id FROM websites WHERE website_name = 'example.com'), (SELECT id FROM accounts WHERE username = 'trend_gamma'), -1, NOW() - INTERVAL '3 months'),
  ((SELECT id FROM websites WHERE website_name = 'example.com'), (SELECT id FROM accounts WHERE username = 'trend_delta'), 1, NOW() - INTERVAL '2 months'),
  ((SELECT id FROM websites WHERE website_name = 'example.com'), (SELECT id FROM accounts WHERE username = 'trend_epsilon'), 1, NOW() - INTERVAL '1 month'),
  ((SELECT id FROM websites WHERE website_name = 'artstealer.net'), (SELECT id FROM accounts WHERE username = 'trend_alpha'), -1, NOW() - INTERVAL '5 months'),
  ((SELECT id FROM websites WHERE website_name = 'artstealer.net'), (SELECT id FROM accounts WHERE username = 'trend_beta'), -1, NOW() - INTERVAL '4 months'),
  ((SELECT id FROM websites WHERE website_name = 'artstealer.net'), (SELECT id FROM accounts WHERE username = 'trend_gamma'), -1, NOW() - INTERVAL '3 months'),
  ((SELECT id FROM websites WHERE website_name = 'artstealer.net'), (SELECT id FROM accounts WHERE username = 'trend_delta'), 1, NOW() - INTERVAL '2 months'),
  ((SELECT id FROM websites WHERE website_name = 'artstealer.net'), (SELECT id FROM accounts WHERE username = 'trend_epsilon'), -1, NOW() - INTERVAL '1 month'),
  ((SELECT id FROM websites WHERE website_name = 'openportfolio.org'), (SELECT id FROM accounts WHERE username = 'trend_alpha'), 1, NOW() - INTERVAL '4 months'),
  ((SELECT id FROM websites WHERE website_name = 'openportfolio.org'), (SELECT id FROM accounts WHERE username = 'trend_beta'), 1, NOW() - INTERVAL '2 months'),
  ((SELECT id FROM websites WHERE website_name = 'openportfolio.org'), (SELECT id FROM accounts WHERE username = 'trend_gamma'), 1, NOW() - INTERVAL '15 days')
ON CONFLICT (website_id, user_id) DO NOTHING;

-- ============================
-- ARTICLES TABLE (with moderation)
-- ============================
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,

    title VARCHAR(255) NOT NULL,
    blurb TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL,
    url TEXT NULL,

    difficulty VARCHAR(50) NOT NULL DEFAULT 'Beginner',
    status TEXT NOT NULL DEFAULT 'Published',

    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMP NULL,
    published_at TIMESTAMP NULL,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT articles_difficulty_check
      CHECK (difficulty IN ('Beginner','Intermediate','Advanced')),

    CONSTRAINT articles_status_check
      CHECK (status IN ('Pending Review','Published'))
);

CREATE INDEX articles_published_idx ON articles(is_published, published_at DESC);
CREATE INDEX articles_author_idx ON articles(author_id);
CREATE INDEX articles_status_idx ON articles(status, submitted_at DESC);

-- ============================
-- ARTICLE COMMENTS TABLE
-- ============================
CREATE TABLE article_comments (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX article_comments_article_idx ON article_comments(article_id, created_at ASC);

-- ============================
-- NOTIFICATIONS TABLE
-- ============================
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  article_id INTEGER NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  read_at TIMESTAMP NULL
);

CREATE INDEX notifications_user_idx ON notifications(user_id, created_at DESC);

-- ============================
-- Sample Published Articles
-- ============================
INSERT INTO articles (author_id, title, blurb, body, url, difficulty, status, is_published, published_at)
VALUES
(
  (SELECT id FROM accounts WHERE username='admin'),
  'Opting Out of AI Training: What Actually Works in 2026',
  'A practical walkthrough of the most effective ways artists can limit AI training exposure—plus what “opt-out” can and can’t do.',
  'Artists are increasingly offered “opt-out” controls, but not all opt-outs are equal.\n\n1) Start with the platforms that host your work...\n\nBottom line: opt-out is helpful, but it’s only one layer.',
  NULL,
  'Beginner',
  'Published',
  TRUE,
  NOW()
),
(
  (SELECT id FROM accounts WHERE username='admin'),
  'Watermarks, Glaze, and “Anti-Scrape” Tactics: A Reality Check',
  'Watermarks and “anti-AI” filters can raise the cost of misuse, but each comes with tradeoffs. Here’s when they help—and when they don’t.',
  'Artists have tried multiple technical defenses against AI training and copying...\n\nThink in layers: provenance + access control + selective sharing beats relying on a single “magic” defense.',
  NULL,
  'Intermediate',
  'Published',
  TRUE,
  NOW()
),
(
  (SELECT id FROM accounts WHERE username='admin'),
  'Licensing Your Work for AI (or Explicitly Not): Clauses You Can Use',
  'If you sell commissions, prints, or digital downloads, your license can clarify AI training rights. Here are practical clause ideas.',
  'A license is your opportunity to define what buyers can do with your work—especially with digital files...\n\nThis doesn’t stop scraping, but it strengthens your position in commercial work and reduces accidental misuse.',
  NULL,
  'Advanced',
  'Published',
  TRUE,
  NOW()
);