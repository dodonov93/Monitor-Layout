import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db, ensureSchema } from "@/lib/db";
import { account, user } from "@/lib/schema";

export async function ensureAdmin() {
  await ensureSchema();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = (
    await db.select().from(user).where(eq(user.email, email)).limit(1)
  )[0];

  if (existing) {
    if (existing.role !== "admin" || !existing.approved) {
      await db
        .update(user)
        .set({ role: "admin", approved: true, updatedAt: new Date() })
        .where(eq(user.id, existing.id));
    }
    return;
  }

  const now = new Date();
  const userId = randomUUID();
  await db.insert(user).values({
    id: userId,
    name: "Admin",
    email,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
    role: "admin",
    approved: true,
  });
  await db.insert(account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: await hashPassword(password),
    createdAt: now,
    updatedAt: now,
  });
}