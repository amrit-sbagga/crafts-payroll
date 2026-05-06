"use client";

import { useEffect, useState } from "react";

export enum ThemeMode {
  Light = "light",
  Dark = "dark",
  System = "system",
}

export enum DensityMode {
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

export default function useTheme() {
  const [mounted, setMounted] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(ThemeMode.System);
  const [densityMode, setDensityMode] = useState<DensityMode>(DensityMode.Comfortable);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

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

  return {
    mounted,
    themeMode,
    setThemeMode,
    densityMode,
    setDensityMode,
    resolvedTheme,
  };
}
