// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { fixtures } from "@/components/demos";
describe("server rendering", () => {
  it.each(Object.keys(fixtures))(
    "%s renders without browser globals",
    (name) => {
      expect(() => renderToStaticMarkup(fixtures[name]())).not.toThrow();
    },
  );
});
