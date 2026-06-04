import type { ReactNode } from "react";
import styles from "./Layout.module.css";

interface Props {
  children: ReactNode;
  variant?: "full" | "bare";
  title?: string;
  subtitle?: string;
}

export function Layout({ children, variant = "full", title, subtitle }: Props) {
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
          <span className={styles.headerTag}>Калькулятор платежа</span>
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
        <div className={styles.footerInner}>
          Расчёт носит информационный характер и не является публичной офертой. Точные ставки,
          сроки и условия программ уточняйте у менеджеров Atamura Group и банков-партнёров.
        </div>
      </footer>
    </div>
  );
}
