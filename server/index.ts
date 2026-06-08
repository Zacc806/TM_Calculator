import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { bodyLimit } from "hono/body-limit";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { validateLead, type LeadPayload } from "../src/core/lead";
import { computePayment } from "../src/core/calc";
import { isProgramsConfig } from "../src/core/programs";
import { bitrixCall, buildLeadFields } from "../api/_shared/bitrix";
import { rateLimit } from "../api/_shared/ratelimit";
import { issueToken, verifyToken, bearer, constantTimeEqual } from "../api/_shared/adminAuth";
import { readPrograms, writePrograms } from "./programsStore";
import { appendLead, readLeads } from "./leadsStore";
import { notifyTelegram } from "./notify";

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

/** Mirrors a saved lead to Telegram + Bitrix (best-effort, off the response path). */
async function mirrorLead(lead: LeadPayload): Promise<void> {
  const tasks: Promise<unknown>[] = [notifyTelegram(lead)];
  const webhook = process.env.BITRIX_WEBHOOK_URL;
  if (webhook && !webhook.includes("<")) {
    tasks.push(
      bitrixCall<number>(
        "crm.lead.add",
        {
          fields: buildLeadFields(lead, process.env.BITRIX_SOURCE_ID ?? "WEB"),
          params: { REGISTER_SONET_EVENT: "Y" },
        },
        { webhookUrl: webhook },
      ),
    );
  }
  for (const r of await Promise.allSettled(tasks)) {
    if (r.status === "rejected") console.error("[lead] mirror failed (lead is still saved)", r.reason);
  }
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
// Cap request bodies so an oversized POST can't balloon memory before validation.
api.use("*", bodyLimit({ maxSize: 256 * 1024, onError: (c) => c.json({ ok: false, error: "too_large" }, 413) }));

api.post("/lead", async (c) => {
  if (!rateLimit(`lead:${clientIp(c)}`)) return c.json({ ok: false, error: "rate_limited" }, 429);
  const body = (await c.req.json().catch(() => null)) as Partial<LeadPayload> | null;
  if (!body || typeof body !== "object") return c.json({ ok: false, error: "invalid_body" }, 400);

  const validation = validateLead(body);
  if (!validation.ok) return c.json({ ok: false, error: "validation", fields: validation.errors }, 400);

  const lead = body as LeadPayload;
  // Never trust the client's monthlyPayment — recompute from validated inputs so a
  // tampered POST can't write a misleading figure into the store / CRM / Telegram.
  lead.monthlyPayment = computePayment({
    cost: lead.cost,
    downPayment: lead.downPayment,
    annualRatePercent: lead.annualRatePercent,
    termMonths: lead.termMonths,
  }).monthlyPayment;

  // 1) Always persist the lead — the site captures it regardless of any CRM.
  try {
    await appendLead(lead, new Date().toISOString());
  } catch (err) {
    console.error("[lead] file append failed", err);
    return c.json({ ok: false, error: "store_failed" }, 500);
  }

  // 2) Mirror to Telegram + Bitrix off the response path so a slow/unreachable
  //    third party can never stall the user's submit (lead is already saved).
  void mirrorLead(lead);

  return c.json({ ok: true });
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

api.get("/leads", async (c) => {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  const token = bearer(c.req.header("authorization"));
  if (!secret || !token || !verifyToken(token, secret)) {
    return c.json({ ok: false, error: "unauthorized" }, 401);
  }
  return c.json({ ok: true, leads: await readLeads(200) });
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

export const app = new Hono();

// Surface any unhandled handler error instead of leaking a bare 500.
app.onError((err, c) => {
  console.error("[tm-calculator] unhandled error", err);
  return c.json({ ok: false, error: "internal" }, 500);
});

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
app.get("/*", async (c) => {
  try {
    return c.html(await readFile(join(STATIC_ROOT, "index.html"), "utf8"));
  } catch (err) {
    // index.html missing/locked (e.g. mid-deploy file copy) — fail soft, not a bare 500.
    console.error("[tm-calculator] index.html unavailable", err);
    return c.text("Service starting, retry shortly", 503, { "Retry-After": "5" });
  }
});

/* v8 ignore start -- operational boot/shutdown code, exercised in production not unit tests */
/** Refuses to start on missing/placeholder admin secrets so a broken deploy never looks healthy. */
function assertConfig(): void {
  const placeholders = new Set(["", "change-me", "change-me-long-random-string"]);
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_TOKEN_SECRET ?? "";
  if (placeholders.has(password) || placeholders.has(secret)) {
    console.error("[tm-calculator] FATAL: ADMIN_PASSWORD / ADMIN_TOKEN_SECRET unset or placeholder — refusing to start");
    process.exit(1);
  }
  if (secret.length < 16) {
    console.error("[tm-calculator] FATAL: ADMIN_TOKEN_SECRET too short (need >= 16 chars)");
    process.exit(1);
  }
  if ((process.env.ALLOWED_ORIGIN ?? "*") === "*") {
    console.warn("[tm-calculator] WARNING: ALLOWED_ORIGIN is '*' (open CORS) — set it to the calculator's origin");
  }
}

// Bootstrap only when run as the server (skipped when imported by tests).
if (!process.env.VITEST) {
  assertConfig();
  const server = serve({ fetch: app.fetch, port: PORT }, (info) => {
    console.log(`[tm-calculator] listening on :${info.port}, static=${STATIC_ROOT}`);
  });
  for (const sig of ["SIGTERM", "SIGINT"] as const) {
    process.on(sig, () => {
      console.log(`[tm-calculator] ${sig} received, draining connections…`);
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 10_000).unref();
    });
  }
}
/* v8 ignore stop */
