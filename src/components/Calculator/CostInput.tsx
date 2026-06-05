import { useId } from "react";
import { parseTenge } from "../../core/money";
import { useT } from "../../i18n";
import styles from "./Calculator.module.css";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

const grouper = new Intl.NumberFormat("ru-RU");

export function CostInput({ value, onChange }: Props) {
  const id = useId();
  const t = useT();
  const display = value > 0 ? grouper.format(value) : "";
  return (
    <div className={styles.field}>
      <label className="label" htmlFor={id}>
        {t("field.cost")}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          className={styles.costInput}
          style={{ paddingRight: "2.5rem" }}
          inputMode="numeric"
          autoComplete="off"
          value={display}
          placeholder="0"
          aria-label={t("field.cost.aria")}
          onChange={(e) => onChange(parseTenge(e.target.value))}
        />
        <span
          aria-hidden
          style={{
            position: "absolute",
            right: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--ink-faint)",
            fontWeight: 700,
          }}
        >
          ₸
        </span>
      </div>
    </div>
  );
}
