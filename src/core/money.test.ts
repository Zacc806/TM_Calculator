import { describe, it, expect } from "vitest";
import { formatTenge, parseTenge, pctToAmount, amountToPct, clamp } from "./money";

const NBSP = " ";

describe("formatTenge", () => {
  it("groups thousands with a non-breaking space and appends ₸", () => {
    expect(formatTenge(12_500_000)).toBe(`12${NBSP}500${NBSP}000${NBSP}₸`);
  });

  it("formats small amounts without grouping", () => {
    expect(formatTenge(500)).toBe(`500${NBSP}₸`);
  });

  it("formats zero", () => {
    expect(formatTenge(0)).toBe(`0${NBSP}₸`);
  });
});

describe("parseTenge", () => {
  it("round-trips a formatted value", () => {
    expect(parseTenge(`12${NBSP}500${NBSP}000${NBSP}₸`)).toBe(12_500_000);
  });

  it("parses a value typed with regular spaces and a currency sign", () => {
    expect(parseTenge("12 500 000 ₸")).toBe(12_500_000);
  });

  it("returns 0 for empty or non-numeric input", () => {
    expect(parseTenge("")).toBe(0);
    expect(parseTenge("abc")).toBe(0);
  });
});

describe("pctToAmount / amountToPct", () => {
  it("converts percent of cost to an integer amount", () => {
    expect(pctToAmount(10_000_000, 20)).toBe(2_000_000);
  });

  it("converts an amount back to percent", () => {
    expect(amountToPct(10_000_000, 2_000_000)).toBe(20);
  });

  it("guards against a zero cost when computing percent", () => {
    expect(amountToPct(0, 0)).toBe(0);
  });
});

describe("clamp", () => {
  it("bounds a value to [min, max]", () => {
    expect(clamp(120, 0, 90)).toBe(90);
    expect(clamp(-5, 0, 90)).toBe(0);
    expect(clamp(45, 0, 90)).toBe(45);
  });
});
