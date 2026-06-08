// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readPrograms, writePrograms, SEED_PROGRAMS } from "./programsStore";
import type { ProgramsConfig } from "../src/core/programs.types";

const FILE = join(tmpdir(), `tm-programs-${process.pid}.json`);
const MISSING = join(tmpdir(), `tm-programs-missing-${process.pid}.json`);

const sample: ProgramsConfig = {
  version: 2,
  updatedAt: "2026-06-08T00:00:00.000Z",
  programs: [
    {
      id: "x",
      name: "X",
      ratePercent: 10,
      termMonths: 120,
      recommendedDownPaymentPercent: 20,
      description: "d",
      editable: true,
    },
  ],
};

async function tmpLeftovers(): Promise<string[]> {
  const entries = await fs.readdir(tmpdir());
  return entries.filter((f) => f.startsWith(`tm-programs-${process.pid}.json.`) && f.endsWith(".tmp"));
}

describe("programsStore", () => {
  beforeEach(async () => {
    process.env.PROGRAMS_FILE = FILE;
    await fs.rm(FILE, { force: true });
  });
  afterEach(async () => {
    await fs.rm(FILE, { force: true });
    await fs.rm(MISSING, { force: true });
    for (const f of await tmpLeftovers()) await fs.rm(join(tmpdir(), f), { force: true });
  });

  it("round-trips a config through disk", async () => {
    await writePrograms(sample);
    const read = await readPrograms();
    expect(read.version).toBe(2);
    expect(read.programs[0]?.id).toBe("x");
  });

  it("falls back to the bundled seed when the file is missing", async () => {
    process.env.PROGRAMS_FILE = MISSING;
    const read = await readPrograms();
    expect(read.programs.length).toBe(SEED_PROGRAMS.programs.length);
  });

  it("falls back to the seed (never an empty config) when the file is corrupt", async () => {
    await fs.writeFile(FILE, "{ this is not valid json", "utf8");
    const read = await readPrograms();
    expect(read.programs.length).toBe(SEED_PROGRAMS.programs.length);
  });

  it("writes atomically: concurrent writes leave a complete file and no temp leftovers", async () => {
    // Configs of differing sizes — a torn (interleaved) write would yield invalid JSON.
    await Promise.all([
      writePrograms({ ...sample, version: 3, programs: [sample.programs[0]!] }),
      writePrograms({ ...sample, version: 4, programs: [sample.programs[0]!, { ...sample.programs[0]!, id: "y" }] }),
      writePrograms({ ...sample, version: 5, programs: [sample.programs[0]!, { ...sample.programs[0]!, id: "y" }, { ...sample.programs[0]!, id: "z" }] }),
    ]);
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as ProgramsConfig; // throws (fails test) if torn/corrupt
    expect(parsed.programs.length).toBeGreaterThan(0);
    expect(await tmpLeftovers()).toEqual([]);
  });
});
