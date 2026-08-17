import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { GALLERIES, parseGalleryState, type GalleryId } from "@/lib/gallery";
import { galleryLayout } from "@/lib/schema";
import { getSession, isApprovedUser } from "@/lib/session";

export const runtime = "nodejs";

function isGalleryId(value: string): value is GalleryId {
  return GALLERIES.some((gallery) => gallery.id === value);
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!isApprovedUser(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const galleryId = new URL(request.url).searchParams.get("gallery");
  if (!galleryId || !isGalleryId(galleryId)) {
    return NextResponse.json({ error: "Unknown gallery" }, { status: 400 });
  }

  const row = (
    await db
      .select()
      .from(galleryLayout)
      .where(and(eq(galleryLayout.userId, session.user.id), eq(galleryLayout.galleryId, galleryId)))
      .limit(1)
  )[0];

  return NextResponse.json(parseGalleryState(row?.monitorsJson));
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!isApprovedUser(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { galleryId?: string; monitors?: unknown };
  if (!body.galleryId || !isGalleryId(body.galleryId)) {
    return NextResponse.json({ error: "Unknown gallery" }, { status: 400 });
  }

  const state = parseGalleryState(JSON.stringify({ monitors: body.monitors ?? [] }));
  const id = `${session.user.id}:${body.galleryId}`;

  await db
    .insert(galleryLayout)
    .values({
      id,
      userId: session.user.id,
      galleryId: body.galleryId,
      monitorsJson: JSON.stringify(state),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [galleryLayout.userId, galleryLayout.galleryId],
      set: {
        monitorsJson: JSON.stringify(state),
        updatedAt: new Date(),
      },
    });

  return NextResponse.json(state);
}