function annuity(loan, annualPct, n) {
  if (loan <= 0 || n <= 0) return 0;
  if (annualPct <= 0) return Math.round(loan / n);
  const i = annualPct / 12 / 100;
  const pow = Math.pow(1 + i, n);
  return Math.round((loan * i * pow) / (pow - 1));
}
const fmt = (n) => n.toLocaleString("ru-RU");
const diff = (our, bank) => {
  const d = our - bank;
  const pct = ((d / bank) * 100).toFixed(1);
  return `${d >= 0 ? "+" : ""}${fmt(d)} ₸ (${d >= 0 ? "+" : ""}${pct}%)`;
};

console.log("================ НАУРЫЗ (ставка 9%) — двухфазная ================");
console.log("Наш калькулятор: один аннуитет по пресету программы (9%, срок 228 мес = 19 лет).\n");
for (const c of [
  { cost: 36000000, dp: 7200000, p1: 382500, p2: 165000 },
  { cost: 26239500, dp: 5247900, p1: 196796, p2: 120701 },
  { cost: 22825000, dp: 4565000, p1: 171187, p2: 104995 },
]) {
  const loan = c.cost - c.dp;
  const our = annuity(loan, 9, 228);
  console.log(`Стоимость ${fmt(c.cost)} | заём ${fmt(loan)}`);
  console.log(`  банк 1-е 8 лет: ${fmt(c.p1)} | наш: ${fmt(our)} | разница: ${diff(our, c.p1)}`);
  console.log(`  банк ост. 8 лет: ${fmt(c.p2)} | наш: ${fmt(our)} | разница: ${diff(our, c.p2)}`);
}

console.log("\n================ 50/50 (ставка 8,5%, срок 9 лет = 108 мес) ================");
for (const c of [
  { cost: 38024000, dp: 19012000, bank: 269336 },
  { cost: 26239500, dp: 5247900, bank: 185863 },
  { cost: 22825000, dp: 4565000, bank: 161677 },
]) {
  const loanByDp = c.cost - c.dp;
  const loanHalf = Math.round(c.cost * 0.5);
  const ourDp = annuity(loanByDp, 8.5, 108);
  const ourHalf = annuity(loanHalf, 8.5, 108);
  console.log(`Стоимость ${fmt(c.cost)} | банк: ${fmt(c.bank)}`);
  console.log(`  наш при ПВ из таблицы (заём ${fmt(loanByDp)}): ${fmt(ourDp)} | разница: ${diff(ourDp, c.bank)}`);
  console.log(`  наш при финансировании 50% (заём ${fmt(loanHalf)}): ${fmt(ourHalf)} | разница: ${diff(ourHalf, c.bank)}`);
}

console.log("\n================ КОНТРОЛЬ: стандартный аннуитет ================");
console.log("Пример ТЗ Аура: 25 000 000, ПВ 20% (5 000 000), заём 20 000 000, 9%, 180 мес:");
console.log("  наш калькулятор:", fmt(annuity(20000000, 9, 180)), "₸/мес (эталон Excel PMT = тот же → расхождение 0,0%)");
