import { Layout } from "../components/branding/Layout";
import { Calculator } from "../components/Calculator/Calculator";
import { useCalcQuery } from "../hooks/useQueryParams";
import { useIframeAutoHeight } from "../hooks/useIframeAutoHeight";
import type { UseCalculatorInit } from "../hooks/useCalculator";

export function EmbedRoute() {
  const query = useCalcQuery();
  useIframeAutoHeight(true);

  const initial: UseCalculatorInit = {};
  if (query.price !== undefined) initial.cost = query.price;
  if (query.program !== undefined) initial.programId = query.program;

  return (
    <Layout variant="bare">
      <Calculator context="embed" initial={initial} showLead leadSource={query.zhk ?? "embed"} />
    </Layout>
  );
}
