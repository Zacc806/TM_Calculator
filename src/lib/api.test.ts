import { describe, it, expect } from "vitest";
import { apiUrl } from "./api";

// In the test env VITE_API_BASE is unset, so apiUrl must fall back to "/" rather
// than producing the "undefined…" string a bare template literal would inline.
describe("apiUrl", () => {
  it("defaults to a root-relative /api path when VITE_API_BASE is unset", () => {
    expect(apiUrl("api/lead")).toBe("/api/lead");
    expect(apiUrl("api/programs")).toBe("/api/programs");
  });

  it("never yields an 'undefined' prefix", () => {
    expect(apiUrl("api/admin-auth")).not.toContain("undefined");
  });

  it("tolerates a leading slash in the path without doubling", () => {
    expect(apiUrl("/api/leads")).toBe("/api/leads");
  });
});
