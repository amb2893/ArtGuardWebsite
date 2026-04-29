import { NextResponse } from "next/server";
import { getFeaturedArticles } from "../../../lib/db";

export const runtime = "nodejs";

export async function GET() {
  const articles = await getFeaturedArticles();
  return NextResponse.json(articles);
}
