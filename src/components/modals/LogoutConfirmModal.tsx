"use client";

import React from "react";
import { LogOut, X, AlertTriangle } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-4 my-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-400 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-4 h-4" />
          </div>
          <button
            onClick={onClose}
            className="text-[#666666] hover:text-white transition-standard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Sign out of portfolio?
          </h3>
          <p className="text-xs text-[#888888] leading-relaxed">
            {userName ? (
              <>
                You are currently signed in as <strong className="text-white">{userName}</strong>.
                Are you sure you want to end this active session?
              </>
            ) : (
              "Are you sure you want to end your current session and return to the login screen?"
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a1a1a]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded bg-[#161616] text-white text-xs font-medium border border-[#2a2a2a] hover:bg-[#222222] transition-standard"
          >
            Stay Signed In
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-3.5 py-1.5 rounded bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-standard flex items-center gap-1.5 shadow-sm"
          >
            <LogOut className="w-3 h-3" />
            <span>Confirm Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
