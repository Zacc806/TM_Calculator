import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useCalcQuery } from "./useQueryParams";

const wrap =
  (entries: string[]) =>
  ({ children }: { children: ReactNode }) =>
    <MemoryRouter initialEntries={entries}>{children}</MemoryRouter>;

describe("useCalcQuery", () => {
  it("parses price, zhk and program", () => {
    const { result } = renderHook(() => useCalcQuery(), {
      wrapper: wrap(["/embed?price=25000000&zhk=atmosfera&program=rassrochka"]),
    });
    expect(result.current.price).toBe(25_000_000);
    expect(result.current.zhk).toBe("atmosfera");
    expect(result.current.program).toBe("rassrochka");
  });

  it("parses client-link params dp, rate and term", () => {
    const { result } = renderHook(() => useCalcQuery(), {
      wrapper: wrap(["/client?price=25000000&dp=5000000&rate=7&term=300&program=7-20-25"]),
    });
    expect(result.current.dp).toBe(5_000_000);
    expect(result.current.rate).toBe(7);
    expect(result.current.term).toBe(300);
  });

  it("returns undefined for missing or zero params", () => {
    const { result } = renderHook(() => useCalcQuery(), { wrapper: wrap(["/embed?price=0"]) });
    expect(result.current.price).toBeUndefined();
    expect(result.current.zhk).toBeUndefined();
    expect(result.current.program).toBeUndefined();
  });
});
