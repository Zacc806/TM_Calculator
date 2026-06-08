import { useEffect } from "react";
import { Layout } from "../components/branding/Layout";
import { Calculator } from "../components/Calculator/Calculator";
import { useCalcQuery } from "../hooks/useQueryParams";
import { useIframeAutoHeight } from "../hooks/useIframeAutoHeight";
import { useI18n } from "../i18n";
import type { UseCalculatorInit } from "../hooks/useCalculator";

export function EmbedRoute() {
  const query = useCalcQuery();
  const { setLang } = useI18n();
  useIframeAutoHeight(true);

  // The iframe can't read the host's locale; honor an explicit ?lang= from the src.
  useEffect(() => {
    if (query.lang) setLang(query.lang);
  }, [query.lang, setLang]);

  const initial: UseCalculatorInit = {};
  if (query.price !== undefined) initial.cost = query.price;
  if (query.program !== undefined) initial.programId = query.program;

  return (
    <Layout variant="bare">
      <Calculator context="embed" initial={initial} />
    </Layout>
  );
}
