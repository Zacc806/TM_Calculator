import type { Program, ProgramsConfig, ProgramText } from "./programs.types";

/** Field caps — generous enough for the real program texts, tight enough to bound payload size. */
const CAP = {
  programs: 100,
  id: 64,
  name: 200,
  description: 2000,
  longText: 10_000, // conditions / requirements
  shortText: 2000, // projects / bank
} as const;

const str = (v: unknown, max: number): boolean => typeof v === "string" && v.length <= max;
const optStr = (v: unknown, max: number): boolean => v === undefined || str(v, max);
const num = (v: unknown, min: number, max: number): boolean =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;

function isProgramText(v: unknown): boolean {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    optStr(o.name, CAP.name) &&
    optStr(o.description, CAP.description) &&
    optStr(o.conditions, CAP.longText) &&
    optStr(o.requirements, CAP.longText) &&
    optStr(o.projects, CAP.longText) &&
    optStr(o.bank, CAP.shortText) &&
    optStr(o.relevance, CAP.shortText)
  );
}

function isI18n(v: unknown): boolean {
  if (v === undefined) return true;
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  for (const key of Object.keys(o)) {
    if (key !== "kk" && key !== "en") return false;
    if (!isProgramText(o[key])) return false;
  }
  return true;
}

export function isProgram(v: unknown): v is Program {
  if (typeof v !== "object" || v === null) return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    p.id.length > 0 &&
    p.id.length <= CAP.id &&
    str(p.name, CAP.name) &&
    num(p.ratePercent, 0, 100) &&
    num(p.termMonths, 1, 600) &&
    Number.isInteger(p.termMonths) &&
    num(p.recommendedDownPaymentPercent, 0, 100) &&
    str(p.description, CAP.description) &&
    typeof p.editable === "boolean" &&
    optStr(p.conditions, CAP.longText) &&
    optStr(p.requirements, CAP.longText) &&
    optStr(p.projects, CAP.longText) &&
    optStr(p.bank, CAP.shortText) &&
    optStr(p.relevance, CAP.shortText) &&
    isI18n(p.i18n)
  );
}

/**
 * Returns the program with its text fields resolved for `lang`: any field present
 * in p.i18n[lang] replaces the RU base; everything else falls back to the base.
 */
export function localizeProgram(p: Program, lang: string): Program {
  if (lang === "ru" || !p.i18n) return p;
  const override = p.i18n[lang as "kk" | "en"] as ProgramText | undefined;
  return override ? { ...p, ...override } : p;
}

export function isProgramsConfig(v: unknown): v is ProgramsConfig {
  if (typeof v !== "object" || v === null) return false;
  const c = v as Record<string, unknown>;
  return (
    Array.isArray(c.programs) &&
    c.programs.length > 0 &&
    c.programs.length <= CAP.programs &&
    c.programs.every(isProgram)
  );
}
