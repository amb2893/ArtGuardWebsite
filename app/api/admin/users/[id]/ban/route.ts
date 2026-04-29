import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../../../lib/auth";
import { isAdmin, banUser, unbanUser, deleteUserContent } from "../../../../../../lib/db";

export const runtime = "nodejs";

async function checkAdmin(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  const user = verifyToken(token);
  if (!user) return null;
  if (!(await isAdmin(user.id))) return null;
  return user;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await checkAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  if (id === admin.id) return NextResponse.json({ error: "Cannot ban yourself" }, { status: 400 });

  const ok = await banUser(id);
  if (!ok) return NextResponse.json({ error: "User not found or is an admin" }, { status: 404 });

  await deleteUserContent(id);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await checkAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const ok = await unbanUser(id);
  if (!ok) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
