import type { Program } from "../../core/programs.types";
import styles from "./Calculator.module.css";

interface Props {
  programs: ReadonlyArray<Program>;
  selectedId: string;
  onSelect: (program: Program) => void;
}

export function ProgramSelect({ programs, selectedId, onSelect }: Props) {
  const selected = programs.find((p) => p.id === selectedId);
  return (
    <div className={styles.field}>
      <span className="label">Программа покупки</span>
      <div className={styles.programGrid} role="radiogroup" aria-label="Программа покупки">
        {programs.map((p) => (
          <button
            type="button"
            key={p.id}
            role="radio"
            aria-checked={p.id === selectedId}
            className={`${styles.programChip} ${p.id === selectedId ? styles.programChipActive : ""}`}
            onClick={() => onSelect(p)}
          >
            {p.name}
          </button>
        ))}
      </div>
      {selected?.description ? <p className={styles.programNote}>{selected.description}</p> : null}
    </div>
  );
}
