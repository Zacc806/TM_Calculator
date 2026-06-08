import { useState } from "react";
import type { CalcInput, CalcResult } from "../../core/calc.types";
import { validateLead, type LeadPayload } from "../../core/lead";
import { apiUrl } from "../../lib/api";
import { trackEvent } from "../../lib/analytics";
import { useT } from "../../i18n";
import { ConsentText } from "./ConsentText";
import styles from "./LeadForm.module.css";

interface Props {
  input: CalcInput;
  result: CalcResult;
  programId: string;
  programName: string;
  source: string;
}

type Status = "idle" | "sending" | "success" | "error";

export function LeadForm({ input, result, programId, programName, source }: Props) {
  const t = useT();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [touched, setTouched] = useState(false);

  const payload: LeadPayload = {
    name,
    phone,
    cost: input.cost,
    downPayment: input.downPayment,
    programId,
    programName,
    annualRatePercent: input.annualRatePercent,
    termMonths: input.termMonths,
    monthlyPayment: result.monthlyPayment,
    source,
    consent,
  };
  const validation = validateLead(payload);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!validation.ok || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch(apiUrl("api/lead"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`lead responded ${res.status}`);
      trackEvent("lead_submitted", { source, programId });
      setStatus("success");
    } catch (err) {
      console.error("[lead] submit failed", err);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.card}>
        <div className={styles.success}>
          <svg className={styles.successIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <p className={styles.successTitle}>{t("lead.successTitle")}</p>
          <p className={styles.successText}>{t("lead.successText")}</p>
        </div>
      </div>
    );
  }

  const nameError = touched && validation.errors.includes("name");
  const phoneError = touched && validation.errors.includes("phone");

  return (
    <form className={styles.card} onSubmit={onSubmit} noValidate>
      <h2 className={styles.title}>{t("lead.title")}</h2>
      <p className={styles.lead}>{t("lead.subtitle")}</p>

      <div className={styles.row}>
        <input
          className={`${styles.input} ${nameError ? styles.inputError : ""}`}
          placeholder={t("lead.name")}
          aria-label={t("lead.name")}
          aria-invalid={nameError}
          value={name}
          autoComplete="name"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={`${styles.input} ${phoneError ? styles.inputError : ""}`}
          placeholder="+7 (___) ___-__-__"
          aria-label={t("lead.phone")}
          aria-invalid={phoneError}
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <label className={styles.consent}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <ConsentText />
      </label>

      <button className={styles.submit} type="submit" disabled={status === "sending"}>
        {status === "sending" ? t("lead.submitting") : t("lead.submit")}
      </button>

      {touched && !validation.ok && (
        <p className={`${styles.note} ${styles.noteError}`}>{t("lead.errorRequired")}</p>
      )}
      {status === "error" && <p className={`${styles.note} ${styles.noteError}`}>{t("lead.errorSend")}</p>}
    </form>
  );
}
