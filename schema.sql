-- ============================
-- Database Schema for ArtGuard
-- PostgreSQL SQL File
-- ============================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS reports CASCADE;
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
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
    is_trusted    BOOLEAN NOT NULL DEFAULT FALSE,
    is_banned     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed accounts
-- All reviewer* / admin / testuser hashes resolve to the same test password.
-- trusteduser and testadmin carry their own hashes from the live deployment.
INSERT INTO accounts (username, password_hash, is_admin, is_trusted)
VALUES
    ('admin',       '$2b$10$mUo5MN1YQox3PMU/7FGmR.iwSNU0D44WcAFgkmrTNlce.9gT4htUK', TRUE,  TRUE),
    ('testuser',    '$2b$10$mUo5MN1YQox3PMU/7FGmR.iwSNU0D44WcAFgkmrTNlce.9gT4htUK', FALSE, TRUE),
    ('reviewer1',   '$2b$10$mUo5MN1YQox3PMU/7FGmR.iwSNU0D44WcAFgkmrTNlce.9gT4htUK', FALSE, TRUE),
    ('reviewer2',   '$2b$10$mUo5MN1YQox3PMU/7FGmR.iwSNU0D44WcAFgkmrTNlce.9gT4htUK', FALSE, TRUE),
    ('reviewer3',   '$2b$10$mUo5MN1YQox3PMU/7FGmR.iwSNU0D44WcAFgkmrTNlce.9gT4htUK', FALSE, TRUE),
    ('reviewer4',   '$2b$10$mUo5MN1YQox3PMU/7FGmR.iwSNU0D44WcAFgkmrTNlce.9gT4htUK', FALSE, TRUE),
    ('reviewer5',   '$2b$10$mUo5MN1YQox3PMU/7FGmR.iwSNU0D44WcAFgkmrTNlce.9gT4htUK', FALSE, TRUE),
    ('reviewer6',   '$2b$10$mUo5MN1YQox3PMU/7FGmR.iwSNU0D44WcAFgkmrTNlce.9gT4htUK', FALSE, TRUE),
    ('trusteduser', '$2b$12$DrFN6lGS9EiEdkbvXu5mHe8k1lF6svZzKB4sWvb7Wp6j1mSY/rb0S', FALSE, TRUE),
    ('testadmin',   '$2b$12$JUbUNwjJXG5m9k7/ak/zM.6gm6EljRM4OIz8kaWz6peuL8gHdRUOK', TRUE,  FALSE);

-- ============================
-- WEBSITES TABLE
-- ============================
CREATE TABLE websites (
    id           SERIAL PRIMARY KEY,
    website_name VARCHAR(255) NOT NULL,
    report_count INTEGER NOT NULL DEFAULT 0
);

INSERT INTO websites (website_name, report_count)
VALUES
    ('example.com',        3),
    ('artstealer.net',    12),
    ('artshare.io',        1),
    ('openportfolio.org',  0),
    ('aiartlab.fake',     18),
    ('creatorshub.test',   2),
    ('promptvault.xyz',    9),
    ('digitalcanvas.app',  0),
    ('scrapeart.ai',      25),
    ('fairgallery.co',     0),
    ('imageharvester.net',14),
    ('artistfirst.social', 0),
    ('modeltrainers.ai',  21),
    ('ethicalpixels.org',  0),
    ('stockbrush.fake',    6),
    ('nocreditart.com',   30),
    ('opensourceart.dev',  0);

-- ============================
-- DISCUSSION FORUM TABLE
-- ============================
CREATE TABLE discussion_forum (
    id        SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    title     VARCHAR(255) NOT NULL,
    body      TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- COMMENTS TABLE (forum)
-- ============================
CREATE TABLE comments (
    id        SERIAL PRIMARY KEY,
    post_id   INTEGER NOT NULL REFERENCES discussion_forum(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    body      TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sample forum posts
INSERT INTO discussion_forum (author_id, title, body)
VALUES
    ((SELECT id FROM accounts WHERE username = 'admin'),    'Welcome to ArtGuard',  'This is the first discussion thread in our community.'),
    ((SELECT id FROM accounts WHERE username = 'testuser'), 'NightShade UseCase',   'This is the first discussion thread in our community.');

-- ============================
-- RATINGS TABLE
-- ============================
CREATE TABLE ratings (
    id         SERIAL PRIMARY KEY,
    website_id INTEGER NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    rating     INTEGER NOT NULL CHECK (rating IN (1, -1)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(website_id, user_id)
);

-- ============================
-- RATINGS REVIEWS TABLE
-- ============================
CREATE TABLE ratings_reviews (
    id         SERIAL PRIMARY KEY,
    website_id INTEGER NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    author_id  INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    body       TEXT NOT NULL,
    tags       TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX ratings_reviews_website_idx ON ratings_reviews(website_id, created_at ASC);

-- ============================
-- ARTICLES TABLE
-- ============================
CREATE TABLE articles (
    id         SERIAL PRIMARY KEY,
    author_id  INTEGER REFERENCES accounts(id) ON DELETE SET NULL,

    title      VARCHAR(255) NOT NULL,
    blurb      TEXT NOT NULL DEFAULT '',
    body       TEXT NOT NULL,
    url        TEXT NULL,

    difficulty VARCHAR(50) NOT NULL DEFAULT 'Beginner',
    status     TEXT NOT NULL DEFAULT 'Published',

    is_published BOOLEAN   NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMP NULL,
    published_at TIMESTAMP NULL,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT articles_difficulty_check
      CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),

    CONSTRAINT articles_status_check
      CHECK (status IN ('Pending Review', 'Published'))
);

CREATE INDEX articles_published_idx ON articles(is_published, published_at DESC);
CREATE INDEX articles_author_idx    ON articles(author_id);
CREATE INDEX articles_status_idx    ON articles(status, submitted_at DESC);

-- ============================
-- ARTICLE COMMENTS TABLE
-- ============================
CREATE TABLE article_comments (
    id         SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    author_id  INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    body       TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX article_comments_article_idx ON article_comments(article_id, created_at ASC);

-- ============================
-- NOTIFICATIONS TABLE
-- ============================
CREATE TABLE notifications (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    type       TEXT NOT NULL,
    message    TEXT NOT NULL,
    article_id INTEGER NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    read_at    TIMESTAMP NULL
);

CREATE INDEX notifications_user_idx ON notifications(user_id, created_at DESC);

-- ============================
-- REPORTS TABLE
-- ============================
CREATE TABLE reports (
    id              SERIAL PRIMARY KEY,
    reporter_id     INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    content_type    TEXT NOT NULL,
    content_id      INTEGER NOT NULL,
    reason          TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'open',
    resolution_note TEXT NULL,
    resolved_by     INTEGER NULL REFERENCES accounts(id) ON DELETE SET NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    resolved_at     TIMESTAMP NULL,

    CONSTRAINT reports_content_type_check
      CHECK (content_type IN ('user', 'article', 'article_comment', 'forum_post', 'forum_comment', 'review')),

    CONSTRAINT reports_status_check
      CHECK (status IN ('open', 'resolved', 'dismissed'))
);

CREATE INDEX reports_status_idx ON reports(status, created_at DESC);

-- ============================
-- Sample Published Articles
-- ============================
INSERT INTO articles (author_id, title, blurb, body, url, difficulty, status, is_published, published_at)
VALUES
(
  (SELECT id FROM accounts WHERE username = 'admin'),
  'Opting Out of AI Training: What Actually Works in 2026',
  'A practical walkthrough of the most effective ways artists can limit AI training exposure—plus what "opt-out" can and can''t do.',
  'Artists are increasingly offered "opt-out" controls, but not all opt-outs are equal.\n\n1) Start with the platforms that host your work\nIf your portfolio lives on major social or art platforms, check their settings for AI usage/training controls. Some platforms offer a clear toggle; others bury it in account privacy or "data usage" settings. Opting out on the platform reduces future collection from that platform, but it does not reliably affect copies already scraped elsewhere.\n\n2) Use robots.txt and explicit policy pages (with realistic expectations)\nIf you control your own website, you can publish a clear policy page stating that your images may not be used for training. You can also use robots.txt rules to discourage crawling. However, robots.txt is a voluntary standard—well-behaved crawlers will respect it, but malicious or non-compliant crawlers may not.\n\n3) Add metadata and visible notices\nEmbed metadata (copyright notice, author, licensing) in exported images where possible. Also add a visible notice on your site and in image descriptions. These signals help with provenance and later enforcement, even if they don''t stop all scraping.\n\n4) Reduce exposure of high-value source files\nPost smaller images, watermarked previews, or crops for public viewing. Keep high-resolution masters behind client delivery portals, paid downloads, or private links. AI training benefits from large, clean datasets—so reducing clean, high-res access lowers risk.\n\n5) Keep a paper trail\nSave timestamps, upload logs, and original working files. If a dispute arises, documentation matters.\n\nBottom line: opt-out is helpful, but it''s only one layer. Combine platform controls, selective sharing, provenance signals, and distribution strategy for best results.',
  NULL,
  'Beginner',
  'Published',
  TRUE,
  NOW()
),
(
  (SELECT id FROM accounts WHERE username = 'admin'),
  'Watermarks, Glaze, and "Anti-Scrape" Tactics: A Reality Check',
  'Watermarks and "anti-AI" filters can raise the cost of misuse, but each comes with tradeoffs. Here''s when they help—and when they don''t.',
  'Artists have tried multiple technical defenses against AI training and copying. The key is to match the tactic to your goal.\n\n1) Visible watermarks (classic)\nPros: Discourages casual reuse, helps attribution, makes it harder to pass your work off as "uncredited."\nCons: Can be cropped or inpainted, and may reduce portfolio impact.\nBest use: Social media previews, client proofs, and any work you expect to be reposted.\n\n2) Subtle / tiled watermarks\nPros: Harder to remove cleanly; can survive resizing.\nCons: Still not impossible to remove; may show artifacts.\nBest use: Work you want to share widely but still protect from "clean" copying.\n\n3) "Glazing" / adversarial perturbation tools\nPros: Can make it harder for some models to learn style or replicate specific images.\nCons: Effectiveness depends on the training pipeline; some preprocessing may neutralize it.\nBest use: As an extra layer for widely shared images—especially if your style is frequently targeted.\n\n4) Low-res + compression strategy\nPros: Simple and surprisingly effective. Training on low quality can degrade results; it also reduces licensing value to scrapers.\nCons: Viewers can''t zoom in; may not be appropriate for all portfolios.\nBest use: Public galleries; keep high-res for paid channels.\n\n5) Access control\nPros: The strongest control: if it''s not public, it can''t be scraped as easily.\nCons: Reduces discovery.\nBest use: Sellable assets, PSDs, brushes, and print-ready files.\n\nThink in layers: provenance + access control + selective sharing beats relying on a single "magic" defense.',
  NULL,
  'Intermediate',
  'Published',
  TRUE,
  NOW()
),
(
  (SELECT id FROM accounts WHERE username = 'admin'),
  'Licensing Your Work for AI (or Explicitly Not): Clauses You Can Use',
  'If you sell commissions, prints, or digital downloads, your license can clarify AI training rights. Here are practical clause ideas.',
  'A license is your opportunity to define what buyers can do with your work—especially with digital files.\n\n1) Define "AI Training" and "Machine Learning" clearly\nAvoid ambiguity. Include a short definition that covers training, fine-tuning, dataset creation, embedding, and synthetic derivative generation.\n\n2) Add an explicit prohibition (if that''s your choice)\nExample concept: "Client may not use the Work, or any portion, for AI training, dataset creation, or model development."\n\n3) Address third-party vendors\nClients often outsource marketing or asset handling. Require that any vendors follow the same restrictions.\n\n4) Require attribution and provenance where feasible\nAsk that your name, copyright notice, and metadata remain intact. This helps with traceability.\n\n5) Consider a paid "AI rights" add-on\nSome artists offer separate pricing if a client wants ML rights. If you choose to offer it, spell out scope:\n- Which model(s)?\n- For internal use only or public release?\n- Time-limited or perpetual?\n- Allowed to sublicense or not?\n\n6) Enforcement + remedies\nState that violating AI restrictions is a material breach and can trigger termination of the license.\n\nThis doesn''t stop scraping, but it strengthens your position in commercial work and reduces accidental misuse.',
  NULL,
  'Advanced',
  'Published',
  TRUE,
  NOW()
),
(
  (SELECT id FROM accounts WHERE username = 'admin'),
  'Provenance for Artists: Metadata, Content Credentials, and Practical Habits',
  'Provenance won''t prevent every misuse, but it makes your authorship easier to prove and your work easier to track.',
  'Provenance is the "paper trail" of creation.\n\n1) Embed metadata on export\nWhen you export images, include author, copyright, and contact fields where your tools support it. For photographers and many digital workflows, IPTC fields can help.\n\n2) Keep layered/source files\nRetain PSD/Procreate/Clip Studio files and working iterations. These show process and timestamps.\n\n3) Publish creation context\nPost WIP shots, sketches, or time-lapses. Even partial process logs can establish authorship.\n\n4) Use content credentials when it fits your workflow\nSome ecosystems allow you to attach provenance data to assets. If you do, keep the "credentials" version as a master.\n\n5) Monitor usage\nSet up reverse image search routines (monthly) and keep a doc of takedown templates.\n\nProvenance won''t stop a bad actor from scraping, but it makes disputes easier to resolve, and it helps platforms and audiences identify the real creator.',
  NULL,
  'Beginner',
  'Published',
  TRUE,
  NOW()
),
(
  (SELECT id FROM accounts WHERE username = 'admin'),
  'A Takedown Playbook: What To Do When Your Art Shows Up in a Dataset',
  'If you find your work in an AI dataset or model outputs, don''t panic—document, verify, and take action methodically.',
  'When you suspect your work was used without permission, use a checklist.\n\n1) Confirm what you''re seeing\nIs it a repost, a derivative, a model output mimicking style, or your image in a dataset listing? Capture screenshots, URLs, and timestamps.\n\n2) Collect proof of authorship\nGather original files, export metadata, WIP stages, upload history, and any licensing agreements.\n\n3) Identify the responsible party\nDatasets may be mirrored. Find the "root" host or publisher, not just a random copy.\n\n4) Send the right notice to the right place\n- Hosting platform takedown forms (often fastest)\n- Dataset maintainer contact\n- Client/vendor if your work leaked through them\n\n5) Ask for removal + non-reuse\nIf possible, request removal from the dataset and a commitment not to re-add it. Some organizations provide opt-out or removal processes.\n\n6) Consider escalation\nIf the use is commercial, widespread, or tied to a company, you may want legal advice. Even a brief consultation can clarify your options.\n\n7) Future-proof\nAfter the incident, adjust distribution: lower-res previews, selective sharing, watermarks, and clearer licensing language.\n\nThe goal is to act quickly, keep records, and avoid emotionally-driven messages that weaken your position.',
  NULL,
  'Intermediate',
  'Published',
  TRUE,
  NOW()
);

-- ============================
-- Seed Ratings Reviews
-- ============================
WITH review_seed AS (
  SELECT * FROM (VALUES
    ('example.com',        'admin',     'Policy page is clear and stable. Good baseline for creators.',                              ARRAY['Trustworthy Platform','User-Friendly Policies']::TEXT[],                                      TIMESTAMP '2026-01-05 10:15:00'),
    ('example.com',        'reviewer1', 'Added clear opt-out language last month. Nice transparency update.',                         ARRAY['Opt-Out of AI Training Available','Dataset Transparency Score']::TEXT[],                       TIMESTAMP '2026-02-11 09:42:00'),
    ('example.com',        'reviewer4', 'No major policy churn lately, which is reassuring.',                                         ARRAY['User-Friendly Policies']::TEXT[],                                                             TIMESTAMP '2026-04-08 18:20:00'),

    ('artstealer.net',     'testuser',  'Heavy reports of style-copy uploads and weak takedown process.',                             ARRAY['Style Imitation Policy','DMCA Takedown History','Under-Moderation Reported']::TEXT[],          TIMESTAMP '2026-01-18 13:05:00'),
    ('artstealer.net',     'reviewer2', 'Frequent policy edits without changelog. Hard to trust enforcement.',                        ARRAY['Frequent Policy Changes','Lack of Transparency in Enforcement']::TEXT[],                       TIMESTAMP '2026-03-03 11:10:00'),
    ('artstealer.net',     'reviewer5', 'Appeals appear slow and inconsistent.',                                                      ARRAY['Appeal Process Review','Content Removal Speed (Slow)']::TEXT[],                              TIMESTAMP '2026-04-09 20:44:00'),

    ('aiartlab.fake',      'reviewer3', 'AI output is allowed but labels are inconsistent across sections.',                          ARRAY['AI Art Allowed','AI Output Not Disclosed']::TEXT[],                                           TIMESTAMP '2026-02-02 16:30:00'),
    ('aiartlab.fake',      'admin',     'Model updates are listed but training-data clarity is still limited.',                       ARRAY['Model Update / Version Change','Proof of Training Data Disclosure']::TEXT[],                  TIMESTAMP '2026-03-14 08:25:00'),
    ('aiartlab.fake',      'reviewer6', 'Moderation is mostly automated and over-flags parody content.',                              ARRAY['Automated Moderation Heavy','Over-Moderation Reported']::TEXT[],                             TIMESTAMP '2026-04-11 22:05:00'),

    ('artistfirst.social', 'reviewer1', 'Strong creator-first defaults and visible attribution requirements.',                         ARRAY['Artist Credit Required','Trustworthy Platform']::TEXT[],                                      TIMESTAMP '2026-01-28 10:50:00'),
    ('artistfirst.social', 'reviewer2', 'Enforcement logs are public and easy to audit.',                                             ARRAY['Transparent Enforcement Logs','Human Moderation Present']::TEXT[],                            TIMESTAMP '2026-03-20 14:12:00'),
    ('artistfirst.social', 'testuser',  'Deletion flow worked cleanly and quickly.',                                                  ARRAY['User Data Deletion Available','Minimal Data Collection']::TEXT[],                             TIMESTAMP '2026-04-12 09:10:00'),

    ('modeltrainers.ai',   'reviewer5', 'Allows training on uploads by default unless users opt out.',                                ARRAY['Training on User Art Allowed','Opt-Out of AI Training Available']::TEXT[],                    TIMESTAMP '2026-01-12 12:00:00'),
    ('modeltrainers.ai',   'reviewer4', 'Synthetic data notes are present, revenue clarity is weaker.',                               ARRAY['Synthetic Data Usage','Revenue Transparency']::TEXT[],                                        TIMESTAMP '2026-02-26 17:35:00'),
    ('modeltrainers.ai',   'admin',     'Recent changes tightened API limits for non-enterprise users.',                              ARRAY['API Access Restricted','Monetization Policy Change']::TEXT[],                                TIMESTAMP '2026-04-07 15:18:00'),

    ('scrapeart.ai',       'reviewer6', 'Tracking and retention practices are too aggressive.',                                       ARRAY['Cross-Site Tracking','Data Retention Policy (Long)']::TEXT[],                                TIMESTAMP '2026-01-22 07:55:00'),
    ('scrapeart.ai',       'reviewer3', 'No clear statement against third-party data sales.',                                         ARRAY['Data Sold to Third Parties','Lack of Transparency in Enforcement']::TEXT[],                  TIMESTAMP '2026-03-01 19:47:00'),
    ('scrapeart.ai',       'testuser',  'Ads are heavy and personalization is default-on.',                                           ARRAY['Ads Heavy','Personalized Ads']::TEXT[],                                                       TIMESTAMP '2026-04-10 10:02:00'),

    ('ethicalpixels.org',  'reviewer2', 'Policies are straightforward and credits are enforced well.',                               ARRAY['Artist Credit Required','User-Friendly Policies']::TEXT[],                                   TIMESTAMP '2026-01-30 09:00:00'),
    ('ethicalpixels.org',  'reviewer5', 'Clear no-training pledge and short retention window.',                                       ARRAY['No Training on User Data','Data Retention Policy (Short)']::TEXT[],                          TIMESTAMP '2026-03-25 13:26:00'),
    ('ethicalpixels.org',  'admin',     'Open governance notes are a plus for developer trust.',                                      ARRAY['Developer Friendly','Open Platform']::TEXT[],                                                 TIMESTAMP '2026-04-11 08:40:00'),

    ('nocreditart.com',    'reviewer1', 'Repeated reports of missing attribution and weak removals.',                                 ARRAY['Artist Credit Missing','Content Removal Speed (Slow)']::TEXT[],                              TIMESTAMP '2026-02-08 11:55:00'),
    ('nocreditart.com',    'reviewer4', 'Account lockouts happen too often after minor disputes.',                                    ARRAY['Account Lockout Issues','Appeal Process Review']::TEXT[],                                    TIMESTAMP '2026-03-29 16:03:00'),
    ('nocreditart.com',    'reviewer6', 'Feels like a walled garden with little export portability.',                                 ARRAY['Walled Garden','User-Owned Content Allowed']::TEXT[],                                        TIMESTAMP '2026-04-12 11:45:00')
  ) AS t(website_name, username, body, tags, created_at)
)
INSERT INTO ratings_reviews (website_id, author_id, body, tags, created_at)
SELECT w.id, a.id, s.body, s.tags, s.created_at
FROM review_seed s
JOIN websites w ON LOWER(w.website_name) = LOWER(s.website_name)
JOIN accounts a ON a.username = s.username;

-- ============================
-- Seed Ratings
-- ============================
WITH rating_seed AS (
  SELECT * FROM (VALUES
    ('example.com',        'admin',     1,  TIMESTAMP '2026-01-06 09:20:00'),
    ('example.com',        'testuser',  1,  TIMESTAMP '2026-02-10 12:45:00'),
    ('example.com',        'reviewer1', 1,  TIMESTAMP '2026-02-12 10:00:00'),
    ('example.com',        'reviewer4', 1,  TIMESTAMP '2026-04-08 18:25:00'),

    ('artstealer.net',     'admin',     -1, TIMESTAMP '2026-01-17 15:30:00'),
    ('artstealer.net',     'testuser',  -1, TIMESTAMP '2026-01-19 09:50:00'),
    ('artstealer.net',     'reviewer2', -1, TIMESTAMP '2026-03-04 08:22:00'),
    ('artstealer.net',     'reviewer5', -1, TIMESTAMP '2026-04-09 20:47:00'),

    ('aiartlab.fake',      'admin',     -1, TIMESTAMP '2026-03-14 08:35:00'),
    ('aiartlab.fake',      'reviewer3', -1, TIMESTAMP '2026-02-02 16:35:00'),
    ('aiartlab.fake',      'reviewer6', -1, TIMESTAMP '2026-04-11 22:08:00'),
    ('aiartlab.fake',      'reviewer1', 1,  TIMESTAMP '2026-03-08 14:14:00'),

    ('artistfirst.social', 'admin',     1,  TIMESTAMP '2026-02-15 09:11:00'),
    ('artistfirst.social', 'testuser',  1,  TIMESTAMP '2026-04-12 09:12:00'),
    ('artistfirst.social', 'reviewer1', 1,  TIMESTAMP '2026-01-28 10:55:00'),
    ('artistfirst.social', 'reviewer2', 1,  TIMESTAMP '2026-03-20 14:15:00'),

    ('modeltrainers.ai',   'admin',     -1, TIMESTAMP '2026-04-07 15:21:00'),
    ('modeltrainers.ai',   'reviewer4', -1, TIMESTAMP '2026-02-26 17:40:00'),
    ('modeltrainers.ai',   'reviewer5', -1, TIMESTAMP '2026-01-12 12:05:00'),
    ('modeltrainers.ai',   'testuser',  1,  TIMESTAMP '2026-03-30 18:09:00'),

    ('scrapeart.ai',       'admin',     -1, TIMESTAMP '2026-03-02 09:45:00'),
    ('scrapeart.ai',       'testuser',  -1, TIMESTAMP '2026-04-10 10:05:00'),
    ('scrapeart.ai',       'reviewer3', -1, TIMESTAMP '2026-03-01 19:50:00'),
    ('scrapeart.ai',       'reviewer6', -1, TIMESTAMP '2026-01-22 08:00:00'),

    ('ethicalpixels.org',  'admin',     1,  TIMESTAMP '2026-04-11 08:43:00'),
    ('ethicalpixels.org',  'testuser',  1,  TIMESTAMP '2026-04-12 09:20:00'),
    ('ethicalpixels.org',  'reviewer2', 1,  TIMESTAMP '2026-01-30 09:05:00'),
    ('ethicalpixels.org',  'reviewer5', 1,  TIMESTAMP '2026-03-25 13:29:00'),

    ('nocreditart.com',    'admin',     -1, TIMESTAMP '2026-02-09 10:20:00'),
    ('nocreditart.com',    'testuser',  -1, TIMESTAMP '2026-04-01 11:35:00'),
    ('nocreditart.com',    'reviewer1', -1, TIMESTAMP '2026-02-08 12:00:00'),
    ('nocreditart.com',    'reviewer4', -1, TIMESTAMP '2026-03-29 16:08:00'),

    ('openportfolio.org',  'reviewer1', 1,  TIMESTAMP '2026-03-10 08:08:00'),
    ('openportfolio.org',  'reviewer2', 1,  TIMESTAMP '2026-03-11 09:09:00'),
    ('openportfolio.org',  'reviewer3', 1,  TIMESTAMP '2026-03-12 10:10:00'),

    ('digitalcanvas.app',  'reviewer4', 1,  TIMESTAMP '2026-02-21 15:15:00'),
    ('digitalcanvas.app',  'reviewer5', 1,  TIMESTAMP '2026-03-27 16:16:00'),
    ('digitalcanvas.app',  'reviewer6', 1,  TIMESTAMP '2026-04-12 07:07:00')
  ) AS t(website_name, username, rating, created_at)
),
resolved AS (
  SELECT w.id AS website_id, a.id AS user_id, r.rating, r.created_at
  FROM rating_seed r
  JOIN websites w ON LOWER(w.website_name) = LOWER(r.website_name)
  JOIN accounts a ON a.username = r.username
)
INSERT INTO ratings (website_id, user_id, rating, created_at)
SELECT website_id, user_id, rating, created_at
FROM resolved
ON CONFLICT (website_id, user_id) DO UPDATE SET
    rating     = EXCLUDED.rating,
    created_at = EXCLUDED.created_at;
