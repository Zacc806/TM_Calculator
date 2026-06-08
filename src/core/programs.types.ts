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
  /** Short explanatory text shown under the selector. */
  description: string;
  /** When true ("свой вариант"), rate/term are fully manual and not preset-locked. */
  editable: boolean;
  /** Full program conditions (shown in the «Условия» modal). */
  conditions?: string;
  /** Client eligibility requirements (modal). */
  requirements?: string;
  /** Issuing bank / operator (modal). */
  bank?: string;
  /** Per-project availability — which ЖК / очереди the program currently covers (modal). */
  projects?: string;
  /** Freshness note, e.g. "актуально июнь 2026" — shown as a badge (modal). */
  relevance?: string;
  /**
   * Optional per-locale overrides (kk/en). Any field present here replaces the
   * RU base for that locale; missing fields fall back to the RU value above.
   */
  i18n?: Partial<Record<Exclude<ProgramLocale, "ru">, ProgramText>>;
}

/** Locales that can carry program-content overrides. */
export type ProgramLocale = "ru" | "kk" | "en";

/** Translatable text fields of a Program. */
export type ProgramText = Partial<
  Pick<Program, "name" | "description" | "conditions" | "requirements" | "bank" | "projects" | "relevance">
>;

export interface ProgramsConfig {
  /** Bumped on every admin save (optimistic concurrency). */
  version: number;
  /** ISO timestamp of last update. */
  updatedAt: string;
  programs: ReadonlyArray<Program>;
}
