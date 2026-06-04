import { useEffect, useId, useState } from "react";
import { parseDecimalInput } from "../../core/money";
import { RATE_MAX_PERCENT, TERM_MAX_MONTHS } from "../../data/defaults";
import styles from "./Calculator.module.css";

interface Props {
  ratePercent: number;
  termMonths: number;
  onRate: (v: number) => void;
  onTerm: (v: number) => void;
}

function toNumber(raw: string, max: number): number {
  // parseDecimalInput handles comma decimals (ru-KZ "18,5"), stray separators
  // and signs, always returning a finite, non-negative number.
  return Math.min(parseDecimalInput(raw), max);
}

/**
 * Editable number field that keeps the raw typed string while focused, so a
 * comma decimal ("18,5") or a transient empty value survives re-renders; it
 * re-syncs to the canonical numeric value on blur and on external changes.
 */
function NumberField({
  label,
  value,
  max,
  ariaLabel,
  onValue,
}: {
  label: string;
  value: number;
  max: number;
  ariaLabel: string;
  onValue: (v: number) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  return (
    <div className={styles.field}>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={styles.smallInput}
        inputMode="decimal"
        aria-label={ariaLabel}
        value={draft}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setDraft(String(value));
        }}
        onChange={(e) => {
          setDraft(e.target.value);
          onValue(toNumber(e.target.value, max));
        }}
      />
    </div>
  );
}

export function RateTermInputs({ ratePercent, termMonths, onRate, onTerm }: Props) {
  return (
    <div className={styles.twoCol}>
      <NumberField
        label="Ставка, % годовых"
        ariaLabel="Ставка в процентах годовых"
        value={ratePercent}
        max={RATE_MAX_PERCENT}
        onValue={onRate}
      />
      <NumberField
        label="Срок, месяцев"
        ariaLabel="Срок в месяцах"
        value={termMonths}
        max={TERM_MAX_MONTHS}
        onValue={onTerm}
      />
    </div>
  );
}
