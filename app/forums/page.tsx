// app/forums/page.tsx
import ForumsClient from "./components/ForumsClient";
import { getForumPosts } from "@/lib/db";

export const revalidate = 60; // ISR: rebuild every 60 seconds

export default async function ForumsPage() {
  // Server-side fetch posts
  const posts = await getForumPosts(); // optionally limit rows with SQL LIMIT 50

  return (
    <div className="forums-page">
      <div className="forums-shell">
        <header className="forums-header">
          <div>
            <p className="forums-eyebrow">Community Forum</p>
            <h1 className="forums-title">Community Forum</h1>
            <p className="forums-subtitle">
              AI policy changes, new products, and concerning developments
            </p>
          </div>
          <div className="forums-actions">
            <a className="forums-primary-btn" href="#new-topic">New Topic</a>
          </div>
        </header>

        <div className="forums-toolbar">
          <div className="forums-pill-group">
            <button className="forums-pill is-active" type="button">All Posts</button>
          </div>
          <div className="forums-sort">Latest Activity</div>
        </div>

        {/* Client component takes the server-fetched posts as initial state */}
        <ForumsClient initialPosts={posts} />
      </div>
    </div>
  );
}