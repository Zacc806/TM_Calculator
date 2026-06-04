// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler from "./lead";
import { _resetRateLimit } from "./_shared/ratelimit";
import type { LeadPayload } from "../src/core/lead";

interface CapturedRes {
  res: VercelResponse;
  statusCode: () => number;
  body: () => unknown;
  headers: Record<string, string>;
}

function createRes(): CapturedRes {
  let statusCode = 0;
  let body: unknown;
  const headers: Record<string, string> = {};
  const res = {
    setHeader: (k: string, v: string | number) => {
      headers[k] = String(v);
    },
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      body = payload;
      return this;
    },
    end() {
      return this;
    },
  };
  return {
    res: res as unknown as VercelResponse,
    statusCode: () => statusCode,
    body: () => body,
    headers,
  };
}

function makeReq(over: Partial<VercelRequest> & { ip?: string }): VercelRequest {
  const { ip, ...rest } = over;
  return {
    headers: {},
    socket: { remoteAddress: ip ?? "127.0.0.1" },
    ...rest,
  } as unknown as VercelRequest;
}

const validBody: LeadPayload = {
  name: "Айбек",
  phone: "87071234567",
  cost: 25_000_000,
  downPayment: 5_000_000,
  programId: "rassrochka",
  programName: "Рассрочка застройщика",
  annualRatePercent: 0,
  termMonths: 24,
  monthlyPayment: 833_333,
  source: "atmosfera",
  consent: true,
};

describe("POST /api/lead", () => {
  beforeEach(() => {
    _resetRateLimit();
    process.env.ALLOWED_ORIGIN = "https://calc.atamura.kz";
    process.env.BITRIX_WEBHOOK_URL = "https://amanat.bitrix24.kz/rest/10/tok/";
    process.env.BITRIX_SOURCE_ID = "WEB";
  });
  afterEach(() => vi.unstubAllGlobals());

  it("answers CORS preflight with 204 and the allowed origin", async () => {
    const cap = createRes();
    await handler(makeReq({ method: "OPTIONS" }), cap.res);
    expect(cap.statusCode()).toBe(204);
    expect(cap.headers["Access-Control-Allow-Origin"]).toBe("https://calc.atamura.kz");
  });

  it("creates a lead and returns its id on a valid POST", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ result: 101 }), { status: 200 })),
    );
    const cap = createRes();
    await handler(makeReq({ method: "POST", body: validBody, ip: "1.1.1.1" }), cap.res);
    expect(cap.statusCode()).toBe(200);
    expect(cap.body()).toEqual({ ok: true, leadId: 101 });
  });

  it("rejects a missing consent with 400", async () => {
    const cap = createRes();
    await handler(
      makeReq({ method: "POST", body: { ...validBody, consent: false }, ip: "2.2.2.2" }),
      cap.res,
    );
    expect(cap.statusCode()).toBe(400);
  });

  it("rejects non-POST methods with 405", async () => {
    const cap = createRes();
    await handler(makeReq({ method: "GET", ip: "2.2.2.3" }), cap.res);
    expect(cap.statusCode()).toBe(405);
  });

  it("rate-limits a flooding IP with 429", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ result: 1 }), { status: 200 })),
    );
    for (let i = 0; i < 5; i++) {
      await handler(makeReq({ method: "POST", body: validBody, ip: "3.3.3.3" }), createRes().res);
    }
    const cap = createRes();
    await handler(makeReq({ method: "POST", body: validBody, ip: "3.3.3.3" }), cap.res);
    expect(cap.statusCode()).toBe(429);
  });

  it("returns 500 when the webhook is not configured", async () => {
    process.env.BITRIX_WEBHOOK_URL = "https://amanat.bitrix24.kz/rest/<id>/<token>/";
    const cap = createRes();
    await handler(makeReq({ method: "POST", body: validBody, ip: "4.4.4.4" }), cap.res);
    expect(cap.statusCode()).toBe(500);
  });
});
