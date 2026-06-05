import { useState } from "react";
import { Layout } from "../components/branding/Layout";
import { AdminGate } from "../admin/AdminGate";
import { ProgramsEditor } from "../admin/ProgramsEditor";
import { LeadsViewer } from "../admin/LeadsViewer";
import styles from "../admin/Admin.module.css";

type Tab = "programs" | "leads";

function AdminTabs() {
  const [tab, setTab] = useState<Tab>("programs");
  return (
    <div className={styles.wrap}>
      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          className={`${styles.tab} ${tab === "programs" ? styles.tabActive : ""}`}
          onClick={() => setTab("programs")}
        >
          Программы
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === "leads" ? styles.tabActive : ""}`}
          onClick={() => setTab("leads")}
        >
          Заявки
        </button>
      </div>
      {tab === "programs" ? <ProgramsEditor /> : <LeadsViewer />}
    </div>
  );
}

export function AdminRoute() {
  return (
    <Layout variant="full" title="Программы и заявки" subtitle="Редактирование пресетов и просмотр заявок. Изменения применяются без переустановки.">
      <AdminGate>
        <AdminTabs />
      </AdminGate>
    </Layout>
  );
}
