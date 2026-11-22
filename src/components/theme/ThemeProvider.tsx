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

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return "0 0 0";
  return `${(num >> 16) & 255} ${(num >> 8) & 255} ${num & 255}`;
}

function setColorToken(root: HTMLElement, name: string, hex: string) {
  root.style.setProperty(`--md-sys-color-${name}`, hex);
  root.style.setProperty(`--md-sys-color-${name}-rgb`, hexToRgb(hex));
}

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

  setColorToken(root, "primary", tokens.primary);
  setColorToken(root, "on-primary", tokens.onPrimary);
  setColorToken(root, "primary-container", tokens.primaryContainer);
  setColorToken(root, "on-primary-container", tokens.onPrimaryContainer);
  setColorToken(root, "secondary", tokens.secondary);
  setColorToken(root, "on-secondary", tokens.onSecondary);
  setColorToken(root, "secondary-container", tokens.secondaryContainer);
  setColorToken(root, "on-secondary-container", tokens.onSecondaryContainer);
  setColorToken(root, "tertiary", tokens.tertiary);
  setColorToken(root, "on-tertiary", tokens.onTertiary);
  setColorToken(root, "tertiary-container", tokens.tertiaryContainer);
  setColorToken(root, "on-tertiary-container", tokens.onTertiaryContainer);
  setColorToken(root, "surface", tokens.surface);
  setColorToken(root, "surface-container-lowest", tokens.surfaceLowest);
  setColorToken(root, "surface-container-low", tokens.surfaceLow);
  setColorToken(root, "surface-container", tokens.surfaceContainer);
  setColorToken(root, "surface-container-high", tokens.surfaceHigh);
  setColorToken(root, "surface-container-highest", tokens.surfaceHighest);
  setColorToken(root, "on-surface", tokens.onSurface);
  setColorToken(root, "on-surface-variant", tokens.onSurfaceVariant);
  setColorToken(root, "outline", tokens.outline);
  setColorToken(root, "outline-variant", tokens.outlineVariant);
  setColorToken(root, "error", tokens.error);
  setColorToken(root, "on-error", tokens.onError);
  setColorToken(root, "error-container", tokens.errorContainer);
  setColorToken(root, "on-error-container", tokens.onErrorContainer);
  setColorToken(root, "positive", tokens.positive);
  setColorToken(root, "positive-container", tokens.positiveContainer);
  setColorToken(root, "on-positive-container", tokens.onPositiveContainer);
  setColorToken(root, "warning", tokens.warning);
  setColorToken(root, "warning-container", tokens.warningContainer);
  setColorToken(root, "on-warning-container", tokens.onWarningContainer);
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
