// lib/types.ts
export interface Website {
    id: number;
    website_name: string;
    report_count: number;
}

export interface Rating {
    id: number;
    website_id: number;
    user_id: number;
    rating: number; // 1 for positive, -1 for negative
    created_at: string;
}

export interface ForumPost {
    id: number;
    title: string;
    body: string;
    author_id: number;
    username: string;
    created_at: string;
}

export interface Comment {
    id: number;
    post_id: number;
    author_id: number;
    username?: string | null;
    body: string;
    created_at: string;
}
