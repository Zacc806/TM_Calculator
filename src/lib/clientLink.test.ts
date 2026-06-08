import { describe, it, expect } from "vitest";
import { buildClientLink } from "./clientLink";

describe("buildClientLink", () => {
  it("encodes only calculation params (no personal data)", () => {
    const url = buildClientLink(
      "https://calculator.atamuragroup.kz",
      { cost: 25_000_000, downPayment: 5_000_000, annualRatePercent: 7, termMonths: 300 },
      "7-20-25",
    );
    expect(url).toBe(
      "https://calculator.atamuragroup.kz/client?price=25000000&dp=5000000&rate=7&term=300&program=7-20-25",
    );
  });

  it("omits the program when empty", () => {
    const url = buildClientLink(
      "https://x",
      { cost: 1_000_000, downPayment: 0, annualRatePercent: 0, termMonths: 12 },
      "",
    );
    expect(url).toBe("https://x/client?price=1000000&dp=0&rate=0&term=12");
  });
});
