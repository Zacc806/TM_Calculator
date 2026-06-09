import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { Program } from "../../core/programs.types";
import { localizeProgram } from "../../core/programs";
import { useI18n } from "../../i18n";
import styles from "./Calculator.module.css";

interface Props {
  programs: ReadonlyArray<Program>;
  selectedId: string;
  onSelect: (program: Program) => void;
}

// Native <select> dropdowns render their option list with the OS chrome, which
// can't be styled and clashes with the rest of the UI. This is a custom listbox
// (WAI-ARIA pattern) so the popup matches the design — same width, radius, teal
// accents and theme tokens — and stays keyboard-accessible.
export function ProgramSelect({ programs, selectedId, onSelect }: Props) {
  const labelId = useId();
  const valueId = useId();
  const listId = useId();
  const { t, lang } = useI18n();

  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(0, programs.findIndex((p) => p.id === selectedId));
  const [active, setActive] = useState(selectedIndex);
  // Where the popup opens (down/up) and how tall it can be, so it never spills
  // past the viewport edge.
  const [placement, setPlacement] = useState<{ up: boolean; maxH: number }>({ up: false, maxH: 320 });

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const selected = programs[selectedIndex];
  const selectedNote = selected ? localizeProgram(selected, lang).description : undefined;

  useEffect(() => {
    if (open) setActive(selectedIndex);
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open) return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      const gap = 12;
      const below = window.innerHeight - rect.bottom - gap;
      const above = rect.top - gap;
      const want = 320;
      const up = below < want && above > below;
      setPlacement({ up, maxH: Math.max(160, Math.min(want, up ? above : below)) });
    }
    listRef.current?.focus();
    const onDocPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocPointer);
    return () => document.removeEventListener("mousedown", onDocPointer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView?.({ block: "nearest" });
  }, [open, active]);

  const choose = (i: number) => {
    const program = programs[i];
    if (program) onSelect(program);
    setOpen(false);
    btnRef.current?.focus();
  };

  const onButtonKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => Math.min(programs.length - 1, a + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(programs.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        btnRef.current?.focus();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div className={styles.field}>
      <span className="label" id={labelId}>
        {t("field.program")}
      </span>
      <div className={styles.combo} ref={rootRef}>
        <button
          ref={btnRef}
          type="button"
          className={styles.comboBtn}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={`${labelId} ${valueId}`}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onButtonKey}
        >
          <span className={styles.comboValue} id={valueId}>
            {selected ? localizeProgram(selected, lang).name : ""}
          </span>
          <svg className={styles.comboChevron} viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 7.5 L10 12.5 L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {open ? (
          <ul
            ref={listRef}
            className={styles.comboMenu}
            style={
              placement.up
                ? { maxHeight: placement.maxH, top: "auto", bottom: "calc(100% + 6px)" }
                : { maxHeight: placement.maxH }
            }
            role="listbox"
            tabIndex={-1}
            aria-labelledby={labelId}
            aria-activedescendant={`${listId}-${active}`}
            onKeyDown={onListKey}
          >
            {programs.map((p, i) => {
              const isSelected = p.id === selectedId;
              return (
                <li
                  key={p.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.comboOption} ${i === active ? styles.comboOptionActive : ""} ${
                    isSelected ? styles.comboOptionSelected : ""
                  }`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(i)}
                >
                  <span>{localizeProgram(p, lang).name}</span>
                  {isSelected ? (
                    <svg className={styles.comboCheck} viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M4 10.5 L8 14.5 L16 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      {selectedNote ? <p className={styles.programNote}>{selectedNote}</p> : null}
    </div>
  );
}
