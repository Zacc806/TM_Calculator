import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import seed from "../data/programs.seed.json";

// Default fetch stub: return the seed programs config so usePrograms resolves
// cleanly in tests (no network, no fallback warnings). Tests can override per case.
globalThis.fetch = vi.fn(
  async () =>
    new Response(JSON.stringify(seed), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
) as unknown as typeof fetch;
