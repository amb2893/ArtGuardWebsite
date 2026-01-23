import { getForumPosts } from "../../lib/db";
import ForumsClient from "./components/ForumsClient";
import { ForumPost } from "../../lib/types";

export default async function ForumsPage() {
    const posts: ForumPost[] = await getForumPosts();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Forums</h1>
            <p className="mb-4">Read existing discussions or create a new one.</p>

            {/* Client component takes the server-fetched posts as initial state */}
            <ForumsClient initialPosts={posts} />
        </div>
    );
}
