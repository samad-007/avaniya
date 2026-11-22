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
} from "lucide-react";

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
        throw new Error(data.error || "Sign in failed. Please check your details.");
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
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto overflow-x-hidden animate-backdrop ${
        allowClose
          ? "bg-slate-900/50 backdrop-blur-sm"
          : "bg-[#F8FAFC] bg-grid-subtle"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white border border-slate-200/90 rounded-2xl max-w-md w-full min-w-0 p-6 sm:p-8 shadow-modal flex flex-col gap-5 my-auto overflow-y-auto overflow-x-hidden animate-modal"
      >
        {allowClose && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2.5 min-w-0">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-emerald-50 p-0.5 shadow-sm flex-shrink-0">
            <Image
              src="/logo.jpg"
              alt="Avaniya"
              width={56}
              height={56}
              className="object-cover w-full h-full rounded-[13px]"
              priority
            />
          </div>
          <div className="mt-0.5 min-w-0">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight break-words">
              Avaniya
            </h1>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed break-words">
              Track your properties, payments, loans, and profits — all in one clear place.
            </p>
          </div>
        </div>

        {/* Auth Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 min-w-0">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setErrorMsg("");
            }}
            className={`py-2 rounded-lg text-sm font-semibold transition-all duration-150 truncate ${
              tab === "login"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setErrorMsg("");
            }}
            className={`py-2 rounded-lg text-sm font-semibold transition-all duration-150 truncate ${
              tab === "signup"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-3.5 py-2.5 rounded-xl font-medium break-words">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm min-w-0">
          {tab === "signup" && (
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-slate-700">
                Your Name or Business Name
              </label>
              <div className="relative min-w-0">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 flex-shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Properties"
                  className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all"
                  required={tab === "signup"}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-slate-700">
              Email Address
            </label>
            <div className="relative min-w-0">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 flex-shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-slate-700">
              Password
            </label>
            <div className="relative min-w-0">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 flex-shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
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
            className="btn-action-brand w-full mt-1 py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>
              {isLoading
                ? "Signing you in..."
                : tab === "login"
                ? "Sign In to My Portfolio"
                : "Create Free Account"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Track */}
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Try Interactive Demo (Sample Data)</span>
          </button>

          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 pt-0.5">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              No account needed
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Safe sample portfolio
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
