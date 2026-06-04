// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { bitrixCall, buildLeadFields, BitrixError, ZHK_FIELD } from "./bitrix";
import type { LeadPayload } from "../../src/core/lead";

const lead: LeadPayload = {
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

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("buildLeadFields", () => {
  it("maps name, normalized phone, source and the ЖК project field", () => {
    const f = buildLeadFields(lead, "WEB");
    expect(f.NAME).toBe("Айбек");
    expect(f.PHONE).toEqual([{ VALUE: "77071234567", VALUE_TYPE: "WORK" }]);
    expect(f.SOURCE_ID).toBe("WEB");
    expect(f[ZHK_FIELD]).toBe("1962");
    expect(String(f.COMMENTS)).toContain("Ежемесячный платёж");
  });

  it("omits the project field for a non-ЖК source", () => {
    const f = buildLeadFields({ ...lead, source: "calculator" }, "WEB");
    expect(f[ZHK_FIELD]).toBeUndefined();
  });
});

describe("bitrixCall", () => {
  const opts = { webhookUrl: "https://amanat.bitrix24.kz/rest/10/tok/", backoffMs: () => 0 };

  it("returns the result on success", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ result: 42 }));
    const r = await bitrixCall<number>("crm.lead.add", { fields: {} }, { ...opts, fetchImpl });
    expect(r).toBe(42);
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("builds the URL from webhook base + method.json", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ result: 1 }));
    await bitrixCall("crm.lead.add", {}, { ...opts, fetchImpl });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://amanat.bitrix24.kz/rest/10/tok/crm.lead.add.json",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("retries on HTTP 503 then succeeds", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({}, 503))
      .mockResolvedValueOnce(jsonResponse({ result: 7 }));
    const r = await bitrixCall<number>("crm.lead.add", {}, { ...opts, fetchImpl });
    expect(r).toBe(7);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("throws BitrixError on a non-retryable error", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ error: "INVALID_CREDENTIALS", error_description: "bad token" }),
    );
    await expect(
      bitrixCall("crm.lead.add", {}, { ...opts, fetchImpl, maxRetries: 1 }),
    ).rejects.toBeInstanceOf(BitrixError);
  });
});
