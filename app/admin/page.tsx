import { redirect } from "next/navigation";
import { AdminUsers } from "@/components/admin-users";
import { getSession, isAdminUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isAdminUser(session)) redirect("/gallery");

  return <AdminUsers currentUserId={session.user.id} />;
}