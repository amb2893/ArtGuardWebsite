"use client";

import { Website } from "@/lib/types";

interface Props {
    websites: Website[];
    onReport: (id: number) => void;
}

export default function WebsiteList({ websites, onReport }: Props) {
    return (
        <div>
            {websites.map((w) => (
                <div key={w.id} className="flex justify-between p-2 border-b items-center">
                    <span>{w.website_name} - {w.report_count} reports</span>
                    <button
                        onClick={() => onReport(w.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Report
                    </button>
                </div>
            ))}
        </div>
    );
}
