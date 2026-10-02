"use client";
import { useEffect, useRef, useState } from "react";
export interface CopyableProps {
  value: string;
  label: string;
  block?: boolean;
}
export function Copyable({ value, label, block = false }: CopyableProps) {
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(value);
      setStatus("Copied to clipboard");
      timer.current = setTimeout(() => setStatus(""), 2000);
    } catch {
      setStatus("Clipboard unavailable. Select the code and copy it manually.");
    }
  }
  return (
    <div className="relative min-w-0">
      <pre
        tabIndex={0}
        aria-label={label.replace(/^Copy /i, "")}
        className={`overflow-auto rounded-xl border border-hairline bg-[#0e1012] py-5 pe-24 ps-5 font-mono text-xs leading-6 text-[#d3d8c9] ${block ? "max-h-[30rem]" : "whitespace-pre"}`}
      >
        <code>{value}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={label}
        className="absolute end-3 top-3 rounded-md border border-hairline bg-anvil px-3 py-2 text-xs text-smoke hover:text-cream"
      >
        {status === "Copied to clipboard" ? "Copied" : "Copy"}
      </button>
      <p
        role="status"
        aria-live="polite"
        className="mt-2 min-h-4 text-xs text-smoke"
      >
        {status}
      </p>
    </div>
  );
}
