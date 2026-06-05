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
          <img className={styles.logo} src="/brand/logo.svg" alt="Atamura Group" />
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
