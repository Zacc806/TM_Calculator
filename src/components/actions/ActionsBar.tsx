import { useState, type RefObject } from "react";
import type { CalcInput, CalcResult } from "../../core/calc.types";
import { buildSummary, copyToClipboard } from "../../lib/clipboard";
import { exportElementToPdf } from "../../lib/pdf";
import styles from "../Calculator/Calculator.module.css";

interface Props {
  cardRef: RefObject<HTMLDivElement | null>;
  input: CalcInput;
  result: CalcResult;
  programName: string;
}

export function ActionsBar({ cardRef, input, result, programName }: Props) {
  const [copied, setCopied] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

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
    </div>
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
