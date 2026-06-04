import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIframeAutoHeight, HEIGHT_MESSAGE_TYPE } from "./useIframeAutoHeight";

describe("useIframeAutoHeight", () => {
  const postMessage = vi.fn();
  let originalParent: Window;

  beforeEach(() => {
    postMessage.mockClear();
    originalParent = window.parent;
    Object.defineProperty(window, "parent", { value: { postMessage }, configurable: true });
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
      fn(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });

  afterEach(() => {
    Object.defineProperty(window, "parent", { value: originalParent, configurable: true });
    vi.unstubAllGlobals();
  });

  it("posts the document height to the parent when enabled", () => {
    renderHook(() => useIframeAutoHeight(true));
    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: HEIGHT_MESSAGE_TYPE, height: expect.any(Number) }),
      "*",
    );
  });

  it("does nothing when disabled", () => {
    renderHook(() => useIframeAutoHeight(false));
    expect(postMessage).not.toHaveBeenCalled();
  });
});
