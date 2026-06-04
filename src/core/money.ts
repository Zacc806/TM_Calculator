const NBSP = " ";

/** Formats integer tenge with non-breaking-space thousands and a ₸ suffix: 12 500 000 ₸. */
export function formatTenge(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(Math.round(value));
  const grouped = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${sign}${grouped}${NBSP}₸`;
}

/** Parses a money string (spaces, ₸, NBSP) into an integer tenge value. Non-numeric → 0. */
export function parseTenge(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

/** Integer tenge amount for a given percent of cost. */
export function pctToAmount(cost: number, pct: number): number {
  return Math.round((cost * pct) / 100);
}

/** Percent of cost represented by an amount. Guards a zero cost. */
export function amountToPct(cost: number, amount: number): number {
  if (cost <= 0) return 0;
  return (amount / cost) * 100;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
