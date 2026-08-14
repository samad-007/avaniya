"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (user: { name: string; email: string; role: string }) => void;
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
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    onSuccess({
      name: "Samad (Admin)",
      email: "samad@avaniya.com",
      role: "admin",
    });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a] border border-[#222222] rounded-xl max-w-md w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-5 my-auto">
        {/* Brand Header with Logo */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#333333] bg-[#0c120e] p-0.5 shadow-md">
            <Image
              src="/logo.jpg"
              alt="Avaniya Real Estate Emblem"
              width={56}
              height={56}
              className="object-cover w-full h-full rounded-lg"
              priority
            />
          </div>
          <div className="mt-1">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Avaniya Asset Tracker
            </h1>
            <p className="text-xs text-[#888888] mt-0.5">
              Secure Indian Real Estate &amp; Land Business Portfolio Engine
            </p>
          </div>
        </div>

        {/* Auth Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-[#111111] p-1 rounded-lg border border-[#222222]">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setErrorMsg("");
            }}
            className={`py-2 rounded text-xs font-semibold transition-standard ${
              tab === "login"
                ? "bg-[#222222] text-white shadow-sm"
                : "text-[#777777] hover:text-white"
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
            className={`py-2 rounded text-xs font-semibold transition-standard ${
              tab === "signup"
                ? "bg-[#222222] text-white shadow-sm"
                : "text-[#777777] hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs px-3 py-2 rounded-md">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          {tab === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
                Full Name / Entity
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samad Real Estate"
                  className="w-full bg-[#111111] border border-[#222222] rounded-md pl-9 pr-3 py-2.5 text-white text-xs outline-none focus:border-[#555555] transition-standard"
                  required={tab === "signup"}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="w-full bg-[#111111] border border-[#222222] rounded-md pl-9 pr-3 py-2.5 text-white text-xs outline-none focus:border-[#555555] transition-standard"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-[#888888] uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#111111] border border-[#222222] rounded-md pl-9 pr-9 py-2.5 text-white text-xs outline-none focus:border-[#555555] transition-standard"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 rounded-md bg-white text-black font-semibold text-xs hover:bg-[#e0e0e0] flex items-center justify-center gap-2 transition-standard disabled:opacity-50"
          >
            <span>{isLoading ? "Authenticating..." : tab === "login" ? "Sign In to Dashboard" : "Create Account & Enter"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Demo Fast Track Bypass */}
        <div className="pt-3 border-t border-[#222222] flex flex-col gap-2">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2 rounded-md bg-[#141414] border border-[#252525] text-white text-xs font-medium hover:bg-[#1f1f1f] hover:border-[#383838] transition-standard flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Instant Demo Access (Skip for Preview)</span>
          </button>

          <div className="text-[10px] text-[#666666] text-center leading-relaxed mt-1">
            Data is isolated by account and encrypted in transit &amp; rest.
          </div>
        </div>
      </div>
    </div>
  );
};
