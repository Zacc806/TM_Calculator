import { promises as fs } from "node:fs";
import { dirname } from "node:path";
import type { LeadPayload } from "../src/core/lead";
import { normalizeKzPhone } from "../src/core/phone";

export interface LeadRecord {
  at: string;
  name: string;
  phone: string;
  cost: number;
  downPayment: number;
  programId: string;
  programName: string;
  annualRatePercent: number;
  termMonths: number;
  monthlyPayment: number;
  source: string;
}

const leadsFile = (): string => process.env.LEADS_FILE ?? "./data/leads.jsonl";

/** Appends a captured lead to a JSONL file so nothing is lost without a CRM. */
export async function appendLead(lead: LeadPayload, at: string): Promise<void> {
  const record: LeadRecord = {
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
  const file = leadsFile();
  await fs.mkdir(dirname(file), { recursive: true });
  // Open + append + fsync so an acknowledged lead survives a power loss / crash,
  // not just a clean process exit.
  const fh = await fs.open(file, "a");
  try {
    await fh.appendFile(JSON.stringify(record) + "\n", "utf8");
    await fh.sync();
  } finally {
    await fh.close();
  }
}

/** Reads up to `limit` most-recent leads (newest first). Missing file → []. */
export async function readLeads(limit = 200): Promise<LeadRecord[]> {
  let raw: string;
  try {
    raw = await fs.readFile(leadsFile(), "utf8");
  } catch {
    return [];
  }
  const lines = raw.split("\n").filter((l) => l.trim());
  const out: LeadRecord[] = [];
  for (const line of lines) {
    try {
      out.push(JSON.parse(line) as LeadRecord);
    } catch {
      /* skip a corrupt line */
    }
  }
  return out.reverse().slice(0, limit);
}
