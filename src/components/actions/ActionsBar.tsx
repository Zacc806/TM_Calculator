import { useState, type RefObject } from "react";
import type { CalcInput, CalcResult } from "../../core/calc.types";
import { buildSummary, copyToClipboard } from "../../lib/clipboard";
import { buildClientLink } from "../../lib/clientLink";
import { exportElementToPdf } from "../../lib/pdf";
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
  const [copied, setCopied] = useState(false);
  const [linked, setLinked] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  async function onCopyLink() {
    const url = buildClientLink(window.location.origin, input, programId ?? "");
    const ok = await copyToClipboard(url);
    if (ok) {
      setLinked(true);
      window.setTimeout(() => setLinked(false), 1800);
    }
  }

  async function onCopy() {
    const ok = await copyToClipboard(buildSummary(input, result, programName));
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  async function onPdf() {
    if (!cardRef.current || pdfBusy) return;
    setPdfBusy(true);
    try {
      await exportElementToPdf(cardRef.current, "raschet-atamura.pdf");
    } catch (err) {
      console.error("[pdf] export failed", err);
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <div className={styles.actions}>
      <button type="button" className={styles.actionBtn} onClick={() => window.print()}>
        <PrinterIcon /> Распечатать
      </button>
      <button type="button" className={styles.actionBtn} onClick={onCopy}>
        <CopyIcon /> {copied ? "Скопировано ✓" : "Скопировать"}
      </button>
      <button type="button" className={styles.actionBtn} onClick={onPdf} disabled={pdfBusy}>
        <DownloadIcon /> {pdfBusy ? "Готовим…" : "Скачать PDF"}
      </button>
      {shareLink && (
        <button type="button" className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={onCopyLink}>
          <LinkIcon /> {linked ? "Ссылка скопирована ✓" : "Ссылка клиенту"}
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

function PrinterIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
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
