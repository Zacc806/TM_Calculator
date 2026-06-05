export interface Bx24Result {
  data(): unknown;
  error(): unknown;
}

export interface Bx24PlacementInfo {
  placement: string;
  options: Record<string, unknown>;
}

export interface Bx24Sdk {
  init(cb: () => void): void;
  placement: { info(): Bx24PlacementInfo };
  callMethod(method: string, params: Record<string, unknown>, cb: (res: Bx24Result) => void): void;
  fitWindow?(): void;
}

declare global {
  interface Window {
    BX24?: Bx24Sdk;
  }
}

const SDK_URL = "https://api.bitrix24.com/api/v1/";

/** Loads and initializes the BX24 SDK. Resolves null when not inside a Bitrix24 frame. */
export function loadBx24(timeoutMs = 4000): Promise<Bx24Sdk | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(null);
    // BX24 only works inside a Bitrix24 iframe. When opened standalone (left-menu
    // external link, direct URL) skip the SDK and render the calculator at once.
    if (window.top === window.self) return resolve(null);
    const finish = (sdk: Bx24Sdk | null) => resolve(sdk);

    if (window.BX24) {
      window.BX24.init(() => finish(window.BX24 ?? null));
      return;
    }

    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => {
      if (window.BX24) window.BX24.init(() => finish(window.BX24 ?? null));
      else finish(null);
    };
    script.onerror = () => finish(null);
    document.head.appendChild(script);

    window.setTimeout(() => {
      if (!window.BX24) finish(null);
    }, timeoutMs);
  });
}

/** Promisified BX24.callMethod. */
export function bx24Call<T = unknown>(
  sdk: Bx24Sdk,
  method: string,
  params: Record<string, unknown>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    sdk.callMethod(method, params, (res) => {
      const err = res.error();
      if (err) reject(err);
      else resolve(res.data() as T);
    });
  });
}

/** Reads the deal id from the current placement, if any. */
export function placementDealId(sdk: Bx24Sdk): string | null {
  try {
    const info = sdk.placement.info();
    const id = info?.options?.["ID"] ?? info?.options?.["ENTITY_ID"];
    return id ? String(id) : null;
  } catch {
    return null;
  }
}
