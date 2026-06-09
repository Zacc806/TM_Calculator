/** Down payment slider upper bound, percent (ТЗ: 0–90%). */
export const DP_MAX_PCT = 90;

/** Term slider bounds, months. */
export const TERM_MIN_MONTHS = 6;
export const TERM_MAX_MONTHS = 360;

/** Rate input upper guard, percent annual. */
export const RATE_MAX_PERCENT = 60;

/** Apartment price upper guard, ₸. Caps absurd inputs so huge numbers can't break
 *  money formatting (scientific notation) or overflow the mobile layout. */
export const COST_MAX = 100_000_000_000;

/** Default starting input for a fresh calculator (standalone landing). */
export const DEFAULT_COST = 25_000_000;
export const DEFAULT_DP_PERCENT = 20;
export const DEFAULT_RATE_PERCENT = 0;
export const DEFAULT_TERM_MONTHS = 24;

/** Id of the manual program ("свой вариант"); selected when rate/term are hand-edited. */
export const CUSTOM_PROGRAM_ID = "custom";
