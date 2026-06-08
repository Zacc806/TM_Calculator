import { promises as fs } from "node:fs";
import type { FileHandle } from "node:fs/promises";
import { dirname } from "node:path";
import type { ProgramsConfig } from "../src/core/programs.types";
import { isProgramsConfig } from "../src/core/programs";
import seedJson from "../src/data/programs.seed.json";

export const SEED_PROGRAMS = seedJson as ProgramsConfig;

const programsFile = (): string => process.env.PROGRAMS_FILE ?? "./data/programs.json";

let writeSeq = 0;
// Single-process in-memory mutex: chains writes so two admin saves can never
// race on the same file (which on Windows also surfaces as an EPERM rename).
let writeLock: Promise<void> = Promise.resolve();

/**
 * Reads the programs config from disk; falls back to the bundled seed.
 * A *missing* file is the expected first-boot state (silent). A *present but
 * corrupt/invalid* file is logged loudly — otherwise the admin's configured
 * rates silently revert to seed and every customer is quoted the wrong payment.
 */
export async function readPrograms(): Promise<ProgramsConfig> {
  const file = programsFile();
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch {
    return SEED_PROGRAMS; // no file yet — expected before the first admin save
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isProgramsConfig(parsed)) return parsed;
    console.error(`[programs] ${file} is present but invalid — serving bundled seed; admin edits are NOT live until re-saved in /admin`);
  } catch (err) {
    console.error(`[programs] ${file} is corrupt JSON — serving bundled seed; admin edits are NOT live until re-saved in /admin`, err);
  }
  return SEED_PROGRAMS;
}

async function writeProgramsUnlocked(config: ProgramsConfig): Promise<void> {
  const file = programsFile();
  await fs.mkdir(dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${writeSeq++}.tmp`;
  const data = JSON.stringify(config, null, 2);
  let fh: FileHandle | undefined;
  try {
    fh = await fs.open(tmp, "w");
    await fh.writeFile(data, "utf8");
    await fh.sync(); // flush to disk so a power loss can't lose an acknowledged save
    await fh.close();
    fh = undefined;
    await fs.rename(tmp, file);
  } catch (err) {
    if (fh) await fh.close().catch(() => undefined);
    await fs.rm(tmp, { force: true });
    throw err;
  }
}

/**
 * Persists the programs config (admin save). Writes to a unique temp file then
 * renames it over the target: a reader never sees a partial file and a crash
 * mid-write can't corrupt the live pricing config (rename is atomic within a fs).
 * Writes are serialized so concurrent saves can't collide.
 */
export function writePrograms(config: ProgramsConfig): Promise<void> {
  const run = writeLock.then(() => writeProgramsUnlocked(config));
  // Keep the chain alive even if one write rejects, so later writes still run.
  writeLock = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
