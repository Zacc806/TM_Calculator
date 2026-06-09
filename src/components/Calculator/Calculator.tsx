import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { computeOtbasy } from "../../core/calc";
import { useCalculator, type UseCalculatorInit } from "../../hooks/useCalculator";
import { usePrograms } from "../../hooks/usePrograms";
import { SEED_PROGRAMS } from "../../data/programs.client";
import { CUSTOM_PROGRAM_ID } from "../../data/defaults";
import type { CalcInput, CalcResult } from "../../core/calc.types";
import { CostInput } from "./CostInput";
import { DownPayment } from "./DownPayment";
import { ProgramSelect } from "./ProgramSelect";
import { ProgramConditions } from "./ProgramConditions";
import { RateTermInputs } from "./RateTermInputs";
import { ResultCard } from "./ResultCard";
import { ActionsBar } from "../actions/ActionsBar";
import { localizeProgram } from "../../core/programs";
import { useI18n } from "../../i18n";
import styles from "./Calculator.module.css";

export type CalculatorContext = "standalone" | "embed" | "bitrix";

interface Props {
  initial?: UseCalculatorInit;
  context?: CalculatorContext;
  showActions?: boolean;
  /** Manager contexts: show a "client link" action (no personal data). */
  showShareLink?: boolean;
  /** Bitrix "save to deal" control (Этап 3). */
  saveSlot?: ReactNode;
  onResultChange?: (
    result: CalcResult,
    input: CalcInput,
    meta: { programId: string; programName: string },
  ) => void;
}

export function Calculator({
  initial,
  context = "standalone",
  showActions = true,
  showShareLink = false,
  saveSlot,
  onResultChange,
}: Props) {
  // Expand ?program= into rate/term/down-payment synchronously from the bundled
  // seed, so an embedded calculator opens pre-filled without an async flash.
  const resolvedInitial = useMemo<UseCalculatorInit>(() => {
    if (!initial?.programId) return initial ?? {};
    const preset = SEED_PROGRAMS.programs.find((p) => p.id === initial.programId);
    if (!preset || preset.id === CUSTOM_PROGRAM_ID) return initial;
    return {
      ...initial,
      annualRatePercent: preset.ratePercent,
      termMonths: preset.termMonths,
      downPaymentPercent: initial.downPaymentPercent ?? preset.recommendedDownPaymentPercent,
    };
  }, [initial]);

  const calc = useCalculator(resolvedInitial);
  const { config } = usePrograms();
  const cardRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useI18n();

  const baseProgram =
    config.programs.find((p) => p.id === calc.state.programId) ??
    config.programs.find((p) => p.id === CUSTOM_PROGRAM_ID);
  const selectedProgram = baseProgram ? localizeProgram(baseProgram, lang) : undefined;
  const programName = selectedProgram?.name ?? "—";
  // Otbasy programs use a multi-stage bridge-loan scheme; a single annuity is only
  // an estimate, so flag it (decided with Pavel — see docs/calc-test-cases.md).
  const isOtbasyScheme = (baseProgram?.bank ?? "").includes("Отбасы");
  // When a program carries the decoded Otbasy scheme, compute its (two-phase) payment
  // from the deposit-covers-part model instead of the plain annuity.
  const otbasy = baseProgram?.otbasy ? computeOtbasy(calc.input, baseProgram.otbasy) : undefined;

  useEffect(() => {
    onResultChange?.(calc.result, calc.input, { programId: calc.state.programId, programName });
  }, [calc.result, calc.input, calc.state.programId, programName, onResultChange]);

  return (
    <div className={styles.root} data-context={context}>
      <div className={styles.grid}>
        <div className={styles.panel}>
          <CostInput value={calc.state.cost} onChange={calc.setCost} />
          <DownPayment
            mode={calc.state.downPaymentMode}
            percent={calc.state.downPaymentPercent}
            amount={calc.state.downPaymentAmount}
            onMode={calc.setDownPaymentMode}
            onPercent={calc.setDownPaymentPercent}
            onAmount={calc.setDownPaymentAmount}
          />
          <ProgramSelect
            programs={config.programs}
            selectedId={calc.state.programId}
            onSelect={calc.applyProgram}
          />
          <ProgramConditions program={selectedProgram} />
          <RateTermInputs
            ratePercent={calc.state.annualRatePercent}
            termMonths={calc.state.termMonths}
            onRate={calc.setRate}
            onTerm={calc.setTerm}
          />
        </div>

        <div>
          <ResultCard
            ref={cardRef}
            input={calc.input}
            result={calc.result}
            programName={programName}
            otbasy={otbasy}
            note={isOtbasyScheme ? t("result.otbasyNote") : t("result.standardNote")}
          />
          {!calc.validation.ok && <div className={styles.errors}>{t("calc.error")}</div>}
          {showActions && (
            <ActionsBar
              cardRef={cardRef}
              input={calc.input}
              result={calc.result}
              programName={programName}
              shareLink={showShareLink}
              programId={calc.state.programId}
            />
          )}
          {saveSlot}
        </div>
      </div>
    </div>
  );
}
