"use client";

import { useEffect, useRef, useState } from "react";

enum ThemeMode {
  Light = "light",
  Dark = "dark",
  System = "system",
}

enum DensityMode {
  Comfortable = "comfortable",
  Compact = "compact",
}

type ResolvedTheme = "light" | "dark";

const THEME_KEY = "app-theme";
const DENSITY_KEY = "app-density";
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light";
}

function getInitialThemeMode(): ThemeMode {
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === ThemeMode.Light || stored === ThemeMode.Dark || stored === ThemeMode.System) {
    return stored;
  }
  return ThemeMode.System;
}

function getInitialDensityMode(): DensityMode {
  const stored = window.localStorage.getItem(DENSITY_KEY);
  if (stored === DensityMode.Comfortable || stored === DensityMode.Compact) {
    return stored;
  }
  return DensityMode.Comfortable;
}

export default function ThemeMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(ThemeMode.System);
  const [densityMode, setDensityMode] = useState<DensityMode>(DensityMode.Comfortable);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextTheme = getInitialThemeMode();
    const nextDensity = getInitialDensityMode();
    setThemeMode(nextTheme);
    setDensityMode(nextDensity);
    setResolvedTheme(nextTheme === ThemeMode.System ? getSystemTheme() : nextTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const nextResolved = themeMode === ThemeMode.System ? getSystemTheme() : themeMode;
    setResolvedTheme(nextResolved);
    root.classList.toggle("dark", nextResolved === "dark");
    window.localStorage.setItem(THEME_KEY, themeMode);
  }, [themeMode, mounted]);

  useEffect(() => {
    if (!mounted || themeMode !== ThemeMode.System) return;
    const media = window.matchMedia(DARK_MEDIA_QUERY);
    const onChange = () => {
      const next = getSystemTheme();
      setResolvedTheme(next);
      document.documentElement.classList.toggle("dark", next === "dark");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [themeMode, mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-density", densityMode);
    window.localStorage.setItem(DENSITY_KEY, densityMode);
  }, [densityMode, mounted]);

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
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.983 5.25c.401-1.16 2.042-1.16 2.443 0 .246.709 1.014 1.105 1.733.89 1.176-.35 2.034.84 1.427 1.79-.371.58-.149 1.36.497 1.689 1.056.538 1.056 2.022 0 2.56-.646.329-.868 1.109-.497 1.689.607.95-.251 2.14-1.427 1.79-.719-.215-1.487.181-1.733.89-.401 1.16-2.042 1.16-2.443 0-.246-.709-1.014-1.105-1.733-.89-1.176.35-2.034-.84-1.427-1.79.371-.58.149-1.36-.497-1.689-1.056-.538-1.056-2.022 0-2.56.646-.329.868-1.109.497-1.689-.607-.95.251-2.14 1.427-1.79.719.215 1.487-.181 1.733-.89Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
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
