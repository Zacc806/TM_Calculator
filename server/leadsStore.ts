import { promises as fs } from "node:fs";
import { dirname } from "node:path";
import type { LeadPayload } from "../src/core/lead";
import { normalizeKzPhone } from "../src/core/phone";

const FILE = process.env.LEADS_FILE ?? "./data/leads.jsonl";

/** Appends a captured lead to a JSONL file so nothing is lost without a CRM. */
export async function appendLead(lead: LeadPayload, at: string): Promise<void> {
  const record = {
    at,
    name: lead.name.trim(),
    phone: normalizeKzPhone(lead.phone) ?? lead.phone,
    cost: lead.cost,
    downPayment: lead.downPayment,
    programId: lead.programId,
    programName: lead.programName,
    annualRatePercent: lead.annualRatePercent,
    termMonths: lead.termMonths,
    monthlyPayment: lead.monthlyPayment,
    source: lead.source,
  };
  await fs.mkdir(dirname(FILE), { recursive: true });
  await fs.appendFile(FILE, JSON.stringify(record) + "\n", "utf8");
}
