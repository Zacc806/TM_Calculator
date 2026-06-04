/** Integer tenge. All money in the engine is whole ₸ — no fractional units. */
export type Tenge = number;

export interface CalcInput {
  /** Apartment cost, ₸ (integer). */
  cost: Tenge;
  /** Down payment, ₸ (integer), 0..cost. */
  downPayment: Tenge;
  /** Annual interest rate, percent. 0 => zero-rate installment. */
  annualRatePercent: number;
  /** Loan/installment term in months (integer >= 1). */
  termMonths: number;
}

export interface CalcResult {
  /** K = cost − downPayment. */
  loanAmount: Tenge;
  /** The dominant output, rounded to whole ₸. */
  monthlyPayment: Tenge;
  /** monthlyPayment × termMonths. */
  totalToPay: Tenge;
  /** totalToPay − loanAmount. */
  overpayment: Tenge;
  isZeroRate: boolean;
}

export type CalcErrorCode =
  | "cost_required"
  | "down_payment_range"
  | "term_range"
  | "rate_negative";

export interface CalcFieldError {
  field: keyof CalcInput;
  code: CalcErrorCode;
}

export interface CalcValidation {
  ok: boolean;
  errors: ReadonlyArray<CalcFieldError>;
}
