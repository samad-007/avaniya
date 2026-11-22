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
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto overflow-x-hidden animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full min-w-0 max-h-[92vh] overflow-y-auto overflow-x-hidden p-5 sm:p-6 shadow-modal my-auto flex flex-col gap-5 animate-modal"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Download Your Portfolio Report</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Save a copy of your properties and transactions for Excel, printing, or your CA.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex-shrink-0 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3 min-w-0">
          {/* Excel Export Card */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 hover:border-emerald-300 hover:bg-white transition-all min-w-0">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900">
                  Excel Workbook (.xlsx)
                </div>
                <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Multi-sheet workbook with live formulas and ₹ formatting — great for detailed review.
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDownload("excel")}
              disabled={downloading === "excel"}
              className="btn-action-brand px-4 py-2 rounded-xl text-xs whitespace-nowrap disabled:opacity-50 flex-shrink-0 w-full sm:w-auto"
            >
              {downloading === "excel" ? "Preparing..." : "Download Excel"}
            </button>
          </div>

          {/* PDF Export Card */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 hover:border-rose-300 hover:bg-white transition-all min-w-0">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900">
                  Summary PDF Statement (.pdf)
                </div>
                <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Clean print-ready summary of your deals, cash &amp; bank balances, and pending dues.
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDownload("pdf")}
              disabled={downloading === "pdf"}
              className="btn-action-primary px-4 py-2 rounded-xl text-xs whitespace-nowrap disabled:opacity-50 flex-shrink-0 w-full sm:w-auto"
            >
              {downloading === "pdf" ? "Preparing..." : "Download PDF"}
            </button>
          </div>

          {/* CSV Export Card */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 hover:border-blue-300 hover:bg-white transition-all min-w-0">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900">
                  All Transactions (.csv)
                </div>
                <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Simple spreadsheet file ready to import into Tally or any accounting tool.
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDownload("csv")}
              disabled={downloading === "csv"}
              className="btn-action-secondary px-4 py-2 rounded-xl text-xs whitespace-nowrap disabled:opacity-50 flex-shrink-0 w-full sm:w-auto"
            >
              {downloading === "csv" ? "Exporting..." : "Download CSV"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="btn-action-secondary px-4 py-2 rounded-xl text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
