import { useEffect, useRef, useState } from "react";
import type { Program, ProgramsConfig } from "../core/programs.types";
import { isProgramsConfig } from "../core/programs";
import { getAdminToken, clearAdminToken } from "./AdminGate";
import { apiUrl } from "../lib/api";
import styles from "./Admin.module.css";

type SaveState = "idle" | "saving" | "saved" | "error";

const blank = (id: string): Program => ({
  id,
  name: "Новая программа",
  ratePercent: 10,
  termMonths: 120,
  recommendedDownPaymentPercent: 20,
  description: "",
  editable: false,
});

export function ProgramsEditor() {
  const [config, setConfig] = useState<ProgramsConfig | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [save, setSave] = useState<SaveState>("idle");
  const counter = useRef(0);

  useEffect(() => {
    let active = true;
    fetch(apiUrl("api/programs"))
      .then((r) => r.json())
      .then((c: ProgramsConfig) => {
        if (!active) return;
        setConfig(c);
        setPrograms([...c.programs]);
      })
      .catch((err) => console.error("[admin] load failed", err));
    return () => {
      active = false;
    };
  }, []);

  function patch(index: number, key: keyof Program, value: string | number | boolean) {
    setPrograms((prev) => prev.map((p, i) => (i === index ? { ...p, [key]: value } : p)));
    setSave("idle");
  }

  function addProgram() {
    counter.current += 1;
    setPrograms((prev) => [...prev, blank(`new-${counter.current}`)]);
  }

  function removeProgram(index: number) {
    setPrograms((prev) => prev.filter((_, i) => i !== index));
    setSave("idle");
  }

  async function onSave() {
    const next: ProgramsConfig = {
      version: config?.version ?? 0,
      updatedAt: config?.updatedAt ?? "",
      programs,
    };
    if (!isProgramsConfig(next)) {
      setSave("error");
      return;
    }
    const token = getAdminToken();
    if (!token) {
      clearAdminToken();
      window.location.reload();
      return;
    }
    setSave("saving");
    try {
      const res = await fetch(apiUrl("api/programs"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(next),
      });
      if (res.status === 401) {
        clearAdminToken();
        window.location.reload();
        return;
      }
      if (!res.ok) throw new Error(`save ${res.status}`);
      const data = (await res.json()) as { config: ProgramsConfig };
      setConfig(data.config);
      setSave("saved");
    } catch (err) {
      console.error("[admin] save failed", err);
      setSave("error");
    }
  }

  if (!config) return <p className={styles.meta}>Загрузка программ…</p>;

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <span className={styles.meta}>
          Версия {config.version}
          {config.updatedAt ? ` · обновлено ${new Date(config.updatedAt).toLocaleString("ru-RU")}` : ""}
        </span>
        <div>
          <button className={styles.btn} type="button" onClick={addProgram}>
            + Программа
          </button>
          <button className={styles.btnPrimary} type="button" onClick={onSave} disabled={save === "saving"} style={{ marginLeft: 8 }}>
            {save === "saving" ? "Сохраняем…" : "Сохранить"}
          </button>
          {save === "saved" && <span className={`${styles.status} ${styles.statusOk}`}>Сохранено ✓</span>}
          {save === "error" && <span className={`${styles.status} ${styles.statusErr}`}>Ошибка сохранения</span>}
        </div>
      </div>

      {programs.map((p, i) => (
        <div className={styles.card} key={p.id}>
          <div className={styles.cardHead}>
            <input
              className={`${styles.cell} ${styles.grow}`}
              value={p.name}
              aria-label="Название программы"
              onChange={(e) => patch(i, "name", e.target.value)}
            />
            <button className={styles.remove} type="button" onClick={() => removeProgram(i)}>
              Удалить
            </button>
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span className={styles.meta}>Ставка, %</span>
              <input
                className={styles.cell}
                type="number"
                step="0.1"
                value={p.ratePercent}
                onChange={(e) => patch(i, "ratePercent", Number(e.target.value))}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.meta}>Срок, мес.</span>
              <input
                className={styles.cell}
                type="number"
                value={p.termMonths}
                onChange={(e) => patch(i, "termMonths", Number(e.target.value))}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.meta}>Рек. ПВ, %</span>
              <input
                className={styles.cell}
                type="number"
                value={p.recommendedDownPaymentPercent}
                onChange={(e) => patch(i, "recommendedDownPaymentPercent", Number(e.target.value))}
              />
            </label>
          </div>
          <textarea
            className={styles.cell}
            rows={2}
            placeholder="Краткое пояснение (под выбором программы)"
            value={p.description}
            onChange={(e) => patch(i, "description", e.target.value)}
          />
          <label className={styles.field}>
            <span className={styles.meta}>Банк / оператор</span>
            <input
              className={styles.cell}
              value={p.bank ?? ""}
              onChange={(e) => patch(i, "bank", e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.meta}>Условия программы (модалка)</span>
            <textarea
              className={styles.cell}
              rows={3}
              value={p.conditions ?? ""}
              onChange={(e) => patch(i, "conditions", e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.meta}>Требования к клиенту</span>
            <textarea
              className={styles.cell}
              rows={3}
              value={p.requirements ?? ""}
              onChange={(e) => patch(i, "requirements", e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.meta}>Доступно по проектам</span>
            <textarea
              className={styles.cell}
              rows={2}
              value={p.projects ?? ""}
              onChange={(e) => patch(i, "projects", e.target.value)}
            />
          </label>
          <label className={styles.meta} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={p.editable}
              onChange={(e) => patch(i, "editable", e.target.checked)}
            />
            Ставка и срок редактируются вручную («свой вариант»)
          </label>
        </div>
      ))}
    </div>
  );
}
