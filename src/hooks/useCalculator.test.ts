import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCalculator } from "./useCalculator";
import { COST_MAX, RATE_MAX_PERCENT, TERM_MAX_MONTHS } from "../data/defaults";
import type { Program } from "../core/programs.types";

const program: Program = {
  id: "ipoteka-bvu",
  name: "Стандартная ипотека БВУ",
  ratePercent: 18,
  termMonths: 240,
  recommendedDownPaymentPercent: 30,
  description: "",
  editable: false,
};

describe("useCalculator", () => {
  it("syncs the down-payment amount when percent changes", () => {
    const { result } = renderHook(() => useCalculator({ cost: 10_000_000 }));
    act(() => result.current.setDownPaymentPercent(20));
    expect(result.current.state.downPaymentAmount).toBe(2_000_000);
    expect(result.current.input.downPayment).toBe(2_000_000);
  });

  it("syncs the percent when the amount changes", () => {
    const { result } = renderHook(() => useCalculator({ cost: 10_000_000 }));
    act(() => result.current.setDownPaymentAmount(3_000_000));
    expect(Math.round(result.current.state.downPaymentPercent)).toBe(30);
  });

  it("clamps the down-payment percent to 90", () => {
    const { result } = renderHook(() => useCalculator({ cost: 10_000_000 }));
    act(() => result.current.setDownPaymentPercent(150));
    expect(result.current.state.downPaymentPercent).toBe(90);
  });

  it("clamps the down-payment amount to the 90% ceiling so %↔₸ stay consistent", () => {
    const { result } = renderHook(() => useCalculator({ cost: 10_000_000 }));
    act(() => result.current.setDownPaymentAmount(10_000_000)); // 100% typed
    expect(result.current.state.downPaymentAmount).toBe(9_000_000); // capped at 90%
    expect(Math.round(result.current.state.downPaymentPercent)).toBe(90);
  });

  it("keeps the percent anchored when cost changes", () => {
    const { result } = renderHook(() => useCalculator({ cost: 10_000_000 }));
    act(() => result.current.setDownPaymentPercent(20));
    act(() => result.current.setCost(20_000_000));
    expect(result.current.state.downPaymentAmount).toBe(4_000_000);
  });

  it("applies a program preset's rate and term but preserves the entered down payment", () => {
    const { result } = renderHook(() => useCalculator({ cost: 10_000_000 }));
    act(() => result.current.setDownPaymentPercent(50));
    act(() => result.current.applyProgram(program));
    expect(result.current.state.annualRatePercent).toBe(18);
    expect(result.current.state.termMonths).toBe(240);
    expect(result.current.state.programId).toBe("ipoteka-bvu");
    // ТЗ: only rate+term auto-fill on program select; the user's 50% stays.
    expect(result.current.state.downPaymentPercent).toBe(50);
    expect(result.current.input.downPayment).toBe(5_000_000);
  });

  it("switches to the custom program when the rate is hand-edited", () => {
    const { result } = renderHook(() => useCalculator({ cost: 10_000_000 }));
    act(() => result.current.applyProgram(program));
    act(() => result.current.setRate(15));
    expect(result.current.state.annualRatePercent).toBe(15);
    expect(result.current.state.programId).toBe("custom");
  });

  it("clamps an absurd price to COST_MAX (no scientific-notation / overflow blowups)", () => {
    const { result } = renderHook(() => useCalculator({ cost: 10_000_000 }));
    act(() => result.current.setCost(1e38));
    expect(result.current.state.cost).toBe(COST_MAX);
  });

  it("clamps the rate to [0, RATE_MAX_PERCENT] (no negative / runaway interest)", () => {
    const { result } = renderHook(() => useCalculator({ cost: 10_000_000 }));
    act(() => result.current.setRate(-50));
    expect(result.current.state.annualRatePercent).toBe(0);
    act(() => result.current.setRate(99999));
    expect(result.current.state.annualRatePercent).toBe(RATE_MAX_PERCENT);
  });

  it("clamps the term to [1, TERM_MAX_MONTHS]", () => {
    const { result } = renderHook(() => useCalculator({ cost: 10_000_000 }));
    act(() => result.current.setTerm(0));
    expect(result.current.state.termMonths).toBe(1);
    act(() => result.current.setTerm(100000));
    expect(result.current.state.termMonths).toBe(TERM_MAX_MONTHS);
  });

  it("exposes the computed result", () => {
    const { result } = renderHook(() =>
      useCalculator({ cost: 100_000, downPaymentPercent: 0, annualRatePercent: 12, termMonths: 12 }),
    );
    expect(result.current.result.monthlyPayment).toBe(8885);
  });
});
