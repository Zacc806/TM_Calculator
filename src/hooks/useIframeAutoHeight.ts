import { useEffect } from "react";

export const HEIGHT_MESSAGE_TYPE = "atamura-calc:height";

/**
 * When embedded in a cross-origin iframe, reports the document height to the
 * parent via postMessage so the host page can size the iframe. The parent must
 * listen for `{ type: "atamura-calc:height", height }` and validate the origin.
 */
export function useIframeAutoHeight(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || window.parent === window) return;

    let raf = 0;
    const post = () => {
      const height = Math.ceil(document.documentElement.scrollHeight);
      window.parent.postMessage({ type: HEIGHT_MESSAGE_TYPE, height }, "*");
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(post);
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    window.addEventListener("load", post);
    post();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("load", post);
    };
  }, [enabled]);
}
