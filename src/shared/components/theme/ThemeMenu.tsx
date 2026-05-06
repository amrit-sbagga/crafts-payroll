"use client";

import { useEffect, useRef, useState } from "react";
import useTheme, { DensityMode, ThemeMode } from "@/hooks/useTheme";

export default function ThemeMenu() {
  const [open, setOpen] = useState(false);
  const { mounted, themeMode, setThemeMode, densityMode, setDensityMode, resolvedTheme } = useTheme();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
          open
            ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
            : "border-gray-200 bg-white/90 text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-800"
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open settings"
        title="Settings"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h7m3 0h6M9 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm11 6h-7m-3 0H4m15 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM4 18h7m3 0h6m-11 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
        </svg>
        <span className="leading-none">Settings</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-900"
        >
          <SectionLabel title="Theme" />
          <OptionButton active={themeMode === ThemeMode.Light} label="Light" onClick={() => setThemeMode(ThemeMode.Light)} />
          <OptionButton active={themeMode === ThemeMode.Dark} label="Dark" onClick={() => setThemeMode(ThemeMode.Dark)} />
          <OptionButton
            active={themeMode === ThemeMode.System}
            label={`System${mounted ? ` (${resolvedTheme})` : ""}`}
            onClick={() => setThemeMode(ThemeMode.System)}
          />

          <SectionLabel title="Density" />
          <OptionButton
            active={densityMode === DensityMode.Comfortable}
            label="Comfortable"
            onClick={() => setDensityMode(DensityMode.Comfortable)}
          />
          <OptionButton
            active={densityMode === DensityMode.Compact}
            label="Compact"
            onClick={() => setDensityMode(DensityMode.Compact)}
          />

          <SectionLabel title="Preferences" />
          <div className="rounded-lg border border-dashed border-gray-200 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
            More preferences coming soon.
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <p className="mb-1 mt-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 first:mt-0 dark:text-gray-500">
      {title}
    </p>
  );
}

function OptionButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
        active
          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
          : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
      }`}
      role="menuitemradio"
      aria-checked={active}
    >
      <span>{label}</span>
      {active && <span className="text-xs">✓</span>}
    </button>
  );
}
