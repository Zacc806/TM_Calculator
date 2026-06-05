import { useEffect, useMemo, useRef, type ReactNode } from "react";
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
import { LeadForm } from "../lead/LeadForm";
import { useT } from "../../i18n";
import styles from "./Calculator.module.css";

export type CalculatorContext = "standalone" | "embed" | "bitrix";

interface Props {
  initial?: UseCalculatorInit;
  context?: CalculatorContext;
  showActions?: boolean;
  /** Manager contexts: show a "client link" action (no personal data). */
  showShareLink?: boolean;
  /** Show the lead-capture form below the result (Этап 2). */
  showLead?: boolean;
  /** Lead source label (ЖК slug or "calculator"/"embed"). */
  leadSource?: string;
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
  showLead = false,
  leadSource = "calculator",
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
  const t = useT();

  const selectedProgram =
    config.programs.find((p) => p.id === calc.state.programId) ??
    config.programs.find((p) => p.id === CUSTOM_PROGRAM_ID);
  const programName = selectedProgram?.name ?? "—";

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
          <ResultCard ref={cardRef} input={calc.input} result={calc.result} programName={programName} />
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
          {showLead && (
            <LeadForm
              input={calc.input}
              result={calc.result}
              programId={calc.state.programId}
              programName={programName}
              source={leadSource}
            />
          )}
        </div>
      </div>
    </div>
  );
}
