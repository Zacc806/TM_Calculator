import { useT } from "../../i18n";

export function ConsentText() {
  const t = useT();
  return <span>{t("lead.consent")}</span>;
}
