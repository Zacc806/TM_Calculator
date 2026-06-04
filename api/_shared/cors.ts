import type { VercelResponse } from "@vercel/node";

/** Applies CORS headers allowing the calculator's own origin to POST leads. */
export function applyCors(res: VercelResponse, allowedOrigin: string): void {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}
