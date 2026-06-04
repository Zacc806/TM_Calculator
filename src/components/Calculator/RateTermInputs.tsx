import { useId } from "react";
import { RATE_MAX_PERCENT, TERM_MAX_MONTHS } from "../../data/defaults";
import styles from "./Calculator.module.css";

interface Props {
  ratePercent: number;
  termMonths: number;
  onRate: (v: number) => void;
  onTerm: (v: number) => void;
}

function toNumber(raw: string, max: number): number {
  const n = Number(raw.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n)) return 0;
  return Math.min(n, max);
}

export function RateTermInputs({ ratePercent, termMonths, onRate, onTerm }: Props) {
  const rateId = useId();
  const termId = useId();
  return (
    <div className={styles.twoCol}>
      <div className={styles.field}>
        <label className="label" htmlFor={rateId}>
          Ставка, % годовых
        </label>
        <input
          id={rateId}
          className={styles.smallInput}
          inputMode="decimal"
          value={ratePercent}
          aria-label="Ставка в процентах годовых"
          onChange={(e) => onRate(toNumber(e.target.value, RATE_MAX_PERCENT))}
        />
      </div>
      <div className={styles.field}>
        <label className="label" htmlFor={termId}>
          Срок, месяцев
        </label>
        <input
          id={termId}
          className={styles.smallInput}
          inputMode="numeric"
          value={termMonths}
          aria-label="Срок в месяцах"
          onChange={(e) => onTerm(toNumber(e.target.value, TERM_MAX_MONTHS))}
        />
      </div>
    </div>
  );
}
