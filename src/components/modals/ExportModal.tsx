"use client";

import React, { useState } from "react";
import { X, FileSpreadsheet, FileText, Database, Download } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async (type: "excel" | "pdf" | "csv") => {
    setDownloading(type);
    try {
      const url = `/api/export/${type}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Export download failed");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;

      const dateStr = new Date().toISOString().split("T")[0];
      if (type === "excel") {
        a.download = `Real_Estate_Land_Tracker_${dateStr}.xlsx`;
      } else if (type === "pdf") {
        a.download = `Executive_Portfolio_Statement_${dateStr}.pdf`;
      } else {
        a.download = `Real_Estate_Transactions_${dateStr}.csv`;
      }

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
      alert("Export failed, please try again.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl my-auto flex flex-col gap-5 animate-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-3.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Download className="w-5 h-5" />
              <span>Export Real Estate Portfolios</span>
            </h2>
            <div className="text-xs text-[#A1A1AA] mt-0.5 font-medium">
              Take out your entire data in offline-compatible spreadsheets or
              documents
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#1a1a1a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3.5">
          {/* Excel Export Card (Key Egress Action) */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-4 flex items-center justify-between gap-3.5 hover:border-[#383838] transition-all duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  Multi-Tab Excel Workbook (.xlsx)
                </div>
                <div className="text-xs text-[#A1A1AA] mt-1 leading-relaxed font-medium">
                  Interactive sheets (`Dashboard`, `Land_Master`, `Outflows`,
                  `Deal_Inflows`, `Capital_Inflows`, `Transfers`) with live SUMIFS
                  formulas and Indian Rupee formatting.
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDownload("excel")}
              disabled={downloading === "excel"}
              className="btn-action-primary px-3.5 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap disabled:opacity-50 flex-shrink-0"
            >
              {downloading === "excel" ? "Generating..." : "Download .xlsx"}
            </button>
          </div>

          {/* PDF Export Card (Key Egress Action) */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-4 flex items-center justify-between gap-3.5 hover:border-[#383838] transition-all duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-rose-950/40 border border-rose-800/40 flex items-center justify-center text-rose-400 flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  Executive PDF Deal Statement (.pdf)
                </div>
                <div className="text-xs text-[#A1A1AA] mt-1 leading-relaxed font-medium">
                  Print-ready executive summary of property deals, liquidity
                  breakdowns, and pending buyer/seller statements.
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDownload("pdf")}
              disabled={downloading === "pdf"}
              className="btn-action-primary px-3.5 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap disabled:opacity-50 flex-shrink-0"
            >
              {downloading === "pdf" ? "Generating..." : "Download .pdf"}
            </button>
          </div>

          {/* CSV Export Card (Key Egress Action) */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-4 flex items-center justify-between gap-3.5 hover:border-[#383838] transition-all duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-950/40 border border-blue-800/40 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  Raw Transactions Ledger (.csv)
                </div>
                <div className="text-xs text-[#A1A1AA] mt-1 leading-relaxed font-medium">
                  Normalized universal accounting CSV export for easy import
                  into Tally or auditor software.
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDownload("csv")}
              disabled={downloading === "csv"}
              className="btn-action-primary px-3.5 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap disabled:opacity-50 flex-shrink-0"
            >
              {downloading === "csv" ? "Exporting..." : "Download .csv"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#262626] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#161616] text-white text-xs sm:text-sm font-medium hover:bg-[#222222] transition-all duration-150"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
