

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
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert two built-in accounts (example hashes, replace with real hashed passwords)
INSERT INTO accounts (username, password_hash, is_admin)
VALUES
    ('admin', 'password', TRUE),
    ('testuser', 'hashed_password_2', FALSE);

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
-- RATINGS REVIEWS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS ratings_reviews (
  id SERIAL PRIMARY KEY,
  website_id INTEGER NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ratings_reviews_website_idx ON ratings_reviews(website_id, created_at ASC);

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
    author_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    blurb TEXT,
    body TEXT NOT NULL,
    url TEXT,
    difficulty VARCHAR(50),
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE INDEX articles_published_idx ON articles(is_published, published_at DESC);
CREATE INDEX articles_author_idx ON articles(author_id);

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

CREATE INDEX article_comments_article_idx ON article_comments(article_id, created_at ASC);

-- ============================
-- Sample articles
-- ============================
INSERT INTO articles (author_id, title, blurb, body, url, difficulty, is_published, published_at)
VALUES
(
  (SELECT id FROM accounts WHERE username='admin'),
  'Opting Out of AI Training: What Actually Works in 2026',
  'A practical walkthrough of the most effective ways artists can limit AI training exposure—plus what “opt-out” can and can’t do.',
  'Artists are increasingly offered “opt-out” controls, but not all opt-outs are equal.\n\n1) Start with the platforms that host your work\nIf your portfolio lives on major social or art platforms, check their settings for AI usage/training controls. Some platforms offer a clear toggle; others bury it in account privacy or “data usage” settings. Opting out on the platform reduces future collection from that platform, but it does not reliably affect copies already scraped elsewhere.\n\n2) Use robots.txt and explicit policy pages (with realistic expectations)\nIf you control your own website, you can publish a clear policy page stating that your images may not be used for training. You can also use robots.txt rules to discourage crawling. However, robots.txt is a voluntary standard—well-behaved crawlers will respect it, but malicious or non-compliant crawlers may not.\n\n3) Add metadata and visible notices\nEmbed metadata (copyright notice, author, licensing) in exported images where possible. Also add a visible notice on your site and in image descriptions. These signals help with provenance and later enforcement, even if they don’t stop all scraping.\n\n4) Reduce exposure of high-value source files\nPost smaller images, watermarked previews, or crops for public viewing. Keep high-resolution masters behind client delivery portals, paid downloads, or private links. AI training benefits from large, clean datasets—so reducing clean, high-res access lowers risk.\n\n5) Keep a paper trail\nSave timestamps, upload logs, and original working files. If a dispute arises, documentation matters.\n\nBottom line: opt-out is helpful, but it’s only one layer. Combine platform controls, selective sharing, provenance signals, and distribution strategy for best results.',
  NULL,
  'Beginner',
  TRUE,
  NOW()
),
(
  (SELECT id FROM accounts WHERE username='admin'),
  'Watermarks, Glaze, and “Anti-Scrape” Tactics: A Reality Check',
  'Watermarks and “anti-AI” filters can raise the cost of misuse, but each comes with tradeoffs. Here’s when they help—and when they don’t.',
  'Artists have tried multiple technical defenses against AI training and copying. The key is to match the tactic to your goal.\n\n1) Visible watermarks (classic)\nPros: Discourages casual reuse, helps attribution, makes it harder to pass your work off as “uncredited.”\nCons: Can be cropped or inpainted, and may reduce portfolio impact.\nBest use: Social media previews, client proofs, and any work you expect to be reposted.\n\n2) Subtle / tiled watermarks\nPros: Harder to remove cleanly; can survive resizing.\nCons: Still not impossible to remove; may show artifacts.\nBest use: Work you want to share widely but still protect from “clean” copying.\n\n3) “Glazing” / adversarial perturbation tools\nPros: Can make it harder for some models to learn style or replicate specific images.\nCons: Effectiveness depends on the training pipeline; some preprocessing may neutralize it.\nBest use: As an extra layer for widely shared images—especially if your style is frequently targeted.\n\n4) Low-res + compression strategy\nPros: Simple and surprisingly effective. Training on low quality can degrade results; it also reduces licensing value to scrapers.\nCons: Viewers can’t zoom in; may not be appropriate for all portfolios.\nBest use: Public galleries; keep high-res for paid channels.\n\n5) Access control\nPros: The strongest control: if it’s not public, it can’t be scraped as easily.\nCons: Reduces discovery.\nBest use: Sellable assets, PSDs, brushes, and print-ready files.\n\nThink in layers: provenance + access control + selective sharing beats relying on a single “magic” defense.',
  NULL,
  'Intermediate',
  TRUE,
  NOW()
),
(
  (SELECT id FROM accounts WHERE username='admin'),
  'Licensing Your Work for AI (or Explicitly Not): Clauses You Can Use',
  'If you sell commissions, prints, or digital downloads, your license can clarify AI training rights. Here are practical clause ideas.',
  'A license is your opportunity to define what buyers can do with your work—especially with digital files.\n\n1) Define “AI Training” and “Machine Learning” clearly\nAvoid ambiguity. Include a short definition that covers training, fine-tuning, dataset creation, embedding, and synthetic derivative generation.\n\n2) Add an explicit prohibition (if that’s your choice)\nExample concept: “Client may not use the Work, or any portion, for AI training, dataset creation, or model development.”\n\n3) Address third-party vendors\nClients often outsource marketing or asset handling. Require that any vendors follow the same restrictions.\n\n4) Require attribution and provenance where feasible\nAsk that your name, copyright notice, and metadata remain intact. This helps with traceability.\n\n5) Consider a paid “AI rights” add-on\nSome artists offer separate pricing if a client wants ML rights. If you choose to offer it, spell out scope:\n- Which model(s)?\n- For internal use only or public release?\n- Time-limited or perpetual?\n- Allowed to sublicense or not?\n\n6) Enforcement + remedies\nState that violating AI restrictions is a material breach and can trigger termination of the license.\n\nThis doesn’t stop scraping, but it strengthens your position in commercial work and reduces accidental misuse.',
  NULL,
  'Advanced',
  TRUE,
  NOW()
),
(
  (SELECT id FROM accounts WHERE username='admin'),
  'Provenance for Artists: Metadata, Content Credentials, and Practical Habits',
  'Provenance won’t prevent every misuse, but it makes your authorship easier to prove and your work easier to track.',
  'Provenance is the “paper trail” of creation.\n\n1) Embed metadata on export\nWhen you export images, include author, copyright, and contact fields where your tools support it. For photographers and many digital workflows, IPTC fields can help.\n\n2) Keep layered/source files\nRetain PSD/Procreate/Clip Studio files and working iterations. These show process and timestamps.\n\n3) Publish creation context\nPost WIP shots, sketches, or time-lapses. Even partial process logs can establish authorship.\n\n4) Use content credentials when it fits your workflow\nSome ecosystems allow you to attach provenance data to assets. If you do, keep the “credentials” version as a master.\n\n5) Monitor usage\nSet up reverse image search routines (monthly) and keep a doc of takedown templates.\n\nProvenance won’t stop a bad actor from scraping, but it makes disputes easier to resolve, and it helps platforms and audiences identify the real creator.',
  NULL,
  'Beginner',
  TRUE,
  NOW()
),
(
  (SELECT id FROM accounts WHERE username='admin'),
  'A Takedown Playbook: What To Do When Your Art Shows Up in a Dataset',
  'If you find your work in an AI dataset or model outputs, don’t panic—document, verify, and take action methodically.',
  'When you suspect your work was used without permission, use a checklist.\n\n1) Confirm what you’re seeing\nIs it a repost, a derivative, a model output mimicking style, or your image in a dataset listing? Capture screenshots, URLs, and timestamps.\n\n2) Collect proof of authorship\nGather original files, export metadata, WIP stages, upload history, and any licensing agreements.\n\n3) Identify the responsible party\nDatasets may be mirrored. Find the “root” host or publisher, not just a random copy.\n\n4) Send the right notice to the right place\n- Hosting platform takedown forms (often fastest)\n- Dataset maintainer contact\n- Client/vendor if your work leaked through them\n\n5) Ask for removal + non-reuse\nIf possible, request removal from the dataset and a commitment not to re-add it. Some organizations provide opt-out or removal processes.\n\n6) Consider escalation\nIf the use is commercial, widespread, or tied to a company, you may want legal advice. Even a brief consultation can clarify your options.\n\n7) Future-proof\nAfter the incident, adjust distribution: lower-res previews, selective sharing, watermarks, and clearer licensing language.\n\nThe goal is to act quickly, keep records, and avoid emotionally-driven messages that weaken your position.',
  NULL,
  'Intermediate',
  TRUE,
  NOW()
);


UPDATE accounts SET password_hash = '$2b$10$mUo5MN1YQox3PMU/7FGmR.iwSNU0D44WcAFgkmrTNlce.9gT4htUK' WHERE username = 'admin';
	SELECT id, username, password_hash FROM accounts ORDER BY id;
SELECT * FROM accounts WHERE username = 'admin';