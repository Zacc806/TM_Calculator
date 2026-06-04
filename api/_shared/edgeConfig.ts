import type { ProgramsConfig } from "../../src/core/programs.types";
import { isProgramsConfig } from "../../src/core/programs";

const ITEM_KEY = "programs";

/**
 * Reads the live programs config from Vercel Edge Config. Returns the provided
 * seed if Edge Config is not configured or unreachable — the calculator always
 * has working presets.
 */
export async function readProgramsConfig(
  seed: ProgramsConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<ProgramsConfig> {
  const conn = process.env.EDGE_CONFIG;
  if (!conn) return seed;
  try {
    const url = new URL(conn);
    const id = url.pathname.replace(/^\/+/, "");
    const token = url.searchParams.get("token");
    if (!id || !token) return seed;
    const res = await fetchImpl(`https://edge-config.vercel.com/${id}/item/${ITEM_KEY}?token=${token}`);
    if (!res.ok) return seed;
    const value = await res.json();
    return isProgramsConfig(value) ? value : seed;
  } catch (err) {
    console.warn("[edge-config] read failed, using seed", err);
    return seed;
  }
}

/** Upserts the programs config into Edge Config via the Vercel API. */
export async function writeProgramsConfig(
  config: ProgramsConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const id = process.env.EDGE_CONFIG_ID;
  const token = process.env.EDGE_CONFIG_WRITE_TOKEN;
  if (!id || !token) throw new Error("Edge Config write is not configured");
  const res = await fetchImpl(`https://api.vercel.com/v1/edge-config/${id}/items`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ items: [{ operation: "upsert", key: ITEM_KEY, value: config }] }),
  });
  if (!res.ok) throw new Error(`Edge Config write failed: ${res.status}`);
}
