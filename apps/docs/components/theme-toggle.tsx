"use client";

import * as React from "react";

export function ThemeToggle() {
  // Starts null so the button renders identically on the server; the real value
  // is read from the DOM after mount, where the inline theme script has run.
  const [dark, setDark] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("handoff-theme", next ? "dark" : "light");
    } catch {
      // Private browsing can reject writes; the toggle still works this session.
    }
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark ?? false}
      className="rounded-md px-2 py-1 transition-colors hover:text-foreground"
    >
      <span aria-hidden="true">{dark ? "☾" : "☀"}</span>
      <span className="sr-only">
        {dark ? "Switch to light theme" : "Switch to dark theme"}
      </span>
    </button>
  );
}
