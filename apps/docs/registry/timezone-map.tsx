"use client";

import * as React from "react";
import {
  TimezoneMap as TimezoneMapPrimitive,
  TimezoneMapGlobe,
  TimezoneMapList,
  TimezoneMapOption,
  TimezoneMapSearch,
  useTimezoneMap,
} from "@gear5/core";
import type { TimezoneMapProps as TimezoneMapPrimitiveProps } from "@gear5/core";
import { cn } from "./lib/utils";

/** Styled searchable location picker with a supplementary graticule map. */
export function TimezoneMap({ className, ...props }: TimezoneMapPrimitiveProps) {
  return (
    <TimezoneMapPrimitive
      className={cn(
        "grid gap-3 sm:grid-cols-[16rem_minmax(0,1fr)]",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-2">
        <TimezoneMapSearch
          className={cn(
            "w-full rounded-chip border border-line bg-panel px-3 py-2 text-[13px]",
            "text-fg placeholder:text-fg-faint focus:outline-none focus:border-accent/50",
          )}
        />

        <TimezoneMapList className="flex max-h-64 flex-col gap-0.5 overflow-y-auto rounded-panel border border-line bg-panel p-1.5">
          <Options />
        </TimezoneMapList>
      </div>

      <div className="relative overflow-hidden rounded-panel border border-line bg-bg">
        {/*
          No hand-drawn coastlines: a subtle latitude/longitude graticule
          stands in for a landmass outline, so the map never asserts a
          continent shape we cannot vouch for. Marker positions are exact,
          computed from real coordinates by the primitive.
        */}
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 opacity-[0.35]",
            "bg-[linear-gradient(to_right,var(--tz-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--tz-line)_1px,transparent_1px)]",
            "[background-size:12.5%_16.66%]",
          )}
          style={{ "--tz-line": "var(--line)" } as React.CSSProperties}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line-strong/60"
        />

        <TimezoneMapGlobe
          className={cn(
            "relative h-56 w-full sm:h-full",
            "[&_[data-handoff-slot=tzmap-marker]]:absolute",
            "[&_[data-handoff-slot=tzmap-marker]]:size-2 [&_[data-handoff-slot=tzmap-marker]]:-translate-x-1/2 [&_[data-handoff-slot=tzmap-marker]]:-translate-y-1/2",
            "[&_[data-handoff-slot=tzmap-marker]]:rounded-full [&_[data-handoff-slot=tzmap-marker]]:border [&_[data-handoff-slot=tzmap-marker]]:border-line-strong",
            "[&_[data-handoff-slot=tzmap-marker]]:bg-panel-raised [&_[data-handoff-slot=tzmap-marker]]:transition-colors",
            "[&_[data-handoff-slot=tzmap-marker]:hover]:bg-accent/60",
            "[&_[data-handoff-slot=tzmap-marker][data-selected]]:border-accent [&_[data-handoff-slot=tzmap-marker][data-selected]]:bg-accent",
            "[&_[data-handoff-slot=tzmap-marker][data-selected]]:size-2.5",
            "[&_[data-handoff-slot=tzmap-marker][data-selected]]:shadow-[0_0_0_4px_var(--accent-soft)]",
          )}
        />
      </div>
    </TimezoneMapPrimitive>
  );
}

function Options() {
  const { filteredOptions } = useTimezoneMap();

  if (filteredOptions.length === 0) {
    return (
      <p className="px-2 py-3 text-center text-[12px] text-fg-faint">
        No matches
      </p>
    );
  }

  return (
    <>
      {filteredOptions.map((option, index) => (
        <TimezoneMapOption
          key={option.id}
          option={option}
          index={index}
          className={cn(
            "flex cursor-pointer items-center justify-between gap-2 rounded-chip px-2.5 py-1.5",
            "text-[13px] text-fg-muted transition-colors",
            "hover:bg-panel-raised hover:text-fg",
            "data-[selected]:bg-accent/10 data-[selected]:text-accent",
            "focus:outline-none focus-visible:bg-panel-raised",
            "[&_[data-handoff-slot=tzmap-city]]:truncate",
            "[&_[data-handoff-slot=tzmap-timezone]]:shrink-0 [&_[data-handoff-slot=tzmap-timezone]]:font-mono [&_[data-handoff-slot=tzmap-timezone]]:text-[10px] [&_[data-handoff-slot=tzmap-timezone]]:text-fg-faint",
          )}
        />
      ))}
    </>
  );
}
