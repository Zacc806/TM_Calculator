// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "./programs";
import { issueToken } from "./_shared/adminAuth";
import { createRes, makeReq } from "./_shared/testHttp";
import seedJson from "../src/data/programs.seed.json";
import type { ProgramsConfig } from "../src/core/programs.types";

const seed = seedJson as ProgramsConfig;

describe("/api/programs", () => {
  beforeEach(() => {
    delete process.env.EDGE_CONFIG;
    process.env.ADMIN_TOKEN_SECRET = "s";
  });
  afterEach(() => vi.unstubAllGlobals());

  it("GET returns the seed config when Edge Config is unset", async () => {
    const cap = createRes();
    await handler(makeReq({ method: "GET" }), cap.res);
    expect(cap.statusCode()).toBe(200);
    expect((cap.body() as ProgramsConfig).programs).toHaveLength(seed.programs.length);
  });

  it("POST without a valid token is rejected with 401", async () => {
    const cap = createRes();
    await handler(makeReq({ method: "POST", body: seed }), cap.res);
    expect(cap.statusCode()).toBe(401);
  });

  it("POST with an invalid config is rejected with 400", async () => {
    const token = issueToken("s");
    const cap = createRes();
    await handler(
      makeReq({ method: "POST", headers: { authorization: `Bearer ${token}` }, body: { foo: 1 } }),
      cap.res,
    );
    expect(cap.statusCode()).toBe(400);
  });

  it("POST with a valid token writes and bumps the version", async () => {
    process.env.EDGE_CONFIG_ID = "ecfg_x";
    process.env.EDGE_CONFIG_WRITE_TOKEN = "wtok";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    const token = issueToken("s");
    const cap = createRes();
    await handler(
      makeReq({ method: "POST", headers: { authorization: `Bearer ${token}` }, body: seed }),
      cap.res,
    );
    expect(cap.statusCode()).toBe(200);
    expect((cap.body() as { config: ProgramsConfig }).config.version).toBe(seed.version + 1);
  });
});
