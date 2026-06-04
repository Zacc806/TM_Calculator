import type { CalcInput } from "../core/calc.types";

/**
 * Builds a shareable client link to the read-only /client view.
 * Carries only calculation parameters — never personal data.
 */
export function buildClientLink(origin: string, input: CalcInput, programId: string): string {
  const p = new URLSearchParams();
  p.set("price", String(input.cost));
  p.set("dp", String(input.downPayment));
  p.set("rate", String(input.annualRatePercent));
  p.set("term", String(input.termMonths));
  if (programId) p.set("program", programId);
  return `${origin}/client?${p.toString()}`;
}
