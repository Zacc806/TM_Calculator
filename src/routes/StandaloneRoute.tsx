import { Layout } from "../components/branding/Layout";
import { Calculator } from "../components/Calculator/Calculator";
import { useT } from "../i18n";

export function StandaloneRoute() {
  const t = useT();
  return (
    <Layout variant="full" title={t("landing.title")} subtitle={t("landing.subtitle")}>
      <Calculator context="standalone" initial={{ programId: "rassrochka" }} showLead leadSource="site" />
    </Layout>
  );
}
