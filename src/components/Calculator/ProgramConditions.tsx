import { useState } from "react";
import type { Program } from "../../core/programs.types";
import { useT } from "../../i18n";
import { formatPercent } from "../../core/money";
import { formatTerm } from "../../lib/format";
import { Modal, modalStyles } from "../ui/Modal";
import styles from "./Calculator.module.css";

export function ProgramConditions({ program }: { program: Program | undefined }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  if (!program) return null;

  // "Islands": one tab per non-empty info block — the calculator stays clean,
  // the detail lives behind a single button and is browsed one island at a time.
  const islands = (
    [
      ["conditions", t("modal.tabConditions"), program.conditions],
      ["requirements", t("modal.tabRequirements"), program.requirements],
      ["projects", t("modal.tabProjects"), program.projects],
      ["bank", t("modal.tabBank"), program.bank],
    ] as const
  ).filter(([, , text]) => text && text.trim());

  const activeIndex = Math.min(tab, Math.max(0, islands.length - 1));
  const active = islands[activeIndex];

  return (
    <>
      <button
        type="button"
        className={styles.conditionsBtn}
        onClick={() => {
          setTab(0);
          setOpen(true);
        }}
      >
        <InfoIcon />
        {t("action.conditions")}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={program.name}>
        {program.relevance?.trim() ? (
          <div className={modalStyles.relevance}>
            <span className={modalStyles.relevanceDot} aria-hidden />
            {program.relevance.trim()}
          </div>
        ) : null}

        <div className={modalStyles.chips}>
          <span className={modalStyles.chip}>
            <span className={modalStyles.chipLabel}>{t("modal.rate")}</span>
            <span className={modalStyles.chipValue}>{formatPercent(program.ratePercent)}</span>
          </span>
          <span className={modalStyles.chip}>
            <span className={modalStyles.chipLabel}>{t("modal.term")}</span>
            <span className={modalStyles.chipValue}>{formatTerm(program.termMonths, t)}</span>
          </span>
          <span className={modalStyles.chip}>
            <span className={modalStyles.chipLabel}>{t("modal.dp")}</span>
            <span className={modalStyles.chipValue}>{formatPercent(program.recommendedDownPaymentPercent)}</span>
          </span>
        </div>

        {islands.length > 0 && active ? (
          <>
            <div className={modalStyles.tabs} role="tablist">
              {islands.map(([key, label], i) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={i === activeIndex}
                  className={`${modalStyles.tab} ${i === activeIndex ? modalStyles.tabActive : ""}`}
                  onClick={() => setTab(i)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={modalStyles.island} role="tabpanel">
              <p className={modalStyles.islandText}>{active[2]}</p>
            </div>
          </>
        ) : null}
      </Modal>
    </>
  );
}

function InfoIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}
