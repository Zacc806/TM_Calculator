import type { Program, ProgramsConfig } from "./programs.types";

export function isProgram(v: unknown): v is Program {
  if (typeof v !== "object" || v === null) return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    p.id.length > 0 &&
    typeof p.name === "string" &&
    typeof p.ratePercent === "number" &&
    p.ratePercent >= 0 &&
    typeof p.termMonths === "number" &&
    p.termMonths >= 1 &&
    typeof p.recommendedDownPaymentPercent === "number" &&
    typeof p.description === "string" &&
    typeof p.editable === "boolean"
  );
}

export function isProgramsConfig(v: unknown): v is ProgramsConfig {
  if (typeof v !== "object" || v === null) return false;
  const c = v as Record<string, unknown>;
  return Array.isArray(c.programs) && c.programs.length > 0 && c.programs.every(isProgram);
}
