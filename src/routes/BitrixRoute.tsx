import { useEffect, useRef, useState } from "react";
import { Layout } from "../components/branding/Layout";
import { Calculator } from "../components/Calculator/Calculator";
import type { UseCalculatorInit } from "../hooks/useCalculator";
import type { CalcInput, CalcResult } from "../core/calc.types";
import { buildSummary } from "../lib/clipboard";
import { loadBx24, bx24Call, placementDealId, type Bx24Sdk } from "../bitrix/bx24";
import styles from "../components/Calculator/Calculator.module.css";

type SaveState = "idle" | "saving" | "saved" | "error";

interface Snapshot {
  result: CalcResult;
  input: CalcInput;
  programName: string;
}

export function BitrixRoute() {
  const [ready, setReady] = useState(false);
  const [dealId, setDealId] = useState<string | null>(null);
  const [initial, setInitial] = useState<UseCalculatorInit>({ programId: "rassrochka" });
  const [save, setSave] = useState<SaveState>("idle");
  const sdkRef = useRef<Bx24Sdk | null>(null);
  const snapRef = useRef<Snapshot | null>(null);

  useEffect(() => {
    let active = true;
    loadBx24().then(async (sdk) => {
      if (!active) return;
      sdkRef.current = sdk;
      if (sdk) {
        const id = placementDealId(sdk);
        if (id) {
          setDealId(id);
          try {
            const deal = await bx24Call<Record<string, unknown>>(sdk, "crm.deal.get", { id });
            const cost = Math.round(Number(deal.OPPORTUNITY));
            if (Number.isFinite(cost) && cost > 0) {
              setInitial({ programId: "rassrochka", cost });
            }
          } catch (err) {
            console.warn("[bx24] crm.deal.get failed", err);
          }
        }
      }
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  async function saveToDeal() {
    const sdk = sdkRef.current;
    const snap = snapRef.current;
    if (!sdk || !dealId || !snap) return;
    setSave("saving");
    try {
      await bx24Call(sdk, "crm.timeline.comment.add", {
        fields: {
          ENTITY_ID: Number(dealId),
          ENTITY_TYPE: "deal",
          COMMENT: buildSummary(snap.input, snap.result, snap.programName),
        },
      });
      setSave("saved");
    } catch (err) {
      console.error("[bx24] save to deal failed", err);
      setSave("error");
    }
  }

  if (!ready) {
    return (
      <Layout variant="bare">
        <p style={{ color: "var(--ink-soft)" }}>Загрузка калькулятора…</p>
      </Layout>
    );
  }

  const saveSlot = dealId ? (
    <div className={styles.actions}>
      <button type="button" className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={saveToDeal} disabled={save === "saving"}>
        {save === "saving" ? "Сохраняем…" : save === "saved" ? "Сохранено в сделку ✓" : "Сохранить в сделку"}
      </button>
    </div>
  ) : null;

  return (
    <Layout variant="bare">
      <Calculator
        key={`${dealId ?? "manual"}-${initial.cost ?? 0}`}
        context="bitrix"
        initial={initial}
        showShareLink
        saveSlot={saveSlot}
        onResultChange={(result, input, meta) => {
          snapRef.current = { result, input, programName: meta.programName };
        }}
      />
    </Layout>
  );
}
