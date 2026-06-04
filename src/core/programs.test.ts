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
});
