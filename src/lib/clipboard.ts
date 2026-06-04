import type { CalcInput, CalcResult } from "../core/calc.types";
import { formatTenge } from "../core/money";
import { formatTerm } from "./format";

/** Builds a plain-text расчёт for WhatsApp / clipboard. */
export function buildSummary(
  input: CalcInput,
  result: CalcResult,
  programName: string,
): string {
  const lines = [
    "Расчёт платежа — Atamura Group",
    "",
    `Стоимость квартиры: ${formatTenge(input.cost)}`,
    `Первоначальный взнос: ${formatTenge(input.downPayment)}`,
    `Программа: ${programName}`,
    result.isZeroRate
      ? `Рассрочка, ${formatTerm(input.termMonths)}`
      : `Ставка: ${input.annualRatePercent}% годовых · ${formatTerm(input.termMonths)}`,
    "",
    `Ежемесячный платёж: ${formatTenge(result.monthlyPayment)}`,
    `Сумма ${result.isZeroRate ? "рассрочки" : "кредита"}: ${formatTenge(result.loanAmount)}`,
    result.overpayment > 0
      ? `Переплата: ${formatTenge(result.overpayment)}`
      : "Без переплаты",
    `Итоговая стоимость: ${formatTenge(input.downPayment + result.totalToPay)}`,
  ];
  return lines.join("\n");
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.warn("[clipboard] writeText failed", err);
    return false;
  }
}
