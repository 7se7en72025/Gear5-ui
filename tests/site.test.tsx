import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Copyable } from "@/components/site/copyable";
import { Preview } from "@/components/site/preview";
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("clipboard", () => {
  it("copies exact source and announces completion", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<Copyable value="exact source" label="Copy source" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy source" }));
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe(
        "Copied to clipboard",
      ),
    );
    expect(writeText).toHaveBeenCalledWith("exact source");
  });
  it("offers a manual fallback on denied clipboard access", async () => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    render(<Copyable value="source" label="Copy source" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy source" }));
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain(
        "Select the code",
      ),
    );
  });
});
describe("live customization", () => {
  it("changes the heading and restores the original block on reset", () => {
    render(<Preview name="feature-switcher" showControls />);
    fireEvent.change(screen.getByRole("textbox", { name: "Preview heading" }), {
      target: { value: "My process" },
    });
    expect(screen.getByRole("heading", { name: "My process" })).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "Development" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset preview" }));
    expect(
      screen.getByRole("heading", {
        name: "From the first idea to the final pixel.",
      }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("tab", { name: "Strategy" })
        .getAttribute("aria-selected"),
    ).toBe("true");
  });
  it("changes the actual block accent", () => {
    const { container } = render(<Preview name="orbit-hero" showControls />);
    fireEvent.click(screen.getByLabelText("Lavender"));
    expect(container.querySelector("section")?.getAttribute("style")).toContain(
      "#d3c8ff",
    );
  });
  it("copies the chosen accent and safely escaped heading into runnable usage", () => {
    render(<Preview name="orbit-hero" showControls />);
    const title = 'A "quoted" headline\nSecond line';
    fireEvent.change(screen.getByRole("textbox", { name: "Preview heading" }), {
      target: { value: title },
    });
    fireEvent.click(screen.getByLabelText("Peach"));
    const value = (
      screen.getByRole("textbox", {
        name: "Preview heading",
      }) as HTMLInputElement
    ).value;
    expect(screen.getByLabelText("customized usage").textContent).toContain(
      `title={${JSON.stringify(value)}}`,
    );
    expect(screen.getByLabelText("customized usage").textContent).toContain(
      'accent={"#ffcbaa"}',
    );
  });
});
