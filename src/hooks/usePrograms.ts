import { useEffect, useState } from "react";
import type { ProgramsConfig } from "../core/programs.types";
import { fetchPrograms, SEED_PROGRAMS } from "../data/programs.client";

export function usePrograms(): { config: ProgramsConfig; loading: boolean } {
  const [config, setConfig] = useState<ProgramsConfig>(SEED_PROGRAMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const ctrl = new AbortController();
    fetchPrograms(ctrl.signal)
      .then((c) => {
        if (active) setConfig(c);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      ctrl.abort();
    };
  }, []);

  return { config, loading };
}
