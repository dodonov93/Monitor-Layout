import { ensureSchema } from "@/lib/db";
import { ensureAdmin } from "@/lib/seed";

let ready: Promise<void> | null = null;

export function ensureReady() {
  if (!ready) {
    ready = (async () => {
      await ensureSchema();
      await ensureAdmin();
    })();
  }
  return ready;
}