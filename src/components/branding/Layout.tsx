import type { ReactNode } from "react";
import { useT } from "../../i18n";
import { Controls } from "./Controls";
import styles from "./Layout.module.css";

interface Props {
  children: ReactNode;
  variant?: "full" | "bare";
  title?: string;
  subtitle?: string;
}

export function Layout({ children, variant = "full", title, subtitle }: Props) {
  const t = useT();

  if (variant === "bare") {
    return (
      <div className={styles.page}>
        <main className={`${styles.main} ${styles.mainBare}`}>{children}</main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.brand} role="img" aria-label="Atamura Group">
            <svg className={styles.brandMark} viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
              <circle cx="28" cy="28" r="18" />
              <circle cx="72" cy="28" r="18" />
              <circle cx="28" cy="72" r="18" />
              <circle cx="72" cy="72" r="18" />
            </svg>
            <span className={styles.brandName}>ATAMURA</span>
          </span>
          <Controls />
        </div>
      </header>
      {(title || subtitle) && (
        <div className={styles.hero}>
          {title && <h1 className={styles.heroTitle}>{title}</h1>}
          {subtitle && <p className={styles.heroSub}>{subtitle}</p>}
        </div>
      )}
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>{t("footer.disclaimer")}</div>
      </footer>
    </div>
  );
}
