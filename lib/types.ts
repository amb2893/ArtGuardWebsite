// lib/types.ts
export interface Website {
    id: number;
    website_name: string;
    report_count: number;
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
