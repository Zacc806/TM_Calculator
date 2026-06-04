import { describe, it, expect } from "vitest";
import { validateLead, type LeadPayload } from "./lead";

const base: LeadPayload = {
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

describe("validateLead", () => {
  it("accepts a complete valid lead", () => {
    expect(validateLead(base).ok).toBe(true);
  });

  it("requires a non-empty name", () => {
    expect(validateLead({ ...base, name: "   " }).errors).toContain("name");
  });

  it("requires a valid KZ phone", () => {
    expect(validateLead({ ...base, phone: "123" }).errors).toContain("phone");
  });

  it("requires consent to be true", () => {
    expect(validateLead({ ...base, consent: false }).errors).toContain("consent");
  });

  it("requires a positive cost", () => {
    expect(validateLead({ ...base, cost: 0 }).errors).toContain("cost");
  });

  it("does not throw on a non-string name (attacker JSON) and flags it", () => {
    // @ts-expect-error — runtime body is untrusted JSON
    expect(() => validateLead({ ...base, name: 123 })).not.toThrow();
    // @ts-expect-error
    expect(validateLead({ ...base, name: 123 }).errors).toContain("name");
  });

  it("does not throw on a non-string phone and flags it", () => {
    // @ts-expect-error
    expect(validateLead({ ...base, phone: { x: 1 } }).errors).toContain("phone");
  });

  it("rejects a non-finite cost", () => {
    expect(validateLead({ ...base, cost: Number.NaN }).errors).toContain("cost");
  });

  it("rejects an oversized name", () => {
    expect(validateLead({ ...base, name: "x".repeat(300) }).errors).toContain("name");
  });
});
