import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { validateLead, type LeadPayload } from "../src/core/lead";
import { isProgramsConfig } from "../src/core/programs";
import { bitrixCall, buildLeadFields, BitrixError } from "../api/_shared/bitrix";
import { rateLimit } from "../api/_shared/ratelimit";
import { issueToken, verifyToken, bearer, constantTimeEqual } from "../api/_shared/adminAuth";
import { readPrograms, writePrograms } from "./programsStore";

const STATIC_ROOT = process.env.STATIC_ROOT ?? "./web";
const PORT = Number(process.env.PORT ?? 3000);

function clientIp(c: Context): string {
  // Behind Caddy the rightmost X-Forwarded-For entry is the proxy-appended real
  // client IP; a client-supplied (spoofed) value sits to its left.
  const xff = c.req.header("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",");
    return parts[parts.length - 1]?.trim() || "unknown";
  }
  return "unknown";
}

const api = new Hono();
api.use(
  "*",
  cors({
    origin: process.env.ALLOWED_ORIGIN ?? "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

api.post("/lead", async (c) => {
  if (!rateLimit(`lead:${clientIp(c)}`)) return c.json({ ok: false, error: "rate_limited" }, 429);
  const body = (await c.req.json().catch(() => null)) as Partial<LeadPayload> | null;
  if (!body || typeof body !== "object") return c.json({ ok: false, error: "invalid_body" }, 400);

  const validation = validateLead(body);
  if (!validation.ok) return c.json({ ok: false, error: "validation", fields: validation.errors }, 400);

  const webhook = process.env.BITRIX_WEBHOOK_URL;
  if (!webhook || webhook.includes("<")) {
    console.error("[lead] BITRIX_WEBHOOK_URL is not configured");
    return c.json({ ok: false, error: "not_configured" }, 500);
  }
  try {
    const leadId = await bitrixCall<number>(
      "crm.lead.add",
      {
        fields: buildLeadFields(body as LeadPayload, process.env.BITRIX_SOURCE_ID ?? "WEB"),
        params: { REGISTER_SONET_EVENT: "Y" },
      },
      { webhookUrl: webhook },
    );
    return c.json({ ok: true, leadId });
  } catch (err) {
    console.error("[lead] Bitrix lead creation failed", err);
    return c.json({ ok: false, error: "bitrix_failed", code: err instanceof BitrixError ? err.code : "unknown" }, 502);
  }
});

api.get("/programs", async (c) => {
  c.header("Cache-Control", "public, max-age=30");
  return c.json(await readPrograms());
});

api.post("/programs", async (c) => {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  const token = bearer(c.req.header("authorization"));
  if (!secret || !token || !verifyToken(token, secret)) {
    return c.json({ ok: false, error: "unauthorized" }, 401);
  }
  const body = (await c.req.json().catch(() => null)) as unknown;
  if (!isProgramsConfig(body)) return c.json({ ok: false, error: "invalid_config" }, 400);
  const config = {
    version: (Number(body.version) || 0) + 1,
    updatedAt: new Date().toISOString(),
    programs: body.programs,
  };
  await writePrograms(config);
  return c.json({ ok: true, config });
});

api.post("/admin-auth", async (c) => {
  if (!rateLimit(`auth:${clientIp(c)}`, 10, 60_000)) return c.json({ ok: false, error: "rate_limited" }, 429);
  const expected = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!expected || !secret) {
    console.error("[admin-auth] ADMIN_PASSWORD / ADMIN_TOKEN_SECRET not configured");
    return c.json({ ok: false, error: "not_configured" }, 500);
  }
  const body = (await c.req.json().catch(() => null)) as { password?: unknown } | null;
  if (!body || typeof body.password !== "string" || !constantTimeEqual(body.password, expected)) {
    return c.json({ ok: false, error: "unauthorized" }, 401);
  }
  return c.json({ ok: true, token: issueToken(secret) });
});

const app = new Hono();

// Per-route framing policy (Bitrix24 deal tab / public embed).
app.use("*", async (c, next) => {
  await next();
  const p = c.req.path;
  if (p.startsWith("/bitrix")) {
    c.header("Content-Security-Policy", "frame-ancestors https://*.bitrix24.kz https://*.bitrix24.ru https://*.bitrix24.com");
  } else if (p.startsWith("/embed") || p.startsWith("/client")) {
    c.header("Content-Security-Policy", "frame-ancestors *");
  } else {
    // Default anti-clickjacking for the landing/admin/manager UI.
    c.header("Content-Security-Policy", "frame-ancestors 'self'");
  }
});

app.route("/api", api);
app.get("/healthz", (c) => c.text("ok"));

// Static assets, then SPA fallback to index.html for client-side routes.
app.use("/*", serveStatic({ root: STATIC_ROOT }));
app.get("/*", async (c) => c.html(await readFile(join(STATIC_ROOT, "index.html"), "utf8")));

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`[tm-calculator] listening on :${info.port}, static=${STATIC_ROOT}`);
});
