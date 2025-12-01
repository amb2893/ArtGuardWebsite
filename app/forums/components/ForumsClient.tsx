"use client";

import React, { useState } from "react";
import { ForumPost } from "../../../lib/types";
import ForumList from "./ForumList";
import NewForumForm from "./NewForumForm";

interface Props {
    initialPosts: ForumPost[];
}

export default function ForumsClient({ initialPosts }: Props) {
    const [posts, setPosts] = useState<ForumPost[]>(initialPosts);

    function handleCreated(newPost: ForumPost) {
        // Prepend new post so it appears at the top
        setPosts((p) => [newPost, ...p]);
    }

    return (
        <div>
            <NewForumForm onCreated={handleCreated} />
            <div className="mt-6">
                <ForumList posts={posts} />
            </div>
        </div>
    );
}