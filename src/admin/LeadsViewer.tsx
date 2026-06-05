import { useEffect, useState } from "react";
import { getAdminToken, clearAdminToken } from "./AdminGate";
import { formatTenge } from "../core/money";
import styles from "./Admin.module.css";

interface LeadRecord {
  at: string;
  name: string;
  phone: string;
  cost: number;
  monthlyPayment: number;
  programName: string;
  source: string;
}

export function LeadsViewer() {
  const [leads, setLeads] = useState<LeadRecord[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const token = getAdminToken();
    fetch(`${import.meta.env.VITE_API_BASE}api/leads`, {
      headers: { Authorization: `Bearer ${token ?? ""}` },
    })
      .then((r) => {
        if (r.status === 401) {
          clearAdminToken();
          window.location.reload();
          throw new Error("unauthorized");
        }
        return r.json();
      })
      .then((d: { leads?: LeadRecord[] }) => {
        if (active) setLeads(d.leads ?? []);
      })
      .catch((err) => {
        console.warn("[admin] leads load failed", err);
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) return <p className={styles.meta}>Не удалось загрузить заявки.</p>;
  if (!leads) return <p className={styles.meta}>Загрузка заявок…</p>;
  if (!leads.length) return <p className={styles.meta}>Заявок пока нет.</p>;

  return (
    <div className={styles.wrap}>
      <p className={styles.meta} style={{ marginBottom: 12 }}>
        Всего заявок: {leads.length} (новые сверху)
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Имя</th>
              <th>Телефон</th>
              <th>Стоимость</th>
              <th>Платёж</th>
              <th>Программа</th>
              <th>Источник</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l, i) => (
              <tr key={`${l.at}-${i}`}>
                <td>{new Date(l.at).toLocaleString("ru-RU")}</td>
                <td>{l.name}</td>
                <td>+{l.phone}</td>
                <td>{formatTenge(l.cost)}</td>
                <td>{formatTenge(l.monthlyPayment)}</td>
                <td>{l.programName}</td>
                <td>{l.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
