// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { app } from "./index";
import { issueToken } from "../api/_shared/adminAuth";
import { _resetRateLimit } from "../api/_shared/ratelimit";
import type { LeadPayload } from "../src/core/lead";
import type { ProgramsConfig } from "../src/core/programs.types";

const SECRET = "test-secret-at-least-16-chars-long";
const LEADS = join(tmpdir(), `tm-it-leads-${process.pid}.jsonl`);
const PROGRAMS = join(tmpdir(), `tm-it-programs-${process.pid}.json`);
const LEADS_DIR = join(tmpdir(), `tm-it-leadsdir-${process.pid}`);

const lead: LeadPayload = {
  name: "Айбек",
  phone: "87071234567",
  cost: 25_000_000,
  downPayment: 5_000_000,
  programId: "rassrochka",
  programName: "Рассрочка застройщика",
  annualRatePercent: 0,
  termMonths: 24,
  monthlyPayment: 999_999_999, // poisoned — server must recompute and ignore this
  source: "atmosfera",
  consent: true,
};

const config: ProgramsConfig = {
  version: 3,
  updatedAt: "2026-06-08T00:00:00.000Z",
  programs: [
    { id: "rassrochka", name: "Рассрочка", ratePercent: 0, termMonths: 24, recommendedDownPaymentPercent: 30, description: "d", editable: false },
  ],
};

function post(path: string, body: unknown, headers: Record<string, string> = {}, ip = "9.9.9.9") {
  return app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip, ...headers },
    body: JSON.stringify(body),
  });
}

describe("server/index integration", () => {
  beforeEach(async () => {
    _resetRateLimit();
    process.env.ADMIN_PASSWORD = "s3cret-pass";
    process.env.ADMIN_TOKEN_SECRET = SECRET;
    process.env.LEADS_FILE = LEADS;
    process.env.PROGRAMS_FILE = PROGRAMS;
    delete process.env.BITRIX_WEBHOOK_URL;
    delete process.env.TELEGRAM_BOT_TOKEN;
    await fs.rm(LEADS, { force: true });
    await fs.rm(PROGRAMS, { force: true });
  });
  afterEach(async () => {
    vi.unstubAllGlobals();
    await fs.rm(LEADS, { force: true });
    await fs.rm(PROGRAMS, { force: true });
    await fs.rm(LEADS_DIR, { recursive: true, force: true });
  });

  it("persists a lead and recomputes the monthly payment, ignoring the client value", async () => {
    const res = await post("/api/lead", lead, {}, "1.0.0.1");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const raw = await fs.readFile(LEADS, "utf8");
    const stored = JSON.parse(raw.trim());
    expect(stored.name).toBe("Айбек");
    expect(stored.monthlyPayment).toBe(833_333); // round(20_000_000 / 24), NOT the poisoned 999_999_999
  });

  it("returns 200 and still persists when the Bitrix mirror throws (best-effort, off response path)", async () => {
    process.env.BITRIX_WEBHOOK_URL = "https://amanat.bitrix24.kz/rest/10/tok/";
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("network down"); }));
    const res = await post("/api/lead", lead, {}, "1.0.0.2");
    expect(res.status).toBe(200);
    const raw = await fs.readFile(LEADS, "utf8");
    expect(raw).toContain("Айбек");
  });

  it("rejects an invalid lead with 400 and field errors", async () => {
    const res = await post("/api/lead", { ...lead, consent: false, downPayment: lead.cost + 1 }, {}, "1.0.0.3");
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; fields: string[] };
    expect(body.error).toBe("validation");
    expect(body.fields).toContain("consent");
    expect(body.fields).toContain("downPayment");
  });

  it("returns 500 store_failed when the lead cannot be persisted", async () => {
    await fs.mkdir(LEADS_DIR, { recursive: true });
    process.env.LEADS_FILE = LEADS_DIR; // appending to a directory path throws → store_failed
    const res = await post("/api/lead", lead, {}, "1.0.0.4");
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: "store_failed" });
  });

  it("guards POST /api/programs with the admin token and writes on a valid one", async () => {
    const unauth = await post("/api/programs", config, {}, "1.0.0.5");
    expect(unauth.status).toBe(401);

    const token = issueToken(SECRET);
    const ok = await post("/api/programs", config, { Authorization: `Bearer ${token}` }, "1.0.0.6");
    expect(ok.status).toBe(200);
    const data = (await ok.json()) as { config: ProgramsConfig };
    expect(data.config.version).toBe(4); // bumped from 3
    const persisted = JSON.parse(await fs.readFile(PROGRAMS, "utf8")) as ProgramsConfig;
    expect(persisted.version).toBe(4);
  });

  it("guards GET /api/leads behind the admin token", async () => {
    expect((await app.request("/api/leads")).status).toBe(401);
    const token = issueToken(SECRET);
    const res = await app.request("/api/leads", { headers: { Authorization: `Bearer ${token}` } });
    expect(res.status).toBe(200);
    expect((await res.json()) as { ok: boolean }).toMatchObject({ ok: true });
  });

  it("issues a token on the correct admin password and 401s on a wrong one", async () => {
    const good = await post("/api/admin-auth", { password: "s3cret-pass" }, {}, "1.0.0.7");
    expect(good.status).toBe(200);
    expect((await good.json()) as { token?: string }).toHaveProperty("token");

    const bad = await post("/api/admin-auth", { password: "nope" }, {}, "1.0.0.8");
    expect(bad.status).toBe(401);
  });

  it("applies per-route frame-ancestors CSP", async () => {
    expect((await app.request("/bitrix")).headers.get("content-security-policy")).toContain("bitrix24.kz");
    expect((await app.request("/embed")).headers.get("content-security-policy")).toBe("frame-ancestors *");
    expect((await app.request("/admin")).headers.get("content-security-policy")).toBe("frame-ancestors 'self'");
  });

  it("rejects an oversized request body with 413", async () => {
    const huge = { ...lead, name: "x".repeat(300_000) };
    const res = await post("/api/lead", huge, {}, "1.0.0.9");
    expect(res.status).toBe(413);
  });
});
