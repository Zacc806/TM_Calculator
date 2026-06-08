import { describe, it, expect } from "vitest";
import { isProgram, isProgramsConfig } from "./programs";
import seed from "../data/programs.seed.json";

const validProgram = {
  id: "x",
  name: "X",
  ratePercent: 9,
  termMonths: 240,
  recommendedDownPaymentPercent: 20,
  description: "",
  editable: false,
};

describe("isProgram", () => {
  it("accepts a valid program", () => {
    expect(isProgram(validProgram)).toBe(true);
  });
  it("rejects missing/invalid fields", () => {
    expect(isProgram({ ...validProgram, ratePercent: "9" })).toBe(false);
    expect(isProgram({ ...validProgram, termMonths: 0 })).toBe(false);
    expect(isProgram({ ...validProgram, id: "" })).toBe(false);
    expect(isProgram(null)).toBe(false);
  });
});

describe("isProgramsConfig", () => {
  it("accepts the bundled seed", () => {
    expect(isProgramsConfig(seed)).toBe(true);
  });
  it("rejects empty or malformed configs", () => {
    expect(isProgramsConfig({ programs: [] })).toBe(false);
    expect(isProgramsConfig({ programs: [{ id: "x" }] })).toBe(false);
    expect(isProgramsConfig({})).toBe(false);
  });

  it("rejects oversized payloads (bloat guard)", () => {
    const many = { programs: Array.from({ length: 200 }, (_, i) => ({ ...validProgram, id: `p${i}` })) };
    expect(isProgramsConfig(many)).toBe(false);
    expect(isProgram({ ...validProgram, description: "x".repeat(50_000) })).toBe(false);
    expect(isProgram({ ...validProgram, ratePercent: 999 })).toBe(false);
    expect(isProgram({ ...validProgram, termMonths: 12.5 })).toBe(false);
  });
});
