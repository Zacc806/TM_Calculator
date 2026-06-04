import type { VercelRequest, VercelResponse } from "@vercel/node";
import seedJson from "../src/data/programs.seed.json";
import type { ProgramsConfig } from "../src/core/programs.types";
import { isProgramsConfig } from "../src/core/programs";
import { applyCors } from "./_shared/cors";
import { bearer, verifyToken } from "./_shared/adminAuth";
import { readJsonBody } from "./_shared/http";
import { readProgramsConfig, writeProgramsConfig } from "./_shared/edgeConfig";

const SEED = seedJson as ProgramsConfig;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  applyCors(res, process.env.ALLOWED_ORIGIN ?? "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method === "GET") {
    const config = await readProgramsConfig(SEED);
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.status(200).json(config);
    return;
  }

  if (req.method === "POST") {
    const secret = process.env.ADMIN_TOKEN_SECRET;
    const token = bearer(req.headers.authorization);
    if (!secret || !token || !verifyToken(token, secret)) {
      res.status(401).json({ ok: false, error: "unauthorized" });
      return;
    }

    const body = readJsonBody(req);
    if (!isProgramsConfig(body)) {
      res.status(400).json({ ok: false, error: "invalid_config" });
      return;
    }

    const config: ProgramsConfig = {
      version: (Number(body.version) || 0) + 1,
      updatedAt: new Date().toISOString(),
      programs: body.programs,
    };
    try {
      await writeProgramsConfig(config);
      res.status(200).json({ ok: true, config });
    } catch (err) {
      console.error("[programs] write failed", err);
      res.status(500).json({ ok: false, error: "write_failed" });
    }
    return;
  }

  res.status(405).json({ ok: false, error: "method_not_allowed" });
}
