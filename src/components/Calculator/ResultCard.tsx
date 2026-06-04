import { forwardRef } from "react";
import type { CalcInput, CalcResult } from "../../core/calc.types";
import { formatTenge } from "../../core/money";
import { formatTerm } from "../../lib/format";
import styles from "./Calculator.module.css";

interface Props {
  input: CalcInput;
  result: CalcResult;
  programName: string;
}

/** Client-facing card. Same node is captured for PDF and shown in print mode. */
export const ResultCard = forwardRef<HTMLDivElement, Props>(function ResultCard(
  { input, result, programName },
  ref,
) {
  const fullCost = input.downPayment + result.totalToPay;
  return (
    <div className={`${styles.result} print-card`} ref={ref}>
      <div className="printOnly" aria-hidden>
        <div style={{ fontWeight: 800, letterSpacing: "0.04em", color: "var(--brand)" }}>
          ATAMURA GROUP
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--ink-soft)", marginBottom: "0.75rem" }}>
          Расчёт ежемесячного платежа
        </div>
      </div>

      <div className={styles.resultLabel}>Ежемесячный платёж</div>
      <div className={`${styles.resultValue} tnum`}>{formatTenge(result.monthlyPayment)}</div>
      <div className={styles.resultPer}>
        в месяц · {formatTerm(input.termMonths)}
        {result.isZeroRate ? " · рассрочка" : ` · ${input.annualRatePercent}% годовых`}
      </div>

      <div className={styles.resultGrid}>
        <div className={styles.resultItem}>
          <span className={styles.resultItemLabel}>Стоимость квартиры</span>
          <span className={styles.resultItemValue}>{formatTenge(input.cost)}</span>
        </div>
        <div className={styles.resultItem}>
          <span className={styles.resultItemLabel}>Первоначальный взнос</span>
          <span className={styles.resultItemValue}>{formatTenge(input.downPayment)}</span>
        </div>
        <div className={styles.resultItem}>
          <span className={styles.resultItemLabel}>
            Сумма {result.isZeroRate ? "рассрочки" : "кредита"}
          </span>
          <span className={styles.resultItemValue}>{formatTenge(result.loanAmount)}</span>
        </div>
        <div className={styles.resultItem}>
          <span className={styles.resultItemLabel}>Переплата</span>
          <span className={styles.resultItemValue}>
            {result.overpayment > 0 ? formatTenge(result.overpayment) : "—"}
          </span>
        </div>
        <div className={styles.resultItem}>
          <span className={styles.resultItemLabel}>Итоговая стоимость</span>
          <span className={styles.resultItemValue}>{formatTenge(fullCost)}</span>
        </div>
        <div className={styles.resultItem} style={{ borderBottom: "none" }}>
          <span className={styles.resultItemLabel}>Программа</span>
          <span className={styles.resultItemValue}>{programName}</span>
        </div>
      </div>
    </div>
  );
});
