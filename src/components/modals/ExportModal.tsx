"use client";

import React, { useState } from "react";
import { X, FileSpreadsheet, FileText, Database, Download } from "lucide-react";
import { M3LoadingIndicator } from "@/components/ui/M3ExpressivePrimitives";

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
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto overflow-x-hidden animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-md-surface-lowest dark:bg-md-surface-low rounded-[28px] max-w-lg w-full min-w-0 max-h-[92vh] overflow-y-auto overflow-x-hidden p-5 sm:p-6 shadow-m3-3 my-auto flex flex-col gap-5 animate-modal"
      >
        <div className="flex items-start justify-between pb-4 gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold text-md-on-surface tracking-tight flex items-center gap-2">
              <Download className="w-5 h-5 text-md-primary flex-shrink-0" />
              <span>Download Your Portfolio Report</span>
            </h2>
            <p className="text-xs text-md-on-surface-variant mt-1">
              Save a copy of your properties and transactions for Excel, printing, or your CA.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-high flex-shrink-0 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3 min-w-0">
          <div className="bg-md-surface-container dark:bg-md-surface-high/80 rounded-[22px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 transition-all min-w-0">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-[14px] bg-md-positive-container text-md-on-positive-container flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-md-on-surface">
                  Excel Workbook (.xlsx)
                </div>
                <div className="text-xs text-md-on-surface-variant mt-0.5 leading-relaxed">
                  Multi-sheet workbook with live formulas and ₹ formatting — great for detailed review.
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDownload("excel")}
              disabled={downloading === "excel"}
              className="m3-btn-filled px-4 py-2 text-xs whitespace-nowrap disabled:opacity-70 flex-shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
            >
              {downloading === "excel" && <M3LoadingIndicator size="xs" />}
              <span>{downloading === "excel" ? "Preparing..." : "Download Excel"}</span>
            </button>
          </div>

          <div className="bg-md-surface-container dark:bg-md-surface-high/80 rounded-[22px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 transition-all min-w-0">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-[14px] bg-md-error-container text-md-on-error-container flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-md-on-surface">
                  Summary PDF Statement (.pdf)
                </div>
                <div className="text-xs text-md-on-surface-variant mt-0.5 leading-relaxed">
                  Clean print-ready summary of your deals, cash &amp; bank balances, and pending dues.
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDownload("pdf")}
              disabled={downloading === "pdf"}
              className="m3-btn-primary-tonal px-4 py-2 text-xs whitespace-nowrap disabled:opacity-70 flex-shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
            >
              {downloading === "pdf" && <M3LoadingIndicator size="xs" />}
              <span>{downloading === "pdf" ? "Preparing..." : "Download PDF"}</span>
            </button>
          </div>

          <div className="bg-md-surface-container dark:bg-md-surface-high/80 rounded-[22px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 transition-all min-w-0">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-[14px] bg-md-tertiary-container text-md-on-tertiary-container flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-md-on-surface">
                  All Transactions (.csv)
                </div>
                <div className="text-xs text-md-on-surface-variant mt-0.5 leading-relaxed">
                  Simple spreadsheet file ready to import into Tally or any accounting tool.
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDownload("csv")}
              disabled={downloading === "csv"}
              className="m3-btn-outlined px-4 py-2 text-xs whitespace-nowrap disabled:opacity-70 flex-shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
            >
              {downloading === "csv" && <M3LoadingIndicator size="xs" />}
              <span>{downloading === "csv" ? "Exporting..." : "Download CSV"}</span>
            </button>
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button onClick={onClose} className="m3-btn-outlined px-5 py-2 text-xs">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
