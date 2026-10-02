import { describe, expect, it } from "vitest";
import { sanitizeHref } from "@/registry/gear5/lib/sanitize";

describe("navigation URL sanitization", () => {
  it.each([
    "javascript:alert(1)",
    "java\nscript:alert(1)",
    "java\tscript:alert(1)",
    "\rjavascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
  ])("blocks executable URL %j", (url) => {
    expect(sanitizeHref(url)).toBe("#");
  });
  it.each([
    "/work",
    "#contact",
    "https://example.com",
    "mailto:me@example.com",
  ])("preserves supported navigation %j", (url) => {
    expect(sanitizeHref(url)).toBe(url);
  });
});
