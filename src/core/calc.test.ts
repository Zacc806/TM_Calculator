import { describe, it, expect } from "vitest";
import { computePayment, validateInput } from "./calc";
import type { CalcInput } from "./calc.types";

describe("computePayment — annuity (rate > 0)", () => {
  it("matches a known reference: 100 000 ₸ @ 12%/yr, 12 mo → 8 885 ₸/mo", () => {
    // Excel =PMT(0.01,12,-100000) = 8884.88 → rounds to 8885
    const r = computePayment({
      cost: 100_000,
      downPayment: 0,
      annualRatePercent: 12,
      termMonths: 12,
    });
    expect(r.monthlyPayment).toBe(8885);
    expect(r.loanAmount).toBe(100_000);
    expect(r.isZeroRate).toBe(false);
  });

  it("subtracts the down payment from the loan principal", () => {
    const r = computePayment({
      cost: 10_000_000,
      downPayment: 2_000_000,
      annualRatePercent: 18,
      termMonths: 120,
    });
    expect(r.loanAmount).toBe(8_000_000);
  });

  it("keeps the three outputs mutually consistent (no float drift)", () => {
    const inputs: CalcInput[] = [
      { cost: 25_000_000, downPayment: 5_000_000, annualRatePercent: 16.5, termMonths: 180 },
      { cost: 9_999_999, downPayment: 1_234_567, annualRatePercent: 7, termMonths: 240 },
      { cost: 42_000_000, downPayment: 0, annualRatePercent: 21, termMonths: 60 },
    ];
    for (const input of inputs) {
      const r = computePayment(input);
      expect(r.loanAmount).toBe(input.cost - input.downPayment);
      expect(r.totalToPay).toBe(r.monthlyPayment * input.termMonths);
      expect(r.overpayment).toBe(r.totalToPay - r.loanAmount);
      expect(Number.isInteger(r.monthlyPayment)).toBe(true);
    }
  });
});

describe("computePayment — zero-rate installment", () => {
  it("splits the principal into equal parts", () => {
    const r = computePayment({
      cost: 12_000_000,
      downPayment: 0,
      annualRatePercent: 0,
      termMonths: 24,
    });
    expect(r.monthlyPayment).toBe(500_000);
    expect(r.overpayment).toBe(0);
    expect(r.totalToPay).toBe(12_000_000);
    expect(r.isZeroRate).toBe(true);
  });

  it("rounds the per-month figure but reports no overpayment for an interest-free plan", () => {
    const r = computePayment({
      cost: 10_000_000,
      downPayment: 1_000_000,
      annualRatePercent: 0,
      termMonths: 7,
    });
    // 9 000 000 / 7 = 1 285 714.28 → 1 285 714 (last instalment absorbs the remainder)
    expect(r.monthlyPayment).toBe(1_285_714);
    expect(r.isZeroRate).toBe(true);
    // Interest-free => exactly the loan amount, zero overpayment regardless of rounding.
    expect(r.overpayment).toBe(0);
    expect(r.totalToPay).toBe(9_000_000);
  });
});

describe("computePayment — edge cases", () => {
  it("handles a single-month term", () => {
    const r = computePayment({
      cost: 1_000_000,
      downPayment: 0,
      annualRatePercent: 12,
      termMonths: 1,
    });
    // one month of interest: 1 000 000 * 1.01 = 1 010 000
    expect(r.monthlyPayment).toBe(1_010_000);
  });

  it("returns zero payment when the loan is fully covered by the down payment", () => {
    const r = computePayment({
      cost: 5_000_000,
      downPayment: 5_000_000,
      annualRatePercent: 18,
      termMonths: 120,
    });
    expect(r.loanAmount).toBe(0);
    expect(r.monthlyPayment).toBe(0);
    expect(r.overpayment).toBe(0);
  });

  it("never crashes and returns safe zeros for non-finite inputs", () => {
    for (const bad of [NaN, Infinity, -Infinity]) {
      const r = computePayment({ cost: 10_000_000, downPayment: 0, annualRatePercent: bad, termMonths: 120 });
      expect(Number.isFinite(r.monthlyPayment)).toBe(true);
      const r2 = computePayment({ cost: 10_000_000, downPayment: 0, annualRatePercent: 12, termMonths: bad });
      expect(Number.isFinite(r2.monthlyPayment)).toBe(true);
      expect(r2.overpayment).toBeGreaterThanOrEqual(0);
    }
  });

  it("never reports a negative overpayment, even with a zero/negative term", () => {
    const r = computePayment({ cost: 10_000_000, downPayment: 0, annualRatePercent: 12, termMonths: 0 });
    expect(r.overpayment).toBeGreaterThanOrEqual(0);
    expect(r.monthlyPayment).toBe(0);
  });

  it("treats a negative rate as zero-rate (no negative interest)", () => {
    const r = computePayment({ cost: 10_000_000, downPayment: 0, annualRatePercent: -5, termMonths: 10 });
    expect(r.isZeroRate).toBe(true);
    expect(r.overpayment).toBe(0);
  });
});

describe("validateInput", () => {
  it("accepts a valid input", () => {
    expect(validateInput({ cost: 10_000_000, downPayment: 1_000_000, annualRatePercent: 18, termMonths: 120 }).ok).toBe(true);
  });

  it("rejects a non-positive cost", () => {
    const v = validateInput({ cost: 0, downPayment: 0, annualRatePercent: 18, termMonths: 120 });
    expect(v.ok).toBe(false);
    expect(v.errors).toContainEqual({ field: "cost", code: "cost_required" });
  });

  it("rejects a down payment above the cost", () => {
    const v = validateInput({ cost: 5_000_000, downPayment: 6_000_000, annualRatePercent: 18, termMonths: 120 });
    expect(v.ok).toBe(false);
    expect(v.errors).toContainEqual({ field: "downPayment", code: "down_payment_range" });
  });

  it("rejects a term below 1 month", () => {
    const v = validateInput({ cost: 5_000_000, downPayment: 0, annualRatePercent: 18, termMonths: 0 });
    expect(v.ok).toBe(false);
    expect(v.errors).toContainEqual({ field: "termMonths", code: "term_range" });
  });

  it("rejects a negative rate", () => {
    const v = validateInput({ cost: 5_000_000, downPayment: 0, annualRatePercent: -1, termMonths: 120 });
    expect(v.ok).toBe(false);
    expect(v.errors).toContainEqual({ field: "annualRatePercent", code: "rate_negative" });
  });
});
