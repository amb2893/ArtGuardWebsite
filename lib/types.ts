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
