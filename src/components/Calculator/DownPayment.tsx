import { parseTenge } from "../../core/money";
import { DP_MAX_PCT } from "../../data/defaults";
import type { DownPaymentMode } from "../../hooks/useCalculator";
import styles from "./Calculator.module.css";

interface Props {
  mode: DownPaymentMode;
  percent: number;
  amount: number;
  onMode: (m: DownPaymentMode) => void;
  onPercent: (v: number) => void;
  onAmount: (v: number) => void;
}

const grouper = new Intl.NumberFormat("ru-RU");

export function DownPayment({ mode, percent, amount, onMode, onPercent, onAmount }: Props) {
  const roundedPct = Math.round(percent);
  return (
    <div className={styles.field}>
      <div className={styles.fieldHead}>
        <span className="label">Первоначальный взнос</span>
        <div className={styles.toggle} role="group" aria-label="Единица первоначального взноса">
          <button
            type="button"
            className={`${styles.toggleBtn} ${mode === "percent" ? styles.toggleBtnActive : ""}`}
            aria-pressed={mode === "percent"}
            onClick={() => onMode("percent")}
          >
            %
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${mode === "amount" ? styles.toggleBtnActive : ""}`}
            aria-pressed={mode === "amount"}
            onClick={() => onMode("amount")}
          >
            ₸
          </button>
        </div>
      </div>

      <div className={styles.dpRow}>
        {mode === "percent" ? (
          <input
            className={`${styles.smallInput} ${styles.dpValue}`}
            inputMode="numeric"
            aria-label="Первоначальный взнос, процент"
            value={roundedPct}
            onChange={(e) => onPercent(Number(e.target.value.replace(/\D/g, "")) || 0)}
          />
        ) : (
          <input
            className={`${styles.smallInput} ${styles.dpValue}`}
            inputMode="numeric"
            aria-label="Первоначальный взнос, тенге"
            value={amount > 0 ? grouper.format(amount) : ""}
            placeholder="0"
            onChange={(e) => onAmount(parseTenge(e.target.value))}
          />
        )}
        <span className={styles.suffix}>
          {mode === "percent" ? grouper.format(amount) + " ₸" : roundedPct + " %"}
        </span>
      </div>

      <input
        type="range"
        className={styles.slider}
        min={0}
        max={DP_MAX_PCT}
        step={1}
        value={roundedPct}
        aria-label="Ползунок первоначального взноса"
        onChange={(e) => onPercent(Number(e.target.value))}
      />
    </div>
  );
}
