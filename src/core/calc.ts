import Decimal from "decimal.js-light";
import type {
  CalcInput,
  CalcResult,
  CalcValidation,
  CalcFieldError,
} from "./calc.types";

/**
 * Computes the monthly payment.
 *
 * Annuity (rate > 0): P = K·i·(1+i)^n / ((1+i)^n − 1), i = annual/12/100.
 * Zero-rate installment: P = K / n (equal parts).
 *
 * monthlyPayment is rounded to whole ₸ first; totalToPay and overpayment are then
 * derived from it, so the three displayed figures stay mutually consistent.
 */
export function computePayment(input: CalcInput): CalcResult {
  const loanAmount = Math.max(0, input.cost - input.downPayment);
  const n = input.termMonths;
  const isZeroRate = input.annualRatePercent <= 0;

  let monthlyPayment: number;
  if (loanAmount <= 0 || n <= 0) {
    monthlyPayment = 0;
  } else if (isZeroRate) {
    monthlyPayment = Math.round(loanAmount / n);
  } else {
    const k = new Decimal(loanAmount);
    const i = new Decimal(input.annualRatePercent).div(12).div(100);
    const onePlus = i.plus(1);
    const pow = onePlus.pow(n);
    const payment = k.mul(i).mul(pow).div(pow.minus(1));
    monthlyPayment = Math.round(payment.toNumber());
  }

  // Interest-free plans never overpay: the rounding remainder is absorbed by the
  // last instalment, so the client pays exactly the loan amount. Annuity plans
  // derive total/overpayment from the rounded monthly so the figures reconcile.
  const totalToPay = isZeroRate ? loanAmount : monthlyPayment * n;
  const overpayment = totalToPay - loanAmount;
  return { loanAmount, monthlyPayment, totalToPay, overpayment, isZeroRate };
}

export function validateInput(input: CalcInput): CalcValidation {
  const errors: CalcFieldError[] = [];
  if (!(input.cost > 0)) {
    errors.push({ field: "cost", code: "cost_required" });
  }
  if (input.downPayment < 0 || input.downPayment > input.cost) {
    errors.push({ field: "downPayment", code: "down_payment_range" });
  }
  if (!Number.isFinite(input.termMonths) || input.termMonths < 1) {
    errors.push({ field: "termMonths", code: "term_range" });
  }
  if (input.annualRatePercent < 0) {
    errors.push({ field: "annualRatePercent", code: "rate_negative" });
  }
  return { ok: errors.length === 0, errors };
}
