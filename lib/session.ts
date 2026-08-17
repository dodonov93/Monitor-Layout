import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ensureReady } from "@/lib/ensure-ready";

export async function getSession() {
  await ensureReady();
  return auth.api.getSession({
    headers: await headers(),
  });
}

type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;
type SessionUser = {
  role?: string | null;
  approved?: boolean | null;
};

export function isAdminUser(session: Session | null): session is Session {
  return (session?.user as SessionUser | undefined)?.role === "admin";
}

export function isApprovedUser(session: Session | null): session is Session {
  if (!session) return false;
  const user = session.user as SessionUser;
  return user.role === "admin" || Boolean(user.approved);
}