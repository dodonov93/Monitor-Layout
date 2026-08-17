import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { ensureReady } from "@/lib/ensure-ready";

export const runtime = "nodejs";

const handler = toNextJsHandler(auth);

async function withReady(request: Request, method: keyof typeof handler) {
  await ensureReady();
  return handler[method](request);
}

export const GET = (request: Request) => withReady(request, "GET");
export const POST = (request: Request) => withReady(request, "POST");