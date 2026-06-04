import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { parseTenge } from "../core/money";

export interface CalcQuery {
  price: number | undefined;
  zhk: string | undefined;
  program: string | undefined;
}

/** Reads autofill parameters from the URL: ?price=, ?zhk=, ?program=. */
export function useCalcQuery(): CalcQuery {
  const [params] = useSearchParams();
  return useMemo(() => {
    const priceRaw = params.get("price");
    const price = priceRaw ? parseTenge(priceRaw) : 0;
    return {
      price: price > 0 ? price : undefined,
      zhk: params.get("zhk") ?? undefined,
      program: params.get("program") ?? undefined,
    };
  }, [params]);
}
