import { forwardRef } from "react";
import type { CalcInput, CalcResult } from "../../core/calc.types";
import { formatTenge } from "../../core/money";
import { formatTerm } from "../../lib/format";
import { useT } from "../../i18n";
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
  const t = useT();
  const fullCost = input.downPayment + result.totalToPay;
  return (
    <div className={`${styles.result} print-card`} ref={ref}>
      <div className="printOnly" aria-hidden>
        <div style={{ fontWeight: 800, letterSpacing: "0.04em", color: "var(--brand)" }}>
          ATAMURA GROUP
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--ink-soft)", marginBottom: "0.75rem" }}>
          {t("result.cardTitle")}
        </div>
      </div>

      <div className={styles.resultLabel}>{t("result.label")}</div>
      <div className={`${styles.resultValue} tnum`}>{formatTenge(result.monthlyPayment)}</div>
      <div className={styles.resultPer}>
        {t("result.perMonth")} · {formatTerm(input.termMonths, t)}
        {result.isZeroRate
          ? ` · ${t("result.installment")}`
          : ` · ${input.annualRatePercent}% ${t("result.annual")}`}
      </div>

      <div className={styles.resultGrid}>
        <div className={styles.resultItem}>
          <span className={styles.resultItemLabel}>{t("result.cost")}</span>
          <span className={styles.resultItemValue}>{formatTenge(input.cost)}</span>
        </div>
        <div className={styles.resultItem}>
          <span className={styles.resultItemLabel}>{t("result.downPayment")}</span>
          <span className={styles.resultItemValue}>{formatTenge(input.downPayment)}</span>
        </div>
        <div className={styles.resultItem}>
          <span className={styles.resultItemLabel}>
            {result.isZeroRate ? t("result.loanInstallment") : t("result.loanCredit")}
          </span>
          <span className={styles.resultItemValue}>{formatTenge(result.loanAmount)}</span>
        </div>
        <div className={styles.resultItem}>
          <span className={styles.resultItemLabel}>{t("result.overpayment")}</span>
          <span className={styles.resultItemValue}>
            {result.overpayment > 0 ? formatTenge(result.overpayment) : "—"}
          </span>
        </div>
        <div className={styles.resultItem}>
          <span className={styles.resultItemLabel}>{t("result.total")}</span>
          <span className={styles.resultItemValue}>{formatTenge(fullCost)}</span>
        </div>
        <div className={styles.resultItem} style={{ borderBottom: "none" }}>
          <span className={styles.resultItemLabel}>{t("result.program")}</span>
          <span className={styles.resultItemValue}>{programName}</span>
        </div>
      </div>
    </div>
  );
});
