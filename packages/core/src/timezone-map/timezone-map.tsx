import * as React from "react";
import { createContext } from "../utils/create-context";
import { resolveElement } from "../utils/slot";
import { visuallyHidden } from "../utils/visually-hidden";

/** A pickable location, tied to a real IANA timezone. */
export interface TimezoneOption {
  id: string;
  city: string;
  country?: string;
  /** IANA identifier, e.g. `Europe/London`. */
  timezone: string;
  lat: number;
  lng: number;
}

interface TimezoneMapContextValue {
  options: readonly TimezoneOption[];
  filteredOptions: readonly TimezoneOption[];
  value: string | undefined;
  select: (option: TimezoneOption) => void;
  search: string;
  setSearch: (value: string) => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  registerItem: (index: number, node: HTMLElement | null) => void;
  labelId: string;
}

const [TimezoneMapProvider, useTimezoneMapContext] =
  createContext<TimezoneMapContextValue>("TimezoneMap");

/** Read the current selection, search text, and filtered options. */
export function useTimezoneMap(): TimezoneMapContextValue {
  return useTimezoneMapContext("useTimezoneMap");
}

/**
 * Equirectangular projection: exact by construction, unlike a hand-traced
 * coastline. Longitude maps linearly to x, latitude linearly to y.
 */
function project(lat: number, lng: number): { x: number; y: number } {
  return {
    x: ((lng + 180) / 360) * 100,
    y: ((90 - lat) / 180) * 100,
  };
}

function matches(option: TimezoneOption, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    option.city.toLowerCase().includes(q) ||
    (option.country?.toLowerCase().includes(q) ?? false) ||
    option.timezone.toLowerCase().includes(q)
  );
}

export interface TimezoneMapProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  options: readonly TimezoneOption[];
  /** Selected option id. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (timezone: string, option: TimezoneOption) => void;
  label?: string;
  asChild?: boolean;
}

/**
 * A searchable location picker with a supplementary world map.
 *
 * Clicking a point on a map is not, by itself, an accessible way to choose a
 * timezone: there is no keyboard path onto a bare SVG marker and no way for a
 * screen reader to know what a dot at (61%, 34%) means. So the accessible path
 * here is the search box and listbox, which are fully keyboard operable and
 * correctly labelled, and the map is a pointer-only enhancement layered on top
 * of the same selection state, hidden from assistive tech since everything it
 * can do is already reachable through the list.
 *
 * Marker positions come from an equirectangular projection of real
 * latitude and longitude, which is exact. What is deliberately not attempted
 * is a hand-drawn coastline: fabricating continent outlines from memory risks
 * a map that is subtly or badly wrong, which is worse than no map at all.
 *
 * ```tsx
 * <TimezoneMap options={cities} value={value} onValueChange={setValue}>
 *   <TimezoneMapSearch />
 *   <TimezoneMapList>
 *     {filteredOptions.map((opt, i) => (
 *       <TimezoneMapOption key={opt.id} option={opt} index={i} />
 *     ))}
 *   </TimezoneMapList>
 *   <TimezoneMapGlobe />
 * </TimezoneMap>
 * ```
 */
export const TimezoneMap = React.forwardRef<HTMLDivElement, TimezoneMapProps>(
  function TimezoneMap(
    {
      options,
      value: valueProp,
      defaultValue,
      onValueChange,
      label = "Location",
      asChild = false,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const reactId = React.useId();
    const labelId = `gear5-tzmap-${reactId}-label`;

    const [value, setValue] = React.useState(defaultValue);
    const resolvedValue = valueProp ?? value;

    const [search, setSearch] = React.useState("");
    const [activeIndex, setActiveIndex] = React.useState(0);
    const itemsRef = React.useRef<(HTMLElement | null)[]>([]);

    const filteredOptions = React.useMemo(
      () => options.filter((option) => matches(option, search)),
      [options, search],
    );

    // A narrowing search can leave the roving index pointing past the end.
    React.useEffect(() => {
      if (activeIndex > filteredOptions.length - 1) {
        setActiveIndex(Math.max(0, filteredOptions.length - 1));
      }
    }, [filteredOptions.length, activeIndex]);

    const registerItem = React.useCallback(
      (index: number, node: HTMLElement | null) => {
        itemsRef.current[index] = node;
      },
      [],
    );

    const select = React.useCallback(
      (option: TimezoneOption) => {
        if (valueProp === undefined) setValue(option.id);
        onValueChange?.(option.timezone, option);
      },
      [valueProp, onValueChange],
    );

    const Comp = resolveElement(asChild, "div");
    const selected = options.find((option) => option.id === resolvedValue);

    return (
      <TimezoneMapProvider
        value={{
          options,
          filteredOptions,
          value: resolvedValue,
          select,
          search,
          setSearch,
          activeIndex,
          setActiveIndex: (index) => {
            setActiveIndex(index);
            itemsRef.current[index]?.focus();
          },
          registerItem,
          labelId,
        }}
      >
        <Comp ref={forwardedRef} data-handoff-part="timezone-map" {...rest}>
          <span id={labelId} style={visuallyHidden}>
            {label}
          </span>
          {children}
          <span role="status" aria-live="polite" style={visuallyHidden}>
            {selected ? `Selected ${selected.city}, ${selected.timezone}.` : ""}
          </span>
        </Comp>
      </TimezoneMapProvider>
    );
  },
);

export interface TimezoneMapSearchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {}

/** Filters both the list and the map's marker set as the user types. */
export const TimezoneMapSearch = React.forwardRef<
  HTMLInputElement,
  TimezoneMapSearchProps
>(function TimezoneMapSearch({ placeholder = "Search city or timezone", ...rest }, forwardedRef) {
  const { search, setSearch, labelId } = useTimezoneMapContext("TimezoneMapSearch");

  return (
    <input
      ref={forwardedRef}
      type="text"
      role="searchbox"
      aria-labelledby={labelId}
      value={search}
      placeholder={placeholder}
      onChange={(event) => setSearch(event.target.value)}
      data-handoff-slot="tzmap-search"
      {...rest}
    />
  );
});

export interface TimezoneMapListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/**
 * The accessible listbox. Arrow keys move a single roving tab stop, matching
 * how a native `<select>` behaves rather than costing one Tab press per city.
 */
export const TimezoneMapList = React.forwardRef<
  HTMLDivElement,
  TimezoneMapListProps
>(function TimezoneMapList({ asChild = false, onKeyDown, ...rest }, forwardedRef) {
  const { filteredOptions, activeIndex, setActiveIndex, labelId } =
    useTimezoneMapContext("TimezoneMapList");

  const move = (next: number) => {
    const count = filteredOptions.length;
    if (count === 0) return;
    setActiveIndex((next + count) % count);
  };

  const Comp = resolveElement(asChild, "div");

  return (
    <Comp
      ref={forwardedRef}
      role="listbox"
      aria-labelledby={labelId}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;

        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            move(activeIndex + 1);
            break;
          case "ArrowUp":
            event.preventDefault();
            move(activeIndex - 1);
            break;
          case "Home":
            event.preventDefault();
            move(0);
            break;
          case "End":
            event.preventDefault();
            move(filteredOptions.length - 1);
            break;
          default:
            break;
        }
      }}
      {...rest}
    />
  );
});

export interface TimezoneMapOptionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  option: TimezoneOption;
  /** Position within the currently filtered list, not the full option set. */
  index: number;
  asChild?: boolean;
}

/** One row: a real option with a single roving tab stop across the whole list. */
export const TimezoneMapOption = React.forwardRef<
  HTMLDivElement,
  TimezoneMapOptionProps
>(function TimezoneMapOption(
  { option, index, asChild = false, onClick, onFocus, children, ...rest },
  forwardedRef,
) {
  const { value, select, activeIndex, setActiveIndex, registerItem } =
    useTimezoneMapContext("TimezoneMapOption");

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      registerItem(index, node);
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [registerItem, index, forwardedRef],
  );

  const selected = option.id === value;
  const Comp = resolveElement(asChild, "div");

  return (
    <Comp
      ref={setRefs}
      role="option"
      tabIndex={index === activeIndex ? 0 : -1}
      aria-selected={selected}
      data-handoff-slot="tzmap-option"
      data-selected={selected ? "" : undefined}
      onFocus={(event: React.FocusEvent<HTMLDivElement>) => {
        onFocus?.(event);
        setActiveIndex(index);
      }}
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        select(option);
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select(option);
        }
      }}
      {...rest}
    >
      {children ?? (
        <>
          <span data-handoff-slot="tzmap-city">{option.city}</span>
          <span data-handoff-slot="tzmap-timezone">{option.timezone}</span>
        </>
      )}
    </Comp>
  );
});

export interface TimezoneMapGlobeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/**
 * The visual map. Deliberately `aria-hidden`: every marker's action is already
 * reachable through the list, so duplicating dozens of small pointer targets
 * into the tab order would only add noise for keyboard and screen reader users.
 */
export const TimezoneMapGlobe = React.forwardRef<
  HTMLDivElement,
  TimezoneMapGlobeProps
>(function TimezoneMapGlobe({ asChild = false, ...rest }, forwardedRef) {
  const { filteredOptions, value, select } = useTimezoneMapContext("TimezoneMapGlobe");
  const Comp = resolveElement(asChild, "div");

  return (
    <Comp ref={forwardedRef} aria-hidden="true" data-handoff-slot="tzmap-globe" {...rest}>
      {filteredOptions.map((option) => {
        const { x, y } = project(option.lat, option.lng);
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            tabIndex={-1}
            title={`${option.city} — ${option.timezone}`}
            data-handoff-slot="tzmap-marker"
            data-selected={selected ? "" : undefined}
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={() => select(option)}
          />
        );
      })}
    </Comp>
  );
});
