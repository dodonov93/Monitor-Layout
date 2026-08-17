import { redirect } from "next/navigation";
import { getSession, isApprovedUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isApprovedUser(session)) redirect("/pending");
  redirect("/gallery");
}