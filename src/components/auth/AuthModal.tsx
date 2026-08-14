"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";

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
        throw new Error(data.error || "Authentication failed");
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
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-md w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-5 my-auto animate-modal"
      >
        {/* Brand Header with Logo */}
        <div className="flex flex-col items-center text-center gap-2.5">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#383838] bg-[#0c120e] p-0.5 shadow-md">
            <Image
              src="/logo.jpg"
              alt="Avaniya Emblem"
              width={64}
              height={64}
              className="object-cover w-full h-full rounded-lg"
              priority
            />
          </div>
          <div className="mt-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Avaniya
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1 font-medium">
              Indian Real Estate &amp; Land Portfolio Management
            </p>
          </div>
        </div>

        {/* Auth Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 bg-[#111111] p-1.5 rounded-lg border border-[#262626]">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setErrorMsg("");
            }}
            className={`py-2 rounded-md text-xs sm:text-sm font-semibold transition-all duration-150 ${
              tab === "login"
                ? "bg-[#262626] text-white shadow-sm font-bold"
                : "text-[#A1A1AA] hover:text-white"
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
            className={`py-2 rounded-md text-xs sm:text-sm font-semibold transition-all duration-150 ${
              tab === "signup"
                ? "bg-[#262626] text-white shadow-sm font-bold"
                : "text-[#A1A1AA] hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs sm:text-sm px-3.5 py-2.5 rounded-md font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
          {tab === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Full Name / Entity
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samad Real Estate"
                  className="w-full bg-[#111111] border border-[#262626] rounded-lg pl-9 pr-3.5 py-2.5 text-white text-sm outline-none focus:border-[#555555] transition-all duration-150"
                  required={tab === "signup"}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="w-full bg-[#111111] border border-[#262626] rounded-lg pl-9 pr-3.5 py-2.5 text-white text-sm outline-none focus:border-[#555555] transition-all duration-150"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#111111] border border-[#262626] rounded-lg pl-9 pr-10 py-2.5 text-white text-sm outline-none focus:border-[#555555] transition-all duration-150"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white p-1"
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
            className="btn-action-primary w-full mt-2 py-3 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>
              {isLoading
                ? "Authenticating..."
                : tab === "login"
                ? "Sign In to Dashboard"
                : "Create Account & Enter"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Track Bypass */}
        <div className="pt-3.5 border-t border-[#262626] flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="btn-action-primary w-full py-2.5 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>Explore Sandbox Demo (Synthetic Filler Data)</span>
          </button>

          <div className="text-xs text-[#A1A1AA] text-center leading-relaxed font-medium">
            Demo access opens a sandbox loaded with random filler data and zero account privileges.
          </div>
        </div>
      </div>
    </div>
  );
};
