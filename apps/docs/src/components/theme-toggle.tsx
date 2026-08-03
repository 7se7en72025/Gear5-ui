"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const OPTIONS: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "system", icon: Monitor, label: "System" },
  { value: "dark", icon: Moon, label: "Dark" },
];

const STORAGE_KEY = "theme";

/* localStorage is external state, so it's read through a store rather than
   copied into React state inside an effect. */

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // `storage` only fires for *other* tabs, which is exactly what we want here —
  // same-tab changes are announced by setTheme.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Theme {
  try {
    return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
  } catch {
    return "system";
  }
}

/** The server can't know the preference; the inline head script fixes the
    class before paint, so this only affects which pip renders as checked. */
function getServerSnapshot(): Theme {
  return "system";
}

function setTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode / storage disabled — the toggle still works for this page.
  }
  listeners.forEach((listener) => listener());
}

/**
 * Only flips `color-scheme` via a class — every token is a `light-dark()` call
 * that resolves from it, so no per-token JavaScript is needed. Neither class
 * present means "follow the OS", which is also the server-rendered default.
 */
function applyToDocument(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
}

export function ThemeToggle() {
  const theme = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  React.useEffect(() => {
    applyToDocument(theme);
  }, [theme]);

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="flex items-center gap-0.5 rounded-full border border-border bg-surface p-0.5"
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          onClick={() => setTheme(value)}
          className={cn(
            "rounded-full p-1.5 text-faint transition",
            "hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            theme === value && "bg-surface-2 text-foreground shadow-sm",
          )}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}
