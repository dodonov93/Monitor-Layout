import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { getSession, isAdminUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!isAdminUser(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await db.select().from(user);
  return NextResponse.json(
    users
      .map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role ?? "user",
        approved: Boolean(item.approved) || item.role === "admin",
        createdAt: item.createdAt,
      }))
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt)),
  );
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!isAdminUser(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { userId?: string; approved?: boolean };
  if (!body.userId) {
    return NextResponse.json({ error: "Missing user" }, { status: 400 });
  }

  await db
    .update(user)
    .set({ approved: Boolean(body.approved), updatedAt: new Date() })
    .where(eq(user.id, body.userId));

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!isAdminUser(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing user" }, { status: 400 });
  }
  if (userId === session.user.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  await db.delete(user).where(eq(user.id, userId));
  return NextResponse.json({ ok: true });
}