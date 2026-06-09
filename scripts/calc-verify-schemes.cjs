// Mirror of calc.ts annuity: nominal rate, whole-tenge rounding.
function annuity(loan, annualPct, n) {
  if (loan <= 0 || n <= 0) return 0;
  if (annualPct <= 0) return Math.round(loan / n);
  const i = annualPct / 12 / 100;
  const pow = Math.pow(1 + i, n);
  return Math.round((loan * i * pow) / (pow - 1));
}
// Smallest term (months) whose annuity is <= the target payment (reverse-engineer the term).
function solveTerm(loan, annualPct, payment) {
  for (let n = 1; n <= 600; n++) if (annuity(loan, annualPct, n) <= payment) return n;
  return null;
}
const pct = (dp, cost) => Math.round((dp / cost) * 100);

console.log("=== НАУРЫЗ — ставка 9%, заявлено: первые 8 лет / оставшиеся 8 лет ===");
for (const c of [
  { cost: 36000000, dp: 7200000, p1: 382500, p2: 165000 },
  { cost: 26239500, dp: 5247900, p1: 196796, p2: 120701 },
  { cost: 22825000, dp: 4565000, p1: 171187, p2: 104995 },
]) {
  const loan = c.cost - c.dp;
  console.log(
    `cost ${c.cost} ПВ${pct(c.dp, c.cost)}% loan ${loan}: ` +
    `калькулятор@228мес=${annuity(loan, 9, 228)}, @192мес=${annuity(loan, 9, 192)} | ` +
    `фаза1 ${c.p1} → срок≈${solveTerm(loan, 9, c.p1)}мес; фаза2 ${c.p2} → срок≈${solveTerm(loan, 9, c.p2)}мес`,
  );
}

console.log("\n=== 50/50 — ставка 8,5%, заявлено: срок 9 лет (108 мес) ===");
for (const c of [
  { cost: 38024000, dp: 19012000, p: 269336 },
  { cost: 26239500, dp: 5247900, p: 185863 },
  { cost: 22825000, dp: 4565000, p: 161677 },
]) {
  const loanByDp = c.cost - c.dp;
  const loanHalf = Math.round(c.cost * 0.5);
  console.log(
    `cost ${c.cost} ПВ${pct(c.dp, c.cost)}%: ` +
    `при loan=cost−ПВ(${loanByDp}) калькулятор@108=${annuity(loanByDp, 8.5, 108)}; ` +
    `ожидается ${c.p} → при этом loan срок≈${solveTerm(loanByDp, 8.5, c.p)}мес | ` +
    `если loan=50%(${loanHalf}) @108=${annuity(loanHalf, 8.5, 108)}, срок под ${c.p}≈${solveTerm(loanHalf, 8.5, c.p)}мес`,
  );
}
