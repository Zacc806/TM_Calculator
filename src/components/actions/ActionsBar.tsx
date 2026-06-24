import { useState, type RefObject } from "react";
import type { CalcInput, CalcResult } from "../../core/calc.types";
import { buildSummary, copyToClipboard } from "../../lib/clipboard";
import { buildClientLink } from "../../lib/clientLink";
import { exportElementToPdf } from "../../lib/pdf";
import { trackEvent } from "../../lib/analytics";
import { useT } from "../../i18n";
import styles from "../Calculator/Calculator.module.css";

interface Props {
  cardRef: RefObject<HTMLDivElement | null>;
  input: CalcInput;
  result: CalcResult;
  programName: string;
  /** Manager contexts: show a "client link" button (no personal data in the URL). */
  shareLink?: boolean;
  programId?: string;
}

export function ActionsBar({ cardRef, input, result, programName, shareLink, programId }: Props) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const [linked, setLinked] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  async function onCopyLink() {
    const url = buildClientLink(window.location.origin, input, programId ?? "");
    const ok = await copyToClipboard(url);
    if (ok) {
      trackEvent("calc_done", { action: "client_link" });
      setLinked(true);
      window.setTimeout(() => setLinked(false), 1800);
    }
  }

  async function onCopy() {
    const ok = await copyToClipboard(buildSummary(input, result, programName));
    if (ok) {
      trackEvent("calc_done", { action: "copy" });
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }


  async function onPdf() {
    if (!cardRef.current || pdfBusy) return;
    setPdfBusy(true);
    cardRef.current.setAttribute("data-theme", "light");
    try {
      await exportElementToPdf(cardRef.current, "raschet-atamura.pdf");
      trackEvent("calc_done", { action: "pdf" });
    } catch (err) {
      console.error("[pdf] export failed", err);
    } finally {
      cardRef.current?.removeAttribute("data-theme");
      setPdfBusy(false);
    }
  }

  // K1: «Консультация с менеджером» — WhatsApp с приветствием + расчётом (вариант A: текст).
  // wa.me умеет только текст; PDF автоматически не прикрепить, поэтому расчёт передаём строками.
  const consultUrl =
    "https://wa.me/77006410499?text=" +
    encodeURIComponent(
      "Здравствуйте! Я сделал(а) расчёт ипотеки на сайте ATAMURA и хочу получить консультацию менеджера.\n\n" +
        buildSummary(input, result, programName),
    ) +
    "&utm_source=site&utm_medium=whatsapp&utm_campaign=calc";

  return (
    <div className={styles.actions}>
      <a
        className={`${styles.actionBtn} ${styles.actionBtnPrimary} ${styles.actionBtnWide}`}
        href={consultUrl}
        target="_blank"
        rel="noopener"
        onClick={() => trackEvent("calc_done", { action: "whatsapp_consult" })}
      >
        <WaIcon /> {t("action.consult")}
      </a>
      <button type="button" className={styles.actionBtn} onClick={onCopy}>
        <CopyIcon /> {copied ? t("action.copied") : t("action.copy")}
      </button>
      <button type="button" className={styles.actionBtn} onClick={onPdf} disabled={pdfBusy}>
        <DownloadIcon /> {pdfBusy ? t("action.pdfBusy") : t("action.pdf")}
      </button>
      {shareLink && (
        <button type="button" className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={onCopyLink}>
          <LinkIcon /> {linked ? t("action.linkCopied") : t("action.clientLink")}
        </button>
      )}
    </div>
  );
}

function LinkIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function WaIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.41 14.09c-.24.67-1.2 1.22-1.66 1.29-.44.06-.84.27-2.83-.59-2.39-1.04-3.93-3.5-4.05-3.66-.12-.16-.97-1.29-.97-2.46 0-1.17.61-1.74.83-1.98.22-.24.48-.3.64-.3.16 0 .32 0 .46.01.15.01.35-.06.54.41.2.48.69 1.68.75 1.8.06.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.25.31-.36.42-.12.12-.24.25-.1.49.14.24.63 1.04 1.35 1.68.93.83 1.72 1.09 1.96 1.21.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.42.67 1.66.79.24.12.4.18.46.28.06.1.06.58-.18 1.25z"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="1" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}
