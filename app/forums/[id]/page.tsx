import { getForumPost, getCommentsByPost } from "../../../lib/db";
import ForumPageClient from "../components/ForumPageClient";
import { ForumPost as ForumPostType, Comment } from "../../../lib/types";

export default async function ForumPostPage({
    params,
}: {
    // params can be a Promise in the App Router, so accept either and unwrap with await
    params: Promise<{ id: string }> | { id: string };
}) {
    // unwrap params (works whether it's a Promise or an object)
    const { id } = (await params) as { id: string };
    const postId = Number(id);
    if (Number.isNaN(postId)) return <div>Invalid post id</div>;

    const post: ForumPostType | undefined = await getForumPost(postId);
    const comments: Comment[] = await getCommentsByPost(postId);

    if (!post) return <div>Post not found</div>;

    return (
        <div className="p-4">
            <ForumPageClient post={post} initialComments={comments} />
        </div>
    );
}