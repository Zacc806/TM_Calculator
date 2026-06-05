import { useId } from "react";
import type { Program } from "../../core/programs.types";
import styles from "./Calculator.module.css";

interface Props {
  programs: ReadonlyArray<Program>;
  selectedId: string;
  onSelect: (program: Program) => void;
}

export function ProgramSelect({ programs, selectedId, onSelect }: Props) {
  const id = useId();
  const selected = programs.find((p) => p.id === selectedId);
  return (
    <div className={styles.field}>
      <label className="label" htmlFor={id}>
        Программа покупки
      </label>
      <select
        id={id}
        className={styles.select}
        value={selectedId}
        aria-label="Программа покупки"
        onChange={(e) => {
          const program = programs.find((p) => p.id === e.target.value);
          if (program) onSelect(program);
        }}
      >
        {programs.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      {selected?.description ? <p className={styles.programNote}>{selected.description}</p> : null}
    </div>
  );
}
