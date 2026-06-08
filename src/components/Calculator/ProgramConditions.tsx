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
  if (!program) return null;

  const sections: Array<[string, string | undefined]> = [
    [t("modal.conditionsHead"), program.conditions],
    [t("modal.requirements"), program.requirements],
    [t("modal.projects"), program.projects],
    [t("modal.bank"), program.bank],
  ];

  return (
    <>
      <button type="button" className={styles.conditionsBtn} onClick={() => setOpen(true)}>
        <InfoIcon />
        {t("action.conditions")}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={program.name}>
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
        {sections
          .filter(([, value]) => value && value.trim())
          .map(([head, value]) => (
            <div className={modalStyles.section} key={head}>
              <div className={modalStyles.sectionHead}>{head}</div>
              <p className={modalStyles.sectionText}>{value}</p>
            </div>
          ))}
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
