// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readProgramsConfig, writeProgramsConfig } from "./edgeConfig";
import seedJson from "../../src/data/programs.seed.json";
import type { ProgramsConfig } from "../../src/core/programs.types";

const seed = seedJson as ProgramsConfig;

beforeEach(() => {
  delete process.env.EDGE_CONFIG;
  delete process.env.EDGE_CONFIG_ID;
  delete process.env.EDGE_CONFIG_WRITE_TOKEN;
});

describe("readProgramsConfig", () => {
  it("returns the seed when Edge Config is not configured", async () => {
    expect(await readProgramsConfig(seed)).toBe(seed);
  });

  it("reads and validates the config from Edge Config", async () => {
    process.env.EDGE_CONFIG = "https://edge-config.vercel.com/ecfg_x?token=tok";
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(seed), { status: 200 }));
    const r = await readProgramsConfig({ version: 0, updatedAt: "", programs: [] }, fetchImpl);
    expect(r.programs.length).toBe(seed.programs.length);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://edge-config.vercel.com/ecfg_x/item/programs?token=tok",
    );
  });

  it("falls back to the seed when the read fails", async () => {
    process.env.EDGE_CONFIG = "https://edge-config.vercel.com/ecfg_x?token=tok";
    const fetchImpl = vi.fn(async () => new Response("nope", { status: 404 }));
    expect(await readProgramsConfig(seed, fetchImpl)).toBe(seed);
  });
});

describe("writeProgramsConfig", () => {
  it("throws when write credentials are missing", async () => {
    await expect(writeProgramsConfig(seed)).rejects.toThrow();
  });

  it("PATCHes the Vercel Edge Config items API", async () => {
    process.env.EDGE_CONFIG_ID = "ecfg_x";
    process.env.EDGE_CONFIG_WRITE_TOKEN = "wtok";
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    await writeProgramsConfig(seed, fetchImpl);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.vercel.com/v1/edge-config/ecfg_x/items",
      expect.objectContaining({ method: "PATCH" }),
    );
  });
});
