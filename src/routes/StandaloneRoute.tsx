import { Layout } from "../components/branding/Layout";
import { Calculator } from "../components/Calculator/Calculator";

export function StandaloneRoute() {
  return (
    <Layout
      variant="full"
      title="Калькулятор ежемесячного платежа"
      subtitle="Узнайте платёж по квартире за несколько секунд: выберите программу, укажите стоимость и первоначальный взнос."
    >
      <Calculator context="standalone" initial={{ programId: "rassrochka" }} showLead leadSource="calculator" />
    </Layout>
  );
}
