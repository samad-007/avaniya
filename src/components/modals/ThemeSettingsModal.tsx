"use client";

import React from "react";
import { X, Sun, Moon, Palette, Check, Tag, Sparkles } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCategories?: () => void;
}

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenCategories,
}) => {
  const { mode, paletteId, palette, palettes, setMode, setPaletteId } =
    useTheme();

  if (!isOpen) return null;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto overflow-x-hidden animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-md-surface-lowest dark:bg-md-surface-low rounded-[28px] max-w-2xl w-full min-w-0 max-h-[92vh] overflow-y-auto overflow-x-hidden p-5 sm:p-7 shadow-m3-3 my-auto flex flex-col gap-6 animate-modal"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-[16px] bg-md-primary-container text-md-on-primary-container flex items-center justify-center flex-shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold text-md-on-surface tracking-tight">
                Appearance &amp; Settings
              </h2>
              <p className="text-xs text-md-on-surface-variant mt-0.5">
                Choose light or dark mode and personalize your Material 3 Expressive palette.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-high transition-colors flex-shrink-0"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Light / Dark Mode Switcher (M3 Connected Button Group) */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-md-on-surface-variant">
              Theme Mode
            </span>
            <span className="text-xs font-medium text-md-on-surface-variant">
              Currently: <strong className="text-md-on-surface capitalize">{mode}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 bg-md-surface-container p-1.5 rounded-full">
            <button
              type="button"
              onClick={() => setMode("light")}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-200 ${ mode === "light" ? "bg-md-primary text-md-on-primary shadow-m3-1" : "text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-high" }`}
            >
              <Sun className="w-4 h-4" />
              <span>Light Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("dark")}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-200 ${ mode === "dark" ? "bg-md-primary text-md-on-primary shadow-m3-1" : "text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-high" }`}
            >
              <Moon className="w-4 h-4" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Section 2: 12 Material 3 Expressive Color Palettes */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-md-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-md-on-surface-variant">
                Color Palettes ({palettes.length})
              </span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-md-primary-container text-md-on-primary-container">
              {palette.name}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {palettes.map((p) => {
              const isSelected = p.id === paletteId;
              const preview = mode === "dark" ? p.dark : p.light;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaletteId(p.id)}
                  className={`group relative flex flex-col gap-2.5 p-3.5 rounded-[22px] text-left transition-all duration-200 active:scale-[0.98] ${ isSelected ? "bg-md-primary-container/60 ring-2 ring-md-primary shadow-m3-1" : "bg-md-surface-container hover:bg-md-surface-high" }`}
                >
                  {/* M3 3-Tone Expressive Color Wheel Badge */}
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div
                      className="w-11 h-11 rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 border-2 shadow-sm flex-shrink-0"
                      style={{ borderColor: preview.outlineVariant }}
                    >
                      <div
                        className="col-span-2"
                        style={{ backgroundColor: preview.primary }}
                      />
                      <div
                        style={{ backgroundColor: preview.primaryContainer }}
                      />
                      <div
                        style={{ backgroundColor: preview.tertiaryContainer }}
                      />
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-md-primary text-md-on-primary flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-bold text-md-on-surface truncate">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-md-on-surface-variant truncate">
                      {p.tagline}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Quick Link to Categories */}
        {onOpenCategories && (
          <div className="p-4 rounded-[22px] bg-md-surface-container flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-md-secondary-container text-md-on-secondary-container flex items-center justify-center flex-shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-md-on-surface">
                  Custom Categories
                </div>
                <div className="text-xs text-md-on-surface-variant">
                  Add your own expense or income labels
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCategories();
              }}
              className="m3-btn-tonal px-4 py-2 text-xs"
            >
              Manage Categories
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="m3-btn-filled px-6 py-2.5 text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
