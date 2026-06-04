import type { VercelRequest } from "@vercel/node";

/** Best-effort client IP from x-forwarded-for / socket. */
export function clientIp(req: VercelRequest): string {
  const xff = req.headers["x-forwarded-for"];
  if (Array.isArray(xff)) return xff[0] ?? "unknown";
  if (typeof xff === "string") return xff.split(",")[0]?.trim() ?? "unknown";
  return req.socket?.remoteAddress ?? "unknown";
}

/** Parses the request body whether Vercel delivered it as a string or an object. */
export function readJsonBody(req: VercelRequest): unknown {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return req.body ?? null;
}
