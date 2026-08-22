import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  TimezoneMap,
  TimezoneMapGlobe,
  TimezoneMapList,
  TimezoneMapOption,
  TimezoneMapSearch,
  useTimezoneMap,
} from "./index";
import type { TimezoneOption } from "./index";

const CITIES: TimezoneOption[] = [
  { id: "lon", city: "London", country: "UK", timezone: "Europe/London", lat: 51.5, lng: -0.1 },
  { id: "nyc", city: "New York", country: "US", timezone: "America/New_York", lat: 40.7, lng: -74 },
  { id: "tok", city: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", lat: 35.7, lng: 139.7 },
];

function Options() {
  const { filteredOptions } = useTimezoneMap();
  return (
    <>
      {filteredOptions.map((option, index) => (
        <TimezoneMapOption key={option.id} option={option} index={index} />
      ))}
    </>
  );
}

function Example(props: {
  value?: string;
  onValueChange?: (tz: string, option: TimezoneOption) => void;
}) {
  return (
    <TimezoneMap options={CITIES} label="Timezone" {...props}>
      <TimezoneMapSearch />
      <TimezoneMapList>
        <Options />
      </TimezoneMapList>
      <TimezoneMapGlobe />
    </TimezoneMap>
  );
}

describe("TimezoneMap", () => {
  it("exposes a labelled searchbox and listbox", () => {
    render(<Example />);
    expect(screen.getByRole("searchbox", { name: "Timezone" })).toBeInTheDocument();
    expect(screen.getByRole("listbox", { name: "Timezone" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("filters the list as the user types", async () => {
    render(<Example />);
    await userEvent.type(screen.getByRole("searchbox"), "tok");

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Tokyo");
  });

  it("matches on country and timezone too, not just city", async () => {
    render(<Example />);

    await userEvent.type(screen.getByRole("searchbox"), "Japan");
    expect(screen.getAllByRole("option")).toHaveLength(1);

    await userEvent.clear(screen.getByRole("searchbox"));
    await userEvent.type(screen.getByRole("searchbox"), "America/New_York");
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });

  it("selects on click and reports the IANA timezone, not the internal id", async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);

    await userEvent.click(screen.getByText("Tokyo"));
    expect(onValueChange).toHaveBeenCalledWith("Asia/Tokyo", CITIES[2]);
  });

  it("costs one tab stop for the whole list, per roving tabindex", async () => {
    render(<Example />);
    const options = screen.getAllByRole("option");

    expect(options[0]).toHaveAttribute("tabindex", "0");
    expect(options[1]).toHaveAttribute("tabindex", "-1");
    expect(options[2]).toHaveAttribute("tabindex", "-1");
  });

  it("moves the roving index with the arrow keys and wraps", async () => {
    render(<Example />);
    const listbox = screen.getByRole("listbox");
    const options = screen.getAllByRole("option");

    options[0]?.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(options[1]).toHaveFocus();

    listbox.focus();
    await userEvent.keyboard("{ArrowUp}");
    // Wraps to the last item from the first.
  });

  it("selects the focused option with Enter", async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);

    const options = screen.getAllByRole("option");
    act(() => {
      options[1]?.focus();
    });
    await userEvent.keyboard("{Enter}");

    expect(onValueChange).toHaveBeenCalledWith("America/New_York", CITIES[1]);
  });

  it("marks the selected option with aria-selected", () => {
    render(<Example value="lon" />);
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    expect(options[1]).toHaveAttribute("aria-selected", "false");
  });

  it("keeps the roving index in range after a search narrows the list", async () => {
    render(<Example />);
    const options = screen.getAllByRole("option");
    act(() => {
      options[2]?.focus();
    });

    await userEvent.type(screen.getByRole("searchbox"), "London");
    // Only one option remains; nothing should throw or point past the end.
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });

  it("hides the visual globe from assistive tech, since the list already covers it", () => {
    const { container } = render(<Example />);
    const globe = container.querySelector('[data-handoff-slot="tzmap-globe"]');
    expect(globe).toHaveAttribute("aria-hidden", "true");
  });

  it("places a marker per option, positioned by real latitude and longitude", () => {
    const { container } = render(<Example />);
    const markers = container.querySelectorAll('[data-handoff-slot="tzmap-marker"]');
    expect(markers).toHaveLength(3);

    // Tokyo (139.7E, 35.7N) should land in the right and upper half of the map.
    const tokyo = [...markers].find((m) =>
      (m as HTMLElement).title.startsWith("Tokyo"),
    ) as HTMLElement;
    const x = Number.parseFloat(tokyo.style.left);
    const y = Number.parseFloat(tokyo.style.top);
    expect(x).toBeGreaterThan(50);
    expect(y).toBeLessThan(50);
  });

  it("selecting a marker updates the same state the list reads", async () => {
    const onValueChange = vi.fn();
    const { container } = render(<Example onValueChange={onValueChange} />);

    const marker = [...container.querySelectorAll('[data-handoff-slot="tzmap-marker"]')].find(
      (m) => (m as HTMLElement).title.startsWith("London"),
    ) as HTMLElement;

    await userEvent.click(marker);
    expect(onValueChange).toHaveBeenCalledWith("Europe/London", CITIES[0]);
  });

  it("announces the selection", async () => {
    render(<Example />);
    await userEvent.click(screen.getByText("London"));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Selected London, Europe/London.",
    );
  });
});
