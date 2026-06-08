import { useId } from "react";
import type { Program } from "../../core/programs.types";
import { localizeProgram } from "../../core/programs";
import { useI18n } from "../../i18n";
import styles from "./Calculator.module.css";

interface Props {
  programs: ReadonlyArray<Program>;
  selectedId: string;
  onSelect: (program: Program) => void;
}

export function ProgramSelect({ programs, selectedId, onSelect }: Props) {
  const id = useId();
  const { t, lang } = useI18n();
  const selected = programs.find((p) => p.id === selectedId);
  const selectedNote = selected ? localizeProgram(selected, lang).description : undefined;
  return (
    <div className={styles.field}>
      <label className="label" htmlFor={id}>
        {t("field.program")}
      </label>
      <select
        id={id}
        className={styles.select}
        value={selectedId}
        aria-label={t("field.program")}
        onChange={(e) => {
          const program = programs.find((p) => p.id === e.target.value);
          if (program) onSelect(program);
        }}
      >
        {programs.map((p) => (
          <option key={p.id} value={p.id}>
            {localizeProgram(p, lang).name}
          </option>
        ))}
      </select>
      {selectedNote ? <p className={styles.programNote}>{selectedNote}</p> : null}
    </div>
  );
}
