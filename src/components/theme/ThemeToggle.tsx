"use client";

import { useEffect, useState } from "react";

enum ThemeMode {
  Light = "light",
  Dark = "dark",
  System = "system"
}

type ResolvedTheme = "light" | "dark";

const THEME_KEY = "app-theme";
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light";
}

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") return ThemeMode.Light;

  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === ThemeMode.Light || stored === ThemeMode.Dark || stored === ThemeMode.System) {
    return stored as ThemeMode;
  }

  return ThemeMode.System;
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(ThemeMode.Light);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const nextMode = getInitialMode();
    setMode(nextMode);
    setResolvedTheme(nextMode === ThemeMode.System ? getSystemTheme() : nextMode);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const nextResolved = mode === ThemeMode.System ? getSystemTheme() : mode;
    setResolvedTheme(nextResolved);
    root.classList.toggle("dark", nextResolved === "dark");
    window.localStorage.setItem(THEME_KEY, mode);
  }, [mode, mounted]);

  useEffect(() => {
    if (!mounted || mode !== ThemeMode.System) return;

    const media = window.matchMedia(DARK_MEDIA_QUERY);
    const onChange = () => {
      const next = getSystemTheme();
      setResolvedTheme(next);
      document.documentElement.classList.toggle("dark", next === "dark");
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode, mounted]);

  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 text-xs font-semibold text-gray-700 transition-colors duration-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
      aria-label="Theme mode"
      title={mounted ? `Theme: ${mode}${mode === ThemeMode.System ? ` (${resolvedTheme})` : ""}` : "Theme"}
    >
      {[ThemeMode.Light, ThemeMode.Dark, ThemeMode.System].map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setMode(option)}
          className={`rounded-md px-2 py-1 transition-colors duration-200 ${
            mode === option
              ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
          aria-label={`Set ${option} mode`}
        >
          {option === ThemeMode.Light
            ? "☀️ Light"
            : option === ThemeMode.Dark
              ? "🌙 Dark"
              : "🖥️ System"}
        </button>
      ))}
    </div>
  );
}

