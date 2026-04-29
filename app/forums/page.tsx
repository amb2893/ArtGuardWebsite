import Link from "next/link";

const DISCOURSE_URL = "https://artguard.discourse.group/";

export default function ForumsPage() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <section style={{ width: "100%", maxWidth: 640 }}>
        <div className="article-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{
              flexShrink: 0,
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--color-error-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                fill="none" stroke="var(--color-primary)" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </div>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 6 }}>
                Our forums are hosted on Discourse
              </h2>
              <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                The ArtGuard community forum is an external site powered by Discourse.
                Clicking the button below will take you away from ArtGuard.
              </p>
            </div>
          </div>

          <div style={{
            background: "var(--color-background)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text)" }}>
              Before you go — a few things to know:
            </p>
            <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--color-text-secondary)", lineHeight: 1.8, fontSize: "0.95rem" }}>
              <li>You will need to create a separate Discourse account to post or reply.</li>
              <li>Your ArtGuard login does not carry over.</li>
              <li>The forum is open to read without an account.</li>
            </ul>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <a
              href={DISCOURSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              Go to ArtGuard Forums
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
            <Link href="/" className="article-link">
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
