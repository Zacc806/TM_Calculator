import type { VercelRequest, VercelResponse } from "@vercel/node";
import { validateLead, type LeadPayload } from "../src/core/lead";
import { applyCors } from "./_shared/cors";
import { rateLimit } from "./_shared/ratelimit";
import { bitrixCall, buildLeadFields, BitrixError } from "./_shared/bitrix";

function clientIp(req: VercelRequest): string {
  const xff = req.headers["x-forwarded-for"];
  if (Array.isArray(xff)) return xff[0] ?? "unknown";
  if (typeof xff === "string") return xff.split(",")[0]?.trim() ?? "unknown";
  return req.socket?.remoteAddress ?? "unknown";
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

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

  if (!rateLimit(`lead:${clientIp(req)}`)) {
    res.status(429).json({ ok: false, error: "rate_limited" });
    return;
  }

  const body = (typeof req.body === "string" ? safeParse(req.body) : req.body) as
    | Partial<LeadPayload>
    | null;
  if (!body || typeof body !== "object") {
    res.status(400).json({ ok: false, error: "invalid_body" });
    return;
  }

  const validation = validateLead(body);
  if (!validation.ok) {
    res.status(400).json({ ok: false, error: "validation", fields: validation.errors });
    return;
  }

  const webhookUrl = process.env.BITRIX_WEBHOOK_URL;
  if (!webhookUrl || webhookUrl.includes("<")) {
    console.error("[lead] BITRIX_WEBHOOK_URL is not configured");
    res.status(500).json({ ok: false, error: "not_configured" });
    return;
  }

  const sourceId = process.env.BITRIX_SOURCE_ID ?? "WEB";
  try {
    const leadId = await bitrixCall<number>(
      "crm.lead.add",
      { fields: buildLeadFields(body as LeadPayload, sourceId), params: { REGISTER_SONET_EVENT: "Y" } },
      { webhookUrl },
    );
    res.status(200).json({ ok: true, leadId });
  } catch (err) {
    const code = err instanceof BitrixError ? err.code : "unknown";
    console.error("[lead] Bitrix lead creation failed", err);
    res.status(502).json({ ok: false, error: "bitrix_failed", code });
  }
}
