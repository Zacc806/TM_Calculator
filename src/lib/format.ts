/** Human term: "240 мес. · 20 лет" / "18 мес. · 1.5 года". */
export function formatTerm(months: number): string {
  const years = months / 12;
  if (months % 12 === 0 && years >= 1) {
    return `${months} мес. · ${years} ${plural(years, "год", "года", "лет")}`;
  }
  return `${months} мес.`;
}

function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(Math.round(n));
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
