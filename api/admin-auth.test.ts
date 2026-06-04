// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import handler from "./admin-auth";
import { verifyToken } from "./_shared/adminAuth";
import { _resetRateLimit } from "./_shared/ratelimit";
import { createRes, makeReq } from "./_shared/testHttp";

describe("POST /api/admin-auth", () => {
  beforeEach(() => {
    _resetRateLimit();
    process.env.ADMIN_PASSWORD = "letmein";
    process.env.ADMIN_TOKEN_SECRET = "topsecret";
  });

  it("issues a valid token for the correct password", async () => {
    const cap = createRes();
    await handler(makeReq({ method: "POST", body: { password: "letmein" }, ip: "1.1.1.1" }), cap.res);
    expect(cap.statusCode()).toBe(200);
    const token = (cap.body() as { token: string }).token;
    expect(verifyToken(token, "topsecret")).toBe(true);
  });

  it("rejects a wrong password with 401", async () => {
    const cap = createRes();
    await handler(makeReq({ method: "POST", body: { password: "nope" }, ip: "2.2.2.2" }), cap.res);
    expect(cap.statusCode()).toBe(401);
  });
});
