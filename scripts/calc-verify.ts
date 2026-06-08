/**
 * Calculation verification harness (ТЗ Задача 3).
 * Runs representative cases through the production engine (src/core/calc.ts) and
 * compares each result with an independent reference annuity (the Excel =PMT formula
 * banks use). Prints a Markdown table for docs/calc-verification.md.
 *
 *   npx tsx scripts/calc-verify.ts
 */
import { computePayment } from "../src/core/calc";
import { formatTenge } from "../src/core/money";

/** Independent reference: standard annuity (Excel =PMT), no rounding. */
function referencePmt(loan: number, annualPct: number, n: number): number {
  if (loan <= 0 || n <= 0) return 0;
  if (annualPct <= 0) return loan / n;
  const i = annualPct / 12 / 100;
  const pow = Math.pow(1 + i, n);
  return (loan * i * pow) / (pow - 1);
}

interface Case {
  program: string;
  zhk: string;
  cost: number;
  dp: number;
  rate: number;
  n: number;
}

const CASES: Case[] = [
  { program: "Наурыз/Отау", zhk: "Аура", cost: 25_000_000, dp: 5_000_000, rate: 9, n: 180 },
  { program: "7-20-25", zhk: "Атмосфера", cost: 30_000_000, dp: 6_000_000, rate: 7, n: 300 },
  { program: "Наурыз", zhk: "Керуен", cost: 36_000_000, dp: 7_200_000, rate: 9, n: 228 },
  { program: "Алматы жастары", zhk: "Аура", cost: 20_000_000, dp: 2_000_000, rate: 5, n: 228 },
  { program: "Каскадная Freedom", zhk: "Атмосфера", cost: 35_000_000, dp: 7_000_000, rate: 14.5, n: 240 },
  { program: "Стандартная Halyk", zhk: "Керуен", cost: 25_000_000, dp: 5_000_000, rate: 20.5, n: 240 },
  { program: "Рассрочка застройщика", zhk: "Атмосфера", cost: 25_000_000, dp: 7_500_000, rate: 0, n: 24 },
];

const rows: string[] = [];
let maxDivPct = 0;

for (const c of CASES) {
  const r = computePayment({ cost: c.cost, downPayment: c.dp, annualRatePercent: c.rate, termMonths: c.n });
  const loan = c.cost - c.dp;
  const ref = referencePmt(loan, c.rate, c.n);
  const refRounded = Math.round(ref);
  const divPct = ref > 0 ? (Math.abs(r.monthlyPayment - ref) / ref) * 100 : 0;
  maxDivPct = Math.max(maxDivPct, divPct);
  rows.push(
    `| ${c.program} (${c.zhk}) | ${formatTenge(c.cost)} | ${formatTenge(c.dp)} | ${c.rate}% | ${c.n} | ` +
      `${formatTenge(r.monthlyPayment)} | ${formatTenge(refRounded)} | ${divPct.toFixed(4)}% | ` +
      `${formatTenge(r.totalToPay)} | ${formatTenge(r.overpayment)} |`,
  );
}

console.log("| Программа (ЖК) | Стоимость | ПВ | Ставка | Срок, мес | Платёж (калькулятор) | Эталон PMT | Расхождение | Общая сумма | Переплата |");
console.log("|---|---|---|---|---|---|---|---|---|---|");
console.log(rows.join("\n"));
console.log(`\nМаксимальное расхождение с эталоном: ${maxDivPct.toFixed(4)}% (допуск ТЗ: < 1%).`);
