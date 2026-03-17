import { getForumPosts } from "../../lib/db";
import ForumsClient from "./components/ForumsClient";
import { ForumPost } from "../../lib/types";

export default async function ForumsPage() {
    const posts: ForumPost[] = await getForumPosts();

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
