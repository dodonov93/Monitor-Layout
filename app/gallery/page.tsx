import { redirect } from "next/navigation";
import { GalleryWorkspace } from "@/components/gallery-workspace";
import { getSession, isAdminUser, isApprovedUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isApprovedUser(session)) redirect("/pending");

  return <GalleryWorkspace isAdmin={isAdminUser(session)} userEmail={session.user.email} />;
}