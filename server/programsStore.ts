import { promises as fs } from "node:fs";
import { dirname } from "node:path";
import type { ProgramsConfig } from "../src/core/programs.types";
import { isProgramsConfig } from "../src/core/programs";
import seedJson from "../src/data/programs.seed.json";

export const SEED_PROGRAMS = seedJson as ProgramsConfig;

const FILE = process.env.PROGRAMS_FILE ?? "./data/programs.json";

/** Reads the programs config from disk; falls back to the bundled seed. */
export async function readPrograms(): Promise<ProgramsConfig> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return isProgramsConfig(parsed) ? parsed : SEED_PROGRAMS;
  } catch {
    return SEED_PROGRAMS;
  }
}

/** Persists the programs config to disk (admin save). */
export async function writePrograms(config: ProgramsConfig): Promise<void> {
  await fs.mkdir(dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(config, null, 2), "utf8");
}
