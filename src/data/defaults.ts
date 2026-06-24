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

/** Default starting input for a fresh calculator (ТЗ: 13 млн / 20% / 7% / 60 мес → платёж 205 932 ₸). */
export const DEFAULT_COST = 13_000_000;
export const DEFAULT_DP_PERCENT = 20;
export const DEFAULT_RATE_PERCENT = 7;
export const DEFAULT_TERM_MONTHS = 60;

/** Id of the manual program ("свой вариант"); selected when rate/term are hand-edited. */
export const CUSTOM_PROGRAM_ID = "custom";
