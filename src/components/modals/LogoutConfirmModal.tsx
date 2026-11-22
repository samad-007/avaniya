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
      className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto overflow-x-hidden animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full min-w-0 p-6 shadow-modal flex flex-col gap-4 my-auto overflow-y-auto overflow-x-hidden animate-modal"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-all duration-150 flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight break-words">
            Sign out of Avaniya?
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed break-words">
            {userName ? (
              <>
                You&apos;re signed in as{" "}
                <strong className="text-slate-900 font-semibold">
                  {userName}
                </strong>
                . Your data is safely saved and will be waiting when you return.
              </>
            ) : (
              "Are you sure you want to sign out and return to the login screen?"
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={onClose}
            className="btn-action-secondary px-4 py-2.5 rounded-xl text-sm"
          >
            Stay Signed In
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-all duration-150 flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
