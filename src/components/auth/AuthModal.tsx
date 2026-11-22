"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { M3LoadingIndicator } from "@/components/ui/M3ExpressivePrimitives";

export interface AuthUserData {
  name: string;
  email: string;
  role: string;
  datasetId?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (user: AuthUserData) => void;
  allowClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  allowClose = false,
}) => {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { mode, toggleMode } = useTheme();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const endpoint =
        tab === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        tab === "login"
          ? { email, password }
          : { name: name.trim(), email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "Sign in failed. Please check your details."
        );
      }

      onSuccess(data.data);
      if (onClose) onClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    onSuccess({
      name: "Guest Demo User",
      email: "guest@avaniya.preview",
      role: "viewer",
      datasetId: "ds_demo_sandbox",
    });
    if (onClose) onClose();
  };

  return (
    <div
      onMouseDown={(e) => {
        if (allowClose && onClose && e.target === e.currentTarget) {
          onClose();
        }
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto overflow-x-hidden animate-backdrop ${ allowClose ? "bg-black/50 backdrop-blur-sm" : "bg-md-surface bg-grid-subtle" }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-md-surface-lowest dark:bg-md-surface-low rounded-[32px] max-w-md w-full min-w-0 p-6 sm:p-8 shadow-m3-3 flex flex-col gap-5 my-auto overflow-y-auto overflow-x-hidden animate-modal"
      >
        <div className="absolute right-4 top-4 flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleMode}
            className="p-2 rounded-full bg-md-surface-container text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-high transition-colors"
            aria-label="Toggle light or dark mode"
            title={mode === "light" ? "Dark Mode" : "Light Mode"}
          >
            {mode === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>
          {allowClose && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-high transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2.5 min-w-0 pt-1">
          <div className="relative w-16 h-16 rounded-[22px] overflow-hidden bg-md-primary-container p-0.5 shadow-m3-1 flex-shrink-0">
            <Image
              src="/logo.jpg"
              alt="Avaniya"
              width={64}
              height={64}
              className="object-cover w-full h-full rounded-[19px]"
              priority
            />
          </div>
          <div className="mt-0.5 min-w-0">
            <h1 className="font-display text-2xl font-extrabold text-md-on-surface tracking-tight break-words">
              Avaniya
            </h1>
            <p className="text-sm text-md-on-surface-variant mt-1 leading-relaxed break-words">
              Track your properties, payments, loans, and profits — all in one clear place.
            </p>
          </div>
        </div>

        {/* M3 Connected Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-md-surface-container p-1 rounded-full min-w-0">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setErrorMsg("");
            }}
            className={`py-2 rounded-full text-sm font-semibold transition-all duration-200 truncate ${ tab === "login" ? "bg-md-primary text-md-on-primary shadow-m3-1" : "text-md-on-surface-variant hover:text-md-on-surface" }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setErrorMsg("");
            }}
            className={`py-2 rounded-full text-sm font-semibold transition-all duration-200 truncate ${ tab === "signup" ? "bg-md-primary text-md-on-primary shadow-m3-1" : "text-md-on-surface-variant hover:text-md-on-surface" }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-md-error-container text-md-on-error-container text-sm px-4 py-2.5 rounded-2xl font-medium break-words">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 text-sm min-w-0"
        >
          {tab === "signup" && (
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface-variant">
                Your Name or Business Name
              </label>
              <div className="relative min-w-0">
                <UserIcon className="w-4 h-4 text-md-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 flex-shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Properties"
                  className="w-full min-w-0 bg-md-surface-container rounded-2xl pl-10 pr-3.5 py-2.5 text-md-on-surface placeholder:text-md-on-surface-variant/60 text-sm outline-none focus:bg-md-surface-high focus:ring-2 focus:ring-md-primary transition-all"
                  required={tab === "signup"}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-md-on-surface-variant">
              Email Address
            </label>
            <div className="relative min-w-0">
              <Mail className="w-4 h-4 text-md-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 flex-shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full min-w-0 bg-md-surface-container rounded-2xl pl-10 pr-3.5 py-2.5 text-md-on-surface placeholder:text-md-on-surface-variant/60 text-sm outline-none focus:bg-md-surface-high focus:ring-2 focus:ring-md-primary transition-all"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-md-on-surface-variant">
              Password
            </label>
            <div className="relative min-w-0">
              <Lock className="w-4 h-4 text-md-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 flex-shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full min-w-0 bg-md-surface-container rounded-2xl pl-10 pr-10 py-2.5 text-md-on-surface placeholder:text-md-on-surface-variant/60 text-sm outline-none focus:bg-md-surface-high focus:ring-2 focus:ring-md-primary transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-md-on-surface-variant hover:text-md-on-surface p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="m3-btn-filled w-full mt-1 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {isLoading && <M3LoadingIndicator size="xs" />}
            <span>
              {isLoading
                ? "Signing you in..."
                : tab === "login"
                ? "Sign In to My Portfolio"
                : "Create Free Account"}
            </span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Demo Fast Track */}
        <div className="pt-2 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="m3-btn-primary-tonal w-full py-2.5 px-4 text-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Try Interactive Demo (Sample Data)</span>
          </button>

          <div className="flex items-center justify-center gap-3 text-[11px] text-md-on-surface-variant pt-0.5">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-md-primary" />
              No account needed
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-md-primary" />
              Safe sample portfolio
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
