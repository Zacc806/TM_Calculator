import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Test-only mock req/res helpers for exercising Vercel handlers in unit tests. */

export interface CapturedRes {
  res: VercelResponse;
  statusCode: () => number;
  body: () => unknown;
  headers: Record<string, string>;
}

export function createRes(): CapturedRes {
  let statusCode = 0;
  let body: unknown;
  const headers: Record<string, string> = {};
  const res = {
    setHeader: (k: string, v: string | number) => {
      headers[k] = String(v);
    },
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      body = payload;
      return this;
    },
    end() {
      return this;
    },
  };
  return {
    res: res as unknown as VercelResponse,
    statusCode: () => statusCode,
    body: () => body,
    headers,
  };
}

export function makeReq(over: Partial<VercelRequest> & { ip?: string } = {}): VercelRequest {
  const { ip, ...rest } = over;
  return {
    headers: {},
    socket: { remoteAddress: ip ?? "127.0.0.1" },
    ...rest,
  } as unknown as VercelRequest;
}
