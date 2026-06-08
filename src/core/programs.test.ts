import { describe, it, expect } from "vitest";
import { isProgram, isProgramsConfig, localizeProgram } from "./programs";
import type { Program } from "./programs.types";
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

  it("accepts a valid i18n block and rejects a malformed one", () => {
    expect(isProgram({ ...validProgram, i18n: { kk: { name: "Аты" }, en: { name: "Name" } } })).toBe(true);
    expect(isProgram({ ...validProgram, i18n: { fr: { name: "Nom" } } })).toBe(false); // unsupported locale
    expect(isProgram({ ...validProgram, i18n: { en: { name: "x".repeat(500) } } })).toBe(false); // over cap
    expect(isProgram({ ...validProgram, i18n: { kk: "nope" } })).toBe(false);
  });
});

describe("localizeProgram", () => {
  const base: Program = {
    ...validProgram,
    name: "Рассрочка",
    description: "RU desc",
    conditions: "RU conditions",
    i18n: { kk: { name: "Бөліп төлеу" }, en: { name: "Installment", description: "EN desc" } },
  };

  it("returns the RU base unchanged for ru or when no i18n", () => {
    expect(localizeProgram(base, "ru").name).toBe("Рассрочка");
    const noI18n: Program = { ...validProgram, name: "Рассрочка" };
    expect(localizeProgram(noI18n, "en").name).toBe("Рассрочка");
  });

  it("overrides only the provided locale fields and falls back for the rest", () => {
    const en = localizeProgram(base, "en");
    expect(en.name).toBe("Installment");
    expect(en.description).toBe("EN desc");
    expect(en.conditions).toBe("RU conditions"); // not translated → RU fallback

    const kk = localizeProgram(base, "kk");
    expect(kk.name).toBe("Бөліп төлеу");
    expect(kk.description).toBe("RU desc"); // kk.description absent → RU fallback
  });

  it("the bundled seed carries kk+en names for every program", () => {
    for (const p of seed.programs as Program[]) {
      expect(localizeProgram(p, "kk").name).not.toBe("");
      expect(localizeProgram(p, "en").name).not.toBe("");
      expect(p.i18n?.kk?.name).toBeTruthy();
      expect(p.i18n?.en?.name).toBeTruthy();
    }
  });
});
