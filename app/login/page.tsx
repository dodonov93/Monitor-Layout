import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/gallery");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),_transparent_42%),linear-gradient(180deg,_#09090b,_#18181b)] p-6">
      <LoginForm />
    </main>
  );
}