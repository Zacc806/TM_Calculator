import { useTheme } from "../../theme";
import { useI18n } from "../../i18n";
import { LANGS } from "../../i18n/translations";
import styles from "./Layout.module.css";

export function Controls() {
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useI18n();
  return (
    <div className={styles.controls}>
      <div className={styles.langToggle} role="group" aria-label={t("ctrl.lang.aria")}>
        {LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            className={`${styles.langBtn} ${lang === l.code ? styles.langBtnActive : ""}`}
            aria-pressed={lang === l.code}
            onClick={() => setLang(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>
      <button type="button" className={styles.themeBtn} aria-label={t("ctrl.theme.aria")} onClick={toggle}>
        {theme === "light" ? <MoonIcon /> : <SunIcon />}
      </button>
    </div>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}
