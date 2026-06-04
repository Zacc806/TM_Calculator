import { useRef } from "react";
import { Layout } from "../components/branding/Layout";
import { ResultCard } from "../components/Calculator/ResultCard";
import { ActionsBar } from "../components/actions/ActionsBar";
import { useCalcQuery } from "../hooks/useQueryParams";
import { usePrograms } from "../hooks/usePrograms";
import { computePayment } from "../core/calc";
import type { CalcInput } from "../core/calc.types";

export function ClientRoute() {
  const q = useCalcQuery();
  const { config } = usePrograms();
  const cardRef = useRef<HTMLDivElement>(null);

  if (q.price === undefined) {
    return (
      <Layout variant="full" title="Расчёт недоступен">
        <p style={{ color: "var(--ink-soft)" }}>
          Ссылка устарела или неполна. Запросите новый расчёт у менеджера Atamura Group.
        </p>
      </Layout>
    );
  }

  const input: CalcInput = {
    cost: q.price,
    downPayment: q.dp ?? 0,
    annualRatePercent: q.rate ?? 0,
    termMonths: q.term && q.term >= 1 ? q.term : 1,
  };
  const result = computePayment(input);
  const programName =
    config.programs.find((p) => p.id === q.program)?.name ?? "Индивидуальные условия";

  return (
    <Layout variant="full" title="Ваш расчёт платежа" subtitle="Предварительный расчёт от Atamura Group.">
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <ResultCard ref={cardRef} input={input} result={result} programName={programName} />
        <ActionsBar cardRef={cardRef} input={input} result={result} programName={programName} />
      </div>
    </Layout>
  );
}
