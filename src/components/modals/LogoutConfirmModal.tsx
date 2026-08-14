"use client";

import React from "react";
import { LogOut, X } from "lucide-react";
import { useAnimatedModal } from "@/hooks/useAnimatedModal";

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
  const { shouldRender, isClosing, handleClose } = useAnimatedModal(isOpen, onClose);

  if (!shouldRender) return null;

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 ${
        isClosing ? "animate-backdrop-exit" : "animate-backdrop"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-sm w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 my-auto ${
          isClosing ? "animate-modal-exit" : "animate-modal"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-400 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <button
            onClick={handleClose}
            className="text-[#A1A1AA] hover:text-white p-1 transition-all duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-base font-bold text-white tracking-tight">
            Sign out of portfolio?
          </h3>
          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed font-medium">
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
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#262626]">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg bg-[#161616] text-white text-xs sm:text-sm font-medium border border-[#2a2a2a] hover:bg-[#222222] transition-all duration-150"
          >
            Stay Signed In
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs sm:text-sm font-bold hover:bg-rose-500 transition-all duration-150 flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Confirm Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
