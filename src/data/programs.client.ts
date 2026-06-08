import seed from "./programs.seed.json";
import type { ProgramsConfig } from "../core/programs.types";
import { apiUrl } from "../lib/api";

export const SEED_PROGRAMS = seed as ProgramsConfig;

/** Loads the live programs config; falls back to the bundled seed if the API is absent. */
export async function fetchPrograms(signal?: AbortSignal): Promise<ProgramsConfig> {
  try {
    const res = await fetch(apiUrl("api/programs"), { signal: signal ?? null });
    if (!res.ok) throw new Error(`programs responded ${res.status}`);
    return (await res.json()) as ProgramsConfig;
  } catch (err) {
    if (signal?.aborted) return SEED_PROGRAMS;
    console.warn("[programs] live config unavailable, using bundled seed", err);
    return SEED_PROGRAMS;
  }
}
