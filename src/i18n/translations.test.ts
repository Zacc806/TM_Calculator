import { describe, it, expect } from "vitest";
import { translations, LANGS, type Lang } from "./translations";

const LOCALES = Object.keys(translations) as Lang[];
const refKeys = Object.keys(translations.ru).sort();

describe("translations", () => {
  it("exposes every locale in LANGS and vice versa", () => {
    expect(LOCALES.sort()).toEqual(LANGS.map((l) => l.code).sort());
  });

  it.each(LOCALES)("locale '%s' has the exact same keys as ru (no missing/extra)", (lang) => {
    expect(Object.keys(translations[lang]).sort()).toEqual(refKeys);
  });

  it.each(LOCALES)("locale '%s' has no empty values", (lang) => {
    const empties = Object.entries(translations[lang])
      .filter(([, v]) => !v || !v.trim())
      .map(([k]) => k);
    expect(empties).toEqual([]);
  });
});
