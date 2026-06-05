// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { notifyTelegram } from "./notify";
import type { LeadPayload } from "../src/core/lead";

const lead: LeadPayload = {
  name: "Тест",
  phone: "87011234567",
  cost: 25_000_000,
  downPayment: 5_000_000,
  programId: "7-20-25",
  programName: "7-20-25",
  annualRatePercent: 7,
  termMonths: 300,
  monthlyPayment: 141_356,
  source: "site",
  consent: true,
};

describe("notifyTelegram", () => {
  beforeEach(() => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
  });
  afterEach(() => vi.unstubAllGlobals());

  it("is a no-op when not configured", async () => {
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    await notifyTelegram(lead);
    expect(f).not.toHaveBeenCalled();
  });

  it("posts to the Telegram API when configured", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "tok";
    process.env.TELEGRAM_CHAT_ID = "123";
    const f = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", f);
    await notifyTelegram(lead);
    expect(f).toHaveBeenCalledWith(
      "https://api.telegram.org/bottok/sendMessage",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
