type EventName = "calc_done" | "lead_submitted";

interface AnalyticsWindow {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  ym?: (...args: unknown[]) => void;
  ATAMURA_YM_ID?: number;
}

/**
 * Fires an analytics event to GTM/GA4 and Yandex.Metrika if present.
 * No-op when no counter is configured (ТЗ §9: «расчёт выполнен», конверсия в заявку).
 */
export function trackEvent(name: EventName, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as AnalyticsWindow;
  try {
    w.dataLayer?.push({ event: name, ...params });
    w.gtag?.("event", name, params);
    if (w.ym && w.ATAMURA_YM_ID) w.ym(w.ATAMURA_YM_ID, "reachGoal", name);
  } catch (err) {
    console.warn("[analytics] event failed", err);
  }
}
