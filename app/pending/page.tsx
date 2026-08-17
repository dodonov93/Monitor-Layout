import { PendingSignOut } from "@/components/pending-sign-out";
import { getSession, isApprovedUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PendingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (isApprovedUser(session)) redirect("/gallery");

  return <PendingSignOut />;
}