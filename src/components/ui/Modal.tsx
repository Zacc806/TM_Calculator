import { useEffect, useRef, type ReactNode } from "react";
import { useT } from "../../i18n";
import styles from "./Modal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, children }: Props) {
  const t = useT();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const card = cardRef.current;
    const focusables = (): HTMLElement[] =>
      card ? Array.from(card.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];

    // Move focus into the dialog so keyboard/screen-reader users start inside it.
    (focusables()[0] ?? card)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      // Trap focus: cycle between the first and last focusable element.
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.(); // restore focus to the trigger on close
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className={styles.card} ref={cardRef} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h2 className={styles.title}>{title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label={t("modal.close")}>
            ×
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}

export { styles as modalStyles };
