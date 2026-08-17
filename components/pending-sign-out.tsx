"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export function PendingSignOut() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Waiting for approval</CardTitle>
          <CardDescription>
            Your account was created. An admin needs to approve it before you can open the PCR galleries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={async () => {
              await authClient.signOut();
              router.push("/login");
              router.refresh();
            }}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}