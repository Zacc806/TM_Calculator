import { isValidKzPhone } from "./phone";

/** Lead submitted from the calculator. Shared by the client form and the server handler. */
export interface LeadPayload {
  name: string;
  phone: string;
  cost: number;
  downPayment: number;
  programId: string;
  programName: string;
  annualRatePercent: number;
  termMonths: number;
  monthlyPayment: number;
  /** ЖК slug or "calculator" / "embed" — where the lead came from. */
  source: string;
  /** Mandatory consent to personal-data processing (РК ПДн law). */
  consent: boolean;
}

export type LeadErrorField = "name" | "phone" | "consent" | "cost";

export interface LeadValidation {
  ok: boolean;
  errors: ReadonlyArray<LeadErrorField>;
}

export function validateLead(p: Partial<LeadPayload>): LeadValidation {
  const errors: LeadErrorField[] = [];
  if (!p.name || !p.name.trim()) errors.push("name");
  if (!p.phone || !isValidKzPhone(p.phone)) errors.push("phone");
  if (p.consent !== true) errors.push("consent");
  if (typeof p.cost !== "number" || !(p.cost > 0)) errors.push("cost");
  return { ok: errors.length === 0, errors };
}
