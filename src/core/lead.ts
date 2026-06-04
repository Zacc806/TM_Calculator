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

/** Length caps for free-text fields (DoS / CRM-poisoning guard). */
export const LEAD_LIMITS = { name: 120, phone: 32 } as const;

export function validateLead(p: Partial<LeadPayload>): LeadValidation {
  const errors: LeadErrorField[] = [];
  // Body is untrusted JSON — type-check before any string/number operation.
  if (typeof p.name !== "string" || !p.name.trim() || p.name.length > LEAD_LIMITS.name) {
    errors.push("name");
  }
  if (typeof p.phone !== "string" || p.phone.length > LEAD_LIMITS.phone || !isValidKzPhone(p.phone)) {
    errors.push("phone");
  }
  if (p.consent !== true) errors.push("consent");
  if (typeof p.cost !== "number" || !Number.isFinite(p.cost) || p.cost <= 0) {
    errors.push("cost");
  }
  return { ok: errors.length === 0, errors };
}
