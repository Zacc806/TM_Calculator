import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { parseTenge } from "../core/money";
import type { Lang } from "../i18n/translations";

export interface CalcQuery {
  /** Apartment cost, ₸. */
  price: number | undefined;
  /** Down payment amount, ₸ (used by the client share link). */
  dp: number | undefined;
  /** Annual rate, %. */
  rate: number | undefined;
  /** Term, months. */
  term: number | undefined;
  zhk: string | undefined;
  program: string | undefined;
  /** Locale requested by the host page (iframe ?lang=ru|kk). */
  lang: Lang | undefined;
}

function num(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** Reads autofill / client-link parameters from the URL. */
export function useCalcQuery(): CalcQuery {
  const [params] = useSearchParams();
  return useMemo(() => {
    const priceRaw = params.get("price");
    const price = priceRaw ? parseTenge(priceRaw) : 0;
    const dpRaw = params.get("dp");
    const langRaw = params.get("lang");
    return {
      price: price > 0 ? price : undefined,
      dp: dpRaw ? parseTenge(dpRaw) : undefined,
      rate: num(params.get("rate")),
      term: num(params.get("term")),
      zhk: params.get("zhk") ?? undefined,
      program: params.get("program") ?? undefined,
      lang: langRaw === "ru" || langRaw === "kk" || langRaw === "en" ? langRaw : undefined,
    };
  }, [params]);
}
