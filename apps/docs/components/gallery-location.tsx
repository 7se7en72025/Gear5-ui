"use client";

import * as React from "react";
import type { TimezoneOption } from "@gear5/core";
import { TimezoneMap } from "@/registry/timezone-map";

/**
 * A small, real dataset: exact latitude and longitude per city, which is what
 * the projection needs to be accurate. No coastline data here, only points.
 */
const CITIES: TimezoneOption[] = [
  { id: "lon", city: "London", country: "UK", timezone: "Europe/London", lat: 51.51, lng: -0.13 },
  { id: "nyc", city: "New York", country: "US", timezone: "America/New_York", lat: 40.71, lng: -74.01 },
  { id: "sfo", city: "San Francisco", country: "US", timezone: "America/Los_Angeles", lat: 37.77, lng: -122.42 },
  { id: "ber", city: "Berlin", country: "Germany", timezone: "Europe/Berlin", lat: 52.52, lng: 13.4 },
  { id: "dub", city: "Dubai", country: "UAE", timezone: "Asia/Dubai", lat: 25.2, lng: 55.27 },
  { id: "sin", city: "Singapore", country: "Singapore", timezone: "Asia/Singapore", lat: 1.35, lng: 103.82 },
  { id: "tok", city: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", lat: 35.68, lng: 139.69 },
  { id: "syd", city: "Sydney", country: "Australia", timezone: "Australia/Sydney", lat: -33.87, lng: 151.21 },
  { id: "sao", city: "São Paulo", country: "Brazil", timezone: "America/Sao_Paulo", lat: -23.55, lng: -46.63 },
  { id: "joh", city: "Johannesburg", country: "South Africa", timezone: "Africa/Johannesburg", lat: -26.2, lng: 28.05 },
  { id: "mum", city: "Mumbai", country: "India", timezone: "Asia/Kolkata", lat: 19.08, lng: 72.88 },
  { id: "tor", city: "Toronto", country: "Canada", timezone: "America/Toronto", lat: 43.65, lng: -79.38 },
];

export function TimezoneMapExample() {
  const [value, setValue] = React.useState("lon");
  const [timezone, setTimezone] = React.useState("Europe/London");

  return (
    <div className="space-y-3">
      <TimezoneMap
        options={CITIES}
        value={value}
        onValueChange={(tz, option) => {
          setValue(option.id);
          setTimezone(tz);
        }}
      />
      <p className="font-mono text-xs text-fg-muted">{timezone}</p>
    </div>
  );
}
