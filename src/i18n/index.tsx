import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Lang } from "./translations";

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nCtx | null>(null);
const KEY = "atamura_lang";

function initialLang(): Lang {
  if (typeof window === "undefined") return "ru";
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "ru" || saved === "kk") return saved;
  } catch {
    /* ignore */
  }
  return "ru";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang === "kk" ? "kk" : "ru");
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const value = useMemo<I18nCtx>(
    () => ({
      lang,
      setLang,
      t: (key) => translations[lang][key] ?? translations.ru[key] ?? key,
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LangProvider");
  return ctx;
}

export function useT(): (key: string) => string {
  return useI18n().t;
}
