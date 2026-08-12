import "@testing-library/jest-dom/vitest";

// jsdom implements neither of these, and LogStream's autoscroll depends on
// both. The stubs let the component mount; the scrolling behaviour itself is
// verified against a real browser rather than pretended at here.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

if (typeof Element !== "undefined" && !Element.prototype.scrollTo) {
  Element.prototype.scrollTo = function scrollTo() {};
}
