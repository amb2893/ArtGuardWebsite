"use client";

import Link from "next/link";
import { Website } from "@/lib/types";

interface Props {
    websites: Website[];
}

export default function WebsiteList({ websites }: Props) {
    if (websites.length === 0) {
        return <div>No websites found.</div>;
    }

    return (
        <div className="space-y-4">
            {websites.map((website) => (
                <Link key={website.id} href={`/ratings/${website.id}`} className="block">
                    <div className="p-4 border rounded hover:bg-gray-50 cursor-pointer">
                        <h3 className="text-lg font-semibold">{website.website_name}</h3>
                        <div className="text-sm text-gray-600 mt-2">
                            Reports: {website.report_count}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

