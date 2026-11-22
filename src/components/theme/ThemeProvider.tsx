"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  DEFAULT_PALETTE_ID,
  DEFAULT_THEME_MODE,
  getPaletteById,
  MATERIAL_PALETTES,
  MaterialPalette,
  ThemeMode,
} from "@/lib/materialThemes";

interface ThemeContextValue {
  mode: ThemeMode;
  paletteId: string;
  palette: MaterialPalette;
  palettes: MaterialPalette[];
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setPaletteId: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: DEFAULT_THEME_MODE,
  paletteId: DEFAULT_PALETTE_ID,
  palette: MATERIAL_PALETTES[0],
  palettes: MATERIAL_PALETTES,
  setMode: () => {},
  toggleMode: () => {},
  setPaletteId: () => {},
});

const STORAGE_MODE_KEY = "avaniya_m3_mode";
const STORAGE_PALETTE_KEY = "avaniya_m3_palette";

function applyThemeToDocument(palette: MaterialPalette, mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const tokens = mode === "dark" ? palette.dark : palette.light;

  root.dataset.themeMode = mode;
  root.dataset.themePalette = palette.id;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  root.style.setProperty("--md-sys-color-primary", tokens.primary);
  root.style.setProperty("--md-sys-color-on-primary", tokens.onPrimary);
  root.style.setProperty(
    "--md-sys-color-primary-container",
    tokens.primaryContainer
  );
  root.style.setProperty(
    "--md-sys-color-on-primary-container",
    tokens.onPrimaryContainer
  );
  root.style.setProperty("--md-sys-color-secondary", tokens.secondary);
  root.style.setProperty("--md-sys-color-on-secondary", tokens.onSecondary);
  root.style.setProperty(
    "--md-sys-color-secondary-container",
    tokens.secondaryContainer
  );
  root.style.setProperty(
    "--md-sys-color-on-secondary-container",
    tokens.onSecondaryContainer
  );
  root.style.setProperty("--md-sys-color-tertiary", tokens.tertiary);
  root.style.setProperty("--md-sys-color-on-tertiary", tokens.onTertiary);
  root.style.setProperty(
    "--md-sys-color-tertiary-container",
    tokens.tertiaryContainer
  );
  root.style.setProperty(
    "--md-sys-color-on-tertiary-container",
    tokens.onTertiaryContainer
  );
  root.style.setProperty("--md-sys-color-surface", tokens.surface);
  root.style.setProperty(
    "--md-sys-color-surface-container-lowest",
    tokens.surfaceLowest
  );
  root.style.setProperty(
    "--md-sys-color-surface-container-low",
    tokens.surfaceLow
  );
  root.style.setProperty(
    "--md-sys-color-surface-container",
    tokens.surfaceContainer
  );
  root.style.setProperty(
    "--md-sys-color-surface-container-high",
    tokens.surfaceHigh
  );
  root.style.setProperty(
    "--md-sys-color-surface-container-highest",
    tokens.surfaceHighest
  );
  root.style.setProperty("--md-sys-color-on-surface", tokens.onSurface);
  root.style.setProperty(
    "--md-sys-color-on-surface-variant",
    tokens.onSurfaceVariant
  );
  root.style.setProperty("--md-sys-color-outline", tokens.outline);
  root.style.setProperty("--md-sys-color-outline-variant", tokens.outlineVariant);
  root.style.setProperty("--md-sys-color-error", tokens.error);
  root.style.setProperty("--md-sys-color-on-error", tokens.onError);
  root.style.setProperty(
    "--md-sys-color-error-container",
    tokens.errorContainer
  );
  root.style.setProperty(
    "--md-sys-color-on-error-container",
    tokens.onErrorContainer
  );
  root.style.setProperty("--md-sys-color-positive", tokens.positive);
  root.style.setProperty(
    "--md-sys-color-positive-container",
    tokens.positiveContainer
  );
  root.style.setProperty(
    "--md-sys-color-on-positive-container",
    tokens.onPositiveContainer
  );
  root.style.setProperty("--md-sys-color-warning", tokens.warning);
  root.style.setProperty(
    "--md-sys-color-warning-container",
    tokens.warningContainer
  );
  root.style.setProperty(
    "--md-sys-color-on-warning-container",
    tokens.onWarningContainer
  );
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_THEME_MODE);
  const [paletteId, setPaletteIdState] = useState<string>(DEFAULT_PALETTE_ID);

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem(STORAGE_MODE_KEY);
      const savedPalette = localStorage.getItem(STORAGE_PALETTE_KEY);
      const nextMode: ThemeMode = savedMode === "dark" ? "dark" : "light";
      const nextPaletteId = savedPalette || DEFAULT_PALETTE_ID;
      setModeState(nextMode);
      setPaletteIdState(nextPaletteId);
      applyThemeToDocument(getPaletteById(nextPaletteId), nextMode);
    } catch {
      applyThemeToDocument(
        getPaletteById(DEFAULT_PALETTE_ID),
        DEFAULT_THEME_MODE
      );
    }
  }, []);

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode);
    try {
      localStorage.setItem(STORAGE_MODE_KEY, nextMode);
    } catch {}
    applyThemeToDocument(getPaletteById(paletteId), nextMode);
  };

  const toggleMode = () => {
    setMode(mode === "light" ? "dark" : "light");
  };

  const setPaletteId = (nextId: string) => {
    const resolved = getPaletteById(nextId);
    setPaletteIdState(resolved.id);
    try {
      localStorage.setItem(STORAGE_PALETTE_KEY, resolved.id);
    } catch {}
    applyThemeToDocument(resolved, mode);
  };

  const palette = getPaletteById(paletteId);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        paletteId,
        palette,
        palettes: MATERIAL_PALETTES,
        setMode,
        toggleMode,
        setPaletteId,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  return useContext(ThemeContext);
}
