import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "./_shared/cors";
import { rateLimit } from "./_shared/ratelimit";
import { clientIp, readJsonBody } from "./_shared/http";
import { issueToken } from "./_shared/adminAuth";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  applyCors(res, process.env.ALLOWED_ORIGIN ?? "*");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }
  if (!rateLimit(`auth:${clientIp(req)}`, 10, 60_000)) {
    res.status(429).json({ ok: false, error: "rate_limited" });
    return;
  }

  const expected = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!expected || !secret) {
    console.error("[admin-auth] ADMIN_PASSWORD / ADMIN_TOKEN_SECRET not configured");
    res.status(500).json({ ok: false, error: "not_configured" });
    return;
  }

  const body = readJsonBody(req) as { password?: unknown } | null;
  if (!body || typeof body.password !== "string" || body.password !== expected) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  res.status(200).json({ ok: true, token: issueToken(secret) });
}
