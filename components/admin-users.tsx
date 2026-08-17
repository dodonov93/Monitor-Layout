"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  approved: boolean;
  createdAt: string | Date;
};

export function AdminUsers({ currentUserId }: { currentUserId: string }) {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch("/api/admin/users");
    if (!response.ok) {
      setError("Could not load users.");
      return;
    }
    setUsers((await response.json()) as AdminUser[]);
  }

  useEffect(() => {
    void load();
  }, []);

  async function approve(userId: string) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, approved: true }),
    });
    await load();
  }

  async function remove(userId: string) {
    await fetch(`/api/admin/users?userId=${encodeURIComponent(userId)}`, { method: "DELETE" });
    setPendingDelete(null);
    await load();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="text-2xl font-semibold">Users</h1>
        </div>
        <Button variant="outline" onClick={() => router.push("/gallery")}>
          Back to galleries
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.role === "admin" ? <Badge>Admin</Badge> : null}
                    {item.approved ? (
                      <Badge variant="secondary">Approved</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {!item.approved ? (
                      <Button size="sm" onClick={() => void approve(item.id)}>
                        <Check />
                        Approve
                      </Button>
                    ) : null}
                    {item.id !== currentUserId ? (
                      <Button size="sm" variant="destructive" onClick={() => setPendingDelete(item)}>
                        <Trash2 />
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.email} will lose access immediately. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingDelete && void remove(pendingDelete.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}