"use client";

import * as React from "react";

export function ThemeToggle() {
  // Null until mounted so the server and client render the same markup. The
  // real value lives in the DOM, put there by the inline script in the layout.
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
      // Private browsing can reject writes. The toggle still works this session.
    }
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark ?? true}
      className="rounded-chip px-2.5 py-1.5 text-[13px] text-fg-muted transition-colors hover:bg-panel hover:text-fg"
    >
      <span aria-hidden="true">{dark === false ? "Light" : "Dark"}</span>
      <span className="sr-only">
        {dark === false ? "Switch to dark theme" : "Switch to light theme"}
      </span>
    </button>
  );
}
