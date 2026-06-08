import type { Program, ProgramsConfig } from "./programs.types";

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
    optStr(p.projects, CAP.shortText) &&
    optStr(p.bank, CAP.shortText)
  );
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
