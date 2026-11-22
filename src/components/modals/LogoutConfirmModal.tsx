"use client";

import React from "react";
import { LogOut, X } from "lucide-react";

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
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto overflow-x-hidden animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-md-surface-lowest border border-md-outline-variant rounded-[28px] max-w-sm w-full min-w-0 p-6 shadow-m3-3 flex flex-col gap-4 my-auto overflow-y-auto overflow-x-hidden animate-modal"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="w-11 h-11 rounded-[16px] bg-md-error-container text-md-on-error-container flex items-center justify-center flex-shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-high rounded-full p-2 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <h3 className="font-display text-lg font-bold text-md-on-surface tracking-tight break-words">
            Sign out of Avaniya?
          </h3>
          <p className="text-sm text-md-on-surface-variant leading-relaxed break-words">
            {userName ? (
              <>
                You&apos;re signed in as{" "}
                <strong className="text-md-on-surface font-semibold">
                  {userName}
                </strong>
                . Your data is safely saved and will be waiting when you return.
              </>
            ) : (
              "Are you sure you want to sign out and return to the login screen?"
            )}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-md-outline-variant/60 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={onClose}
            className="m3-btn-outlined px-4 py-2.5 text-sm"
          >
            Stay Signed In
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-full bg-md-error text-md-on-error text-sm font-semibold hover:brightness-110 active:rounded-[14px] active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-m3-1"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
