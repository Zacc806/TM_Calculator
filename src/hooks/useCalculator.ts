import { useMemo, useReducer } from "react";
import type { CalcInput, CalcResult, CalcValidation } from "../core/calc.types";
import type { Program } from "../core/programs.types";
import { computePayment, validateInput } from "../core/calc";
import { amountToPct, clamp, pctToAmount } from "../core/money";
import {
  CUSTOM_PROGRAM_ID,
  DEFAULT_COST,
  DEFAULT_DP_PERCENT,
  DEFAULT_RATE_PERCENT,
  DEFAULT_TERM_MONTHS,
  DP_MAX_PCT,
} from "../data/defaults";

export type DownPaymentMode = "percent" | "amount";

export interface CalcState {
  cost: number;
  downPaymentMode: DownPaymentMode;
  downPaymentPercent: number;
  downPaymentAmount: number;
  annualRatePercent: number;
  termMonths: number;
  programId: string;
}

export interface UseCalculatorInit {
  cost?: number;
  downPaymentPercent?: number;
  annualRatePercent?: number;
  termMonths?: number;
  programId?: string;
}

type Action =
  | { type: "setCost"; value: number }
  | { type: "setDpPercent"; value: number }
  | { type: "setDpAmount"; value: number }
  | { type: "setDpMode"; value: DownPaymentMode }
  | { type: "setRate"; value: number }
  | { type: "setTerm"; value: number }
  | { type: "applyProgram"; program: Program };

function withPercent(state: CalcState, percent: number): CalcState {
  const downPaymentPercent = clamp(percent, 0, DP_MAX_PCT);
  return {
    ...state,
    downPaymentPercent,
    downPaymentAmount: pctToAmount(state.cost, downPaymentPercent),
  };
}

function reducer(state: CalcState, action: Action): CalcState {
  switch (action.type) {
    case "setCost": {
      const cost = Math.max(0, Math.round(action.value));
      // Anchor on percent: keep the same %, recompute the amount for the new cost.
      return { ...state, cost, downPaymentAmount: pctToAmount(cost, state.downPaymentPercent) };
    }
    case "setDpPercent":
      return withPercent(state, action.value);
    case "setDpAmount": {
      const downPaymentAmount = clamp(Math.round(action.value), 0, state.cost);
      return {
        ...state,
        downPaymentAmount,
        downPaymentPercent: clamp(amountToPct(state.cost, downPaymentAmount), 0, DP_MAX_PCT),
      };
    }
    case "setDpMode":
      return { ...state, downPaymentMode: action.value };
    case "setRate":
      return { ...state, annualRatePercent: Math.max(0, action.value), programId: CUSTOM_PROGRAM_ID };
    case "setTerm":
      return { ...state, termMonths: Math.max(1, Math.round(action.value)), programId: CUSTOM_PROGRAM_ID };
    case "applyProgram": {
      const p = action.program;
      const next = withPercent({ ...state, programId: p.id }, p.recommendedDownPaymentPercent);
      return { ...next, annualRatePercent: p.ratePercent, termMonths: p.termMonths };
    }
    default:
      return state;
  }
}

function init(initial: UseCalculatorInit): CalcState {
  const cost = initial.cost ?? DEFAULT_COST;
  const downPaymentPercent = clamp(initial.downPaymentPercent ?? DEFAULT_DP_PERCENT, 0, DP_MAX_PCT);
  return {
    cost,
    downPaymentMode: "percent",
    downPaymentPercent,
    downPaymentAmount: pctToAmount(cost, downPaymentPercent),
    annualRatePercent: initial.annualRatePercent ?? DEFAULT_RATE_PERCENT,
    termMonths: initial.termMonths ?? DEFAULT_TERM_MONTHS,
    programId: initial.programId ?? CUSTOM_PROGRAM_ID,
  };
}

export interface UseCalculator {
  state: CalcState;
  input: CalcInput;
  result: CalcResult;
  validation: CalcValidation;
  setCost: (v: number) => void;
  setDownPaymentPercent: (v: number) => void;
  setDownPaymentAmount: (v: number) => void;
  setDownPaymentMode: (m: DownPaymentMode) => void;
  setRate: (v: number) => void;
  setTerm: (v: number) => void;
  applyProgram: (p: Program) => void;
}

export function useCalculator(initial: UseCalculatorInit = {}): UseCalculator {
  const [state, dispatch] = useReducer(reducer, initial, init);

  const input: CalcInput = useMemo(
    () => ({
      cost: state.cost,
      downPayment: state.downPaymentAmount,
      annualRatePercent: state.annualRatePercent,
      termMonths: state.termMonths,
    }),
    [state.cost, state.downPaymentAmount, state.annualRatePercent, state.termMonths],
  );

  const result = useMemo(() => computePayment(input), [input]);
  const validation = useMemo(() => validateInput(input), [input]);

  return {
    state,
    input,
    result,
    validation,
    setCost: (v) => dispatch({ type: "setCost", value: v }),
    setDownPaymentPercent: (v) => dispatch({ type: "setDpPercent", value: v }),
    setDownPaymentAmount: (v) => dispatch({ type: "setDpAmount", value: v }),
    setDownPaymentMode: (m) => dispatch({ type: "setDpMode", value: m }),
    setRate: (v) => dispatch({ type: "setRate", value: v }),
    setTerm: (v) => dispatch({ type: "setTerm", value: v }),
    applyProgram: (p) => dispatch({ type: "applyProgram", program: p }),
  };
}
