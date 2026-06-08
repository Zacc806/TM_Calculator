/**
 * Base for the calculator's own API. Defaults to "/" (same-origin self-host) so a
 * build with no VITE_API_BASE still targets /api/* — Vite would otherwise inline
 * the literal string "undefined", silently breaking lead capture and the admin panel.
 */
const RAW_BASE = import.meta.env.VITE_API_BASE ?? "/";
const BASE = RAW_BASE.trim() === "" ? "/" : RAW_BASE;

/** Builds a URL for an `api/...` path under the configured base, with exactly one slash. */
export function apiUrl(path: string): string {
  const p = path.replace(/^\/+/, "");
  return BASE.endsWith("/") ? `${BASE}${p}` : `${BASE}/${p}`;
}
