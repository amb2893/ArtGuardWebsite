"use client";

import React, { useState } from "react";
import { ForumPost, Comment } from "../../../lib/types";
import CommentsList from "./CommentsList";
import NewCommentForm from "./NewCommentForm";

interface Props {
    post: ForumPost;
    initialComments: Comment[];
}

export default function ForumPageClient({ post, initialComments }: Props) {
    const [comments, setComments] = useState<Comment[]>(initialComments);

    function handleNewComment(c: Comment) {
        setComments((prev) => [...prev, c]);
    }

    return (
        <div>
            <div className="mb-6 p-4 border rounded">
                <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
                <p className="mb-3">{post.body}</p>
                <div className="text-sm text-gray-600">By {post.username} - {new Date(post.created_at).toLocaleString()}</div>
            </div>

            <NewCommentForm postId={post.id} onCreated={handleNewComment} />
            <div className="mt-6">
                <CommentsList comments={comments} />
            </div>
        </div>
    );
}