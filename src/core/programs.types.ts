export interface Program {
  /** Stable id, e.g. "rassrochka" | "otbasy" | "7-20-25" | "nauryz" | "ipoteka-bvu" | "custom". */
  id: string;
  /** Display name (RU). */
  name: string;
  /** Annual interest rate, percent. 0 for an interest-free installment. */
  ratePercent: number;
  /** Default term in months. */
  termMonths: number;
  /** Recommended down payment, percent of cost. */
  recommendedDownPaymentPercent: number;
  /** Explanatory text shown to the client. */
  description: string;
  /** When true ("свой вариант"), rate/term are fully manual and not preset-locked. */
  editable: boolean;
}

export interface ProgramsConfig {
  /** Bumped on every admin save (optimistic concurrency). */
  version: number;
  /** ISO timestamp of last update. */
  updatedAt: string;
  programs: ReadonlyArray<Program>;
}
