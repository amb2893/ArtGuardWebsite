import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../../../lib/auth";
import { isAdmin, setUserTrust } from "../../../../../../lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const userId = Number(idParam);
  if (Number.isNaN(userId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await isAdmin(user.id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (userId === user.id) return NextResponse.json({ error: "Cannot modify your own trust status" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const trusted = Boolean(body.trusted);

  const updated = await setUserTrust(userId, trusted);
  if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ success: true, ...updated });
}
