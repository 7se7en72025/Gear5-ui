import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OrbitHero } from "@/registry/gear5/ui/orbit-hero";
import {
  ProjectShowcase,
  showcaseProjects,
} from "@/registry/gear5/ui/project-showcase";
import { FeatureSwitcher } from "@/registry/gear5/ui/feature-switcher";
import { SpotlightBento } from "@/registry/gear5/ui/spotlight-bento";
import { PricingSwitch } from "@/registry/gear5/ui/pricing-switch";
import { TestimonialDeck } from "@/registry/gear5/ui/testimonial-deck";
import { PortfolioTemplate } from "@/registry/gear5/ui/portfolio-template";

afterEach(() => vi.restoreAllMocks());
describe("Orbit Hero", () => {
  it("supports the page heading level and neutralizes executable links", () => {
    render(
      <OrbitHero
        headingLevel="h1"
        title="My studio"
        action={{ label: "Work", href: "javascript:alert(1)" }}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "My studio" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Work" }).getAttribute("href"),
    ).toBe("#");
  });
});
describe("Project Showcase", () => {
  it("uses native disclosure and preserves caller content and safe links", () => {
    const project = {
      ...showcaseProjects[0],
      title: "My project",
      description: "Case study details",
      href: "/my-project",
    };
    const { container } = render(<ProjectShowcase projects={[project]} />);
    expect(container.querySelector("details > summary")?.textContent).toContain(
      "My project",
    );
    expect(screen.getByText("Case study details")).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Discuss a similar project", hidden: true })
        .getAttribute("href"),
    ).toBe("/my-project");
  });
});
describe("Feature Switcher", () => {
  it("switches the panel on click and exposes selection", () => {
    render(<FeatureSwitcher />);
    fireEvent.click(screen.getByRole("tab", { name: "Development" }));
    expect(screen.getByRole("tabpanel").textContent).toContain(
      "Bring it into the real world.",
    );
    expect(
      screen
        .getByRole("tab", { name: "Development" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(screen.getByRole("tab", { name: "Strategy" }).tabIndex).toBe(-1);
  });
  it("moves focus and selection with arrows, Home and End", () => {
    render(<FeatureSwitcher />);
    const first = screen.getByRole("tab", { name: "Strategy" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(document.activeElement).toBe(
      screen.getByRole("tab", { name: "Design" }),
    );
    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(document.activeElement).toBe(
      screen.getByRole("tab", { name: "Development" }),
    );
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: "End" });
    fireEvent.keyDown(document.activeElement!, { key: "Home" });
    expect(document.activeElement).toBe(first);
  });
  it("reverses arrows for a right-to-left layout", () => {
    render(<FeatureSwitcher />);
    const first = screen.getByRole("tab", { name: "Strategy" });
    first.style.direction = "rtl";
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(document.activeElement).toBe(
      screen.getByRole("tab", { name: "Development" }),
    );
  });
  it("links the active tab and panel and accepts custom visuals", () => {
    render(
      <FeatureSwitcher
        features={[
          {
            id: "mine",
            label: "Mine",
            title: "My feature",
            description: "My description",
            visual: <p>Custom preview</p>,
          },
        ]}
      />,
    );
    const panel = screen.getByRole("tabpanel");
    const tab = screen.getByRole("tab");
    expect(panel.getAttribute("aria-labelledby")).toBe(tab.id);
    expect(tab.getAttribute("aria-controls")).toBe(panel.id);
    expect(within(panel).getByText("Custom preview")).toBeTruthy();
  });
  it("handles a shorter feature array after rerender", () => {
    const { rerender } = render(<FeatureSwitcher />);
    fireEvent.click(screen.getByRole("tab", { name: "Development" }));
    rerender(
      <FeatureSwitcher
        features={[
          {
            id: "only",
            label: "Only",
            title: "Still visible",
            description: "One item",
          },
        ]}
      />,
    );
    expect(screen.getByRole("tabpanel").textContent).toContain("Still visible");
  });
  it("handles empty features without an orphan tabpanel", () => {
    render(<FeatureSwitcher features={[]} />);
    expect(screen.queryByRole("tabpanel")).toBeNull();
  });
});
describe("Pricing Switch", () => {
  it("updates price and total billing notes together", () => {
    render(<PricingSwitch />);
    fireEvent.click(screen.getByRole("radio", { name: "Yearly" }));
    expect(screen.getByText("$24")).toBeTruthy();
    expect(screen.getByText("$288 billed once a year")).toBeTruthy();
    expect(screen.queryByText("$29 billed each month")).toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: "Monthly" }));
    expect(screen.getByText("$29 billed each month")).toBeTruthy();
  });
  it("isolates the billing radio groups for multiple instances", () => {
    const { container } = render(
      <>
        <PricingSwitch />
        <PricingSwitch />
      </>,
    );
    const inputs = [
      ...container.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
    ];
    expect(inputs[0].name).not.toBe(inputs[2].name);
    fireEvent.click(inputs[1]);
    expect(inputs[1].checked).toBe(true);
    expect(inputs[2].checked).toBe(true);
  });
});
describe("Testimonial Deck", () => {
  it("wraps in both directions and retains navigation focus", () => {
    render(<TestimonialDeck />);
    const previous = screen.getByRole("button", {
      name: "Previous testimonial",
    });
    previous.focus();
    fireEvent.click(previous);
    expect(screen.getByText("Sam Rivera")).toBeTruthy();
    expect(document.activeElement).toBe(previous);
    fireEvent.click(screen.getByRole("button", { name: "Next testimonial" }));
    expect(screen.getByText("Jamie Chen")).toBeTruthy();
  });
  it("disables navigation for a single quote", () => {
    render(
      <TestimonialDeck
        testimonials={[
          { id: "one", name: "One", role: "Role", quote: "Quote" },
        ]}
      />,
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Next testimonial",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });
  it("handles empty and shrinking quote collections", () => {
    const { rerender } = render(<TestimonialDeck />);
    fireEvent.click(
      screen.getByRole("button", { name: "Previous testimonial" }),
    );
    rerender(<TestimonialDeck testimonials={[]} />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
describe("Spotlight Bento", () => {
  it("keeps its content available when matchMedia is unavailable", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue(
      undefined as unknown as MediaQueryList,
    );
    render(<SpotlightBento />);
    expect(
      screen.getByRole("heading", { name: "Good ideas, with room to breathe." }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Know what makes you, you." }),
    ).toBeTruthy();
  });
});
describe("Folio 01", () => {
  it("preserves explicit project destinations", () => {
    render(
      <PortfolioTemplate
        projects={[{ ...showcaseProjects[0], href: "/case-study" }]}
      />,
    );
    expect(
      screen
        .getByRole("link", { name: "Discuss a similar project", hidden: true })
        .getAttribute("href"),
    ).toBe("/case-study");
  });
  it("composes working sections with unique anchors and a configurable contact", () => {
    const { container } = render(
      <PortfolioTemplate name="My name" email="me@example.com" />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    for (const link of container.querySelectorAll<HTMLAnchorElement>(
      'a[href^="#"]',
    )) {
      const target = link.getAttribute("href")!.slice(1);
      expect(
        [...container.querySelectorAll("[id]")].some(
          (element) => element.id === target,
        ),
      ).toBe(true);
    }
    expect(
      screen.getByRole("link", { name: "me@example.com" }).getAttribute("href"),
    ).toBe("mailto:me@example.com");
  });
});
