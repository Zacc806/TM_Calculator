import { Layout } from "../components/branding/Layout";
import { AdminGate } from "../admin/AdminGate";
import { ProgramsEditor } from "../admin/ProgramsEditor";

export function AdminRoute() {
  return (
    <Layout variant="full" title="Программы и ставки" subtitle="Редактирование пресетов калькулятора. Изменения применяются без переустановки.">
      <AdminGate>
        <ProgramsEditor />
      </AdminGate>
    </Layout>
  );
}
