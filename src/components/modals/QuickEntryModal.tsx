"use client";

import React, { useState, useEffect, useMemo } from "react";
import { amountToVerbalSummary } from "@/lib/formatters";
import { SeedProperty, SeedCategory, SeedTransaction, SeedLoan } from "@/lib/seedData";
import { PropertyFinancialMetrics, LoanFinancialMetrics } from "@/lib/formulaEngine";
import { X, Banknote, Landmark, Plus, Edit3, HandCoins, Zap, Link2 } from "lucide-react";

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryType: "outflow" | "inflow" | "transfer" | "withdrawal" | "loan";
  currentScope: "commercial" | "personal";
  defaultPropertyCode?: string;
  defaultLoanCode?: string;
  properties: SeedProperty[];
  loans?: SeedLoan[];
  categories: SeedCategory[];
  propertyMetrics?: PropertyFinancialMetrics[];
  loanMetrics?: LoanFinancialMetrics[];
  onSave: (transactionData: Omit<SeedTransaction, "id">) => Promise<void>;
  onOpenCategoryModal: () => void;
}

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({
  isOpen,
  onClose,
  entryType: initialEntryType,
  currentScope,
  defaultPropertyCode,
  defaultLoanCode,
  properties,
  loans = [],
  categories,
  propertyMetrics,
  loanMetrics,
  onSave,
  onOpenCategoryModal,
}) => {
  const [activeType, setActiveType] = useState<
    "outflow" | "inflow" | "transfer" | "withdrawal" | "loan"
  >(initialEntryType);
  const [withdrawalSubtype, setWithdrawalSubtype] = useState<
    "profit_withdrawal" | "capital_withdrawal"
  >("profit_withdrawal");
  const [loanSubtype, setLoanSubtype] = useState<
    "loan_inflow" | "loan_repayment" | "loan_interest" | "loan_profit_share"
  >("loan_inflow");
  const [amount, setAmount] = useState<number>(500000);
  const [mode, setMode] = useState<"Bank" | "Cash">("Bank");
  const [propertyCode, setPropertyCode] = useState<string>(
    defaultPropertyCode || ""
  );
  const [loanCode, setLoanCode] = useState<string>(
    defaultLoanCode || ""
  );
  const [subPlotNumber, setSubPlotNumber] = useState<string>("");
  const [attachmentUrl, setAttachmentUrl] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [recipient, setRecipient] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [transferType, setTransferType] = useState<
    | "Bank Withdrawal to Cash"
    | "Cash Deposit to Bank"
    | "Cash to Bank"
    | "Bank to Cash"
  >("Bank Withdrawal to Cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProperty = useMemo(() => {
    return properties.find(
      (p) => p.propertyCode.toLowerCase() === (propertyCode || "").toLowerCase()
    );
  }, [properties, propertyCode]);

  const activePropMetric = useMemo(() => {
    if (!propertyMetrics || !propertyCode) return undefined;
    return propertyMetrics.find(
      (m) => m.property.propertyCode.toLowerCase() === propertyCode.toLowerCase()
    );
  }, [propertyMetrics, propertyCode]);

  const activeLoanMetric = useMemo(() => {
    if (!loanMetrics || !loanCode) return undefined;
    return loanMetrics.find(
      (lm) => lm.loan.loanCode.toLowerCase() === loanCode.toLowerCase()
    );
  }, [loanMetrics, loanCode]);

  const suggestedFill = useMemo(() => {
    if (activeType === "outflow") {
      if (activePropMetric && activePropMetric.pendingOutflow > 0) {
        return {
          label: `Pay Deal Balance Due (${activePropMetric.property.propertyCode})`,
          amount: activePropMetric.pendingOutflow,
          remarks: `Balance settlement for ${activePropMetric.property.propertyCode}`,
        };
      }
    } else if (activeType === "inflow") {
      if (activePropMetric && activePropMetric.pendingInflow > 0) {
        return {
          label: `Collect Remaining Sale Value (${activePropMetric.property.propertyCode})`,
          amount: activePropMetric.pendingInflow,
          remarks: `Sale value settlement for ${activePropMetric.property.propertyCode}`,
        };
      }
    } else if (activeType === "loan") {
      if (loanSubtype === "loan_repayment") {
        if (activeLoanMetric && activeLoanMetric.outstandingPrincipal > 0) {
          return {
            label: `Settle Loan Principal (${activeLoanMetric.loan.loanCode})`,
            amount: activeLoanMetric.outstandingPrincipal,
            remarks: `Principal settlement for ${activeLoanMetric.loan.loanCode}`,
          };
        }
      } else if (loanSubtype === "loan_interest") {
        const rate = activeLoanMetric?.loan.interestRatePct;
        if (activeLoanMetric && rate && rate > 0) {
          const principal =
            activeLoanMetric.outstandingPrincipal ||
            activeLoanMetric.loan.principalAmount;
          const annualInt = Math.round((principal * rate) / 100);
          const monthlyInt = Math.round(annualInt / 12);
          return {
            label: `Pay Monthly Interest (${activeLoanMetric.loan.loanCode})`,
            amount: monthlyInt,
            remarks: `Monthly interest payment for ${activeLoanMetric.loan.loanCode}`,
          };
        }
      } else if (loanSubtype === "loan_profit_share") {
        if (activeLoanMetric && (activeLoanMetric.loan.profitSharePct || 0) > 0) {
          return {
            label: `Pay Profit Share (${activeLoanMetric.loan.loanCode})`,
            amount: 0,
            remarks: `Profit share for ${activeLoanMetric.loan.loanCode}`,
          };
        }
      }
    }
    return null;
  }, [activeType, loanSubtype, activePropMetric, activeLoanMetric]);

  useEffect(() => {
    if (isOpen) {
      setActiveType(initialEntryType);
      setSubPlotNumber("");
      setAttachmentUrl("");
      if (defaultLoanCode) {
        setLoanCode(defaultLoanCode);
      } else if (loans.length > 0) {
        setLoanCode(loans[0].loanCode);
      }
    }
  }, [isOpen, initialEntryType, defaultLoanCode, loans]);

  useEffect(() => {
    setSubPlotNumber("");
    if (defaultPropertyCode) {
      setPropertyCode(defaultPropertyCode);
    } else if (properties.length > 0) {
      const match = properties.find(
        (p) => p.type === currentScope || currentScope === "commercial"
      );
      setPropertyCode(match ? match.propertyCode : "");
    } else {
      setPropertyCode("");
    }
  }, [defaultPropertyCode, properties, currentScope, isOpen]);

  // Robust category filtration matching scope and entry type
  const availableCategories = useMemo(() => {
    const list = categories.filter((c) => {
      const scopeMatches =
        c.scope === "both" ||
        c.scope === currentScope ||
        (!c.scope && currentScope === "commercial");
      
      if (activeType === "transfer") {
        return scopeMatches && c.type === "transfer";
      }
      if (activeType === "withdrawal") {
        return (
          scopeMatches &&
          (withdrawalSubtype === "profit_withdrawal"
            ? c.financialRole === "profit_withdrawal"
            : c.financialRole === "capital_withdrawal")
        );
      }
      if (activeType === "loan") {
        if (loanSubtype === "loan_inflow") {
          return scopeMatches && c.financialRole === "loan_principal_borrowed";
        }
        if (loanSubtype === "loan_repayment") {
          return scopeMatches && c.financialRole === "loan_principal_repaid";
        }
        if (loanSubtype === "loan_interest") {
          return scopeMatches && c.financialRole === "loan_interest_expense";
        }
        if (loanSubtype === "loan_profit_share") {
          return scopeMatches && c.financialRole === "loan_profit_distribution";
        }
      }
      if (activeType === "inflow") {
        return scopeMatches && c.type === "inflow";
      }
      return scopeMatches && c.type === "outflow";
    });

    if (list.length > 0) return list;

    // Safety fallback defaults
    if (activeType === "loan") {
      if (loanSubtype === "loan_inflow") {
        return [
          {
            name: "Bank Loan Borrowing",
            scope: currentScope,
            type: "inflow" as const,
            financialRole: "loan_principal_borrowed" as const,
          },
          {
            name: "Family / Friend Loan Borrowing",
            scope: currentScope,
            type: "inflow" as const,
            financialRole: "loan_principal_borrowed" as const,
          },
        ];
      }
      if (loanSubtype === "loan_repayment") {
        return [
          {
            name: "Loan Principal Repayment",
            scope: currentScope,
            type: "outflow" as const,
            financialRole: "loan_principal_repaid" as const,
          },
          {
            name: "Bank Loan EMI / Principal Repaid",
            scope: currentScope,
            type: "outflow" as const,
            financialRole: "loan_principal_repaid" as const,
          },
        ];
      }
      if (loanSubtype === "loan_interest") {
        return [
          {
            name: "Loan Interest Payment",
            scope: currentScope,
            type: "outflow" as const,
            financialRole: "loan_interest_expense" as const,
          },
        ];
      }
      return [
        {
          name: "Lender / Partner Profit Share Paid",
          scope: currentScope,
          type: "outflow" as const,
          financialRole: "loan_profit_distribution" as const,
        },
      ];
    } else if (activeType === "withdrawal") {
      return withdrawalSubtype === "profit_withdrawal"
        ? [
            {
              name: "Partner Profit Drawing",
              scope: currentScope,
              type: "outflow" as const,
              financialRole: "profit_withdrawal" as const,
            },
            {
              name: "Inter-Business Fund Reallocation",
              scope: currentScope,
              type: "outflow" as const,
              financialRole: "profit_withdrawal" as const,
            },
            {
              name: "Director Profit Dividend",
              scope: currentScope,
              type: "outflow" as const,
              financialRole: "profit_withdrawal" as const,
            },
            {
              name: "Personal Savings Withdrawal",
              scope: currentScope,
              type: "outflow" as const,
              financialRole: "profit_withdrawal" as const,
            },
          ]
        : [
            {
              name: "Partner Capital Refund",
              scope: currentScope,
              type: "outflow" as const,
              financialRole: "capital_withdrawal" as const,
            },
            {
              name: "Equity Reduction / Capital Return",
              scope: currentScope,
              type: "outflow" as const,
              financialRole: "capital_withdrawal" as const,
            },
            {
              name: "Investor Principal Refund",
              scope: currentScope,
              type: "outflow" as const,
              financialRole: "capital_withdrawal" as const,
            },
          ];
    } else if (activeType === "inflow") {
      return currentScope === "personal"
        ? [
            {
              name: "Personal Savings",
              scope: "personal" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
            {
              name: "Salary / Professional Income",
              scope: "personal" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
            {
              name: "Rental Income",
              scope: "personal" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
            {
              name: "Fixed Deposit / Mutual Fund Return",
              scope: "personal" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
            {
              name: "Asset / Gold Sale",
              scope: "personal" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
            {
              name: "General Personal Inflow",
              scope: "personal" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
          ]
        : [
            {
              name: "Booking Token",
              scope: "commercial" as const,
              type: "inflow" as const,
              financialRole: "sale_receipt" as const,
            },
            {
              name: "Sale Installment",
              scope: "commercial" as const,
              type: "inflow" as const,
              financialRole: "sale_receipt" as const,
            },
            {
              name: "Final Settlement",
              scope: "commercial" as const,
              type: "inflow" as const,
              financialRole: "sale_receipt" as const,
            },
            {
              name: "Bank Account Funding",
              scope: "commercial" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
            {
              name: "Partner Investment",
              scope: "commercial" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
            {
              name: "Business Loan",
              scope: "commercial" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
            {
              name: "General Capital Inflow",
              scope: "commercial" as const,
              type: "inflow" as const,
              financialRole: "capital_infusion" as const,
            },
          ];
    } else if (activeType === "transfer") {
      return [
        {
          name: "Internal Liquidity Transfer",
          scope: "both" as const,
          type: "transfer" as const,
          financialRole: "internal_transfer" as const,
        },
      ];
    } else {
      return [
        {
          name: "Purchase Advance",
          scope: "commercial" as const,
          type: "outflow" as const,
          financialRole: "purchase_principal" as const,
        },
        {
          name: "Legal & Docs",
          scope: "commercial" as const,
          type: "outflow" as const,
          financialRole: "property_expense" as const,
        },
        {
          name: "Booking Amount / Agreement",
          scope: "personal" as const,
          type: "outflow" as const,
          financialRole: "personal_milestone" as const,
        },
      ];
    }
  }, [categories, currentScope, activeType, withdrawalSubtype, loanSubtype]);

  // Synchronize category on modal open or type switch
  useEffect(() => {
    if (isOpen) {
      setIsCustomCategory(false);
      setCustomCategoryInput("");
      if (availableCategories.length > 0) {
        if (!category || !availableCategories.some((c) => c.name === category)) {
          setCategory(availableCategories[0].name);
        }
      }
    }
  }, [isOpen, activeType, withdrawalSubtype, loanSubtype, currentScope, availableCategories]);

  if (!isOpen) return null;

  const handleAddPreset = (val: number) => {
    setAmount((prev) => (prev || 0) + val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    const finalCategory = isCustomCategory
      ? customCategoryInput.trim() ||
        (activeType === "withdrawal"
          ? "Profit Drawing"
          : activeType === "loan"
          ? "Loan Transaction"
          : "General Inflow")
      : category || (availableCategories[0]?.name ?? "General");

    // Determine precise transaction type
    let finalTxType:
      | "outflow"
      | "deal_inflow"
      | "capital_inflow"
      | "transfer"
      | "profit_withdrawal"
      | "capital_withdrawal"
      | "loan_inflow"
      | "loan_repayment"
      | "loan_interest"
      | "loan_profit_share" = "outflow";

    let targetLoanId: string | undefined;
    let targetLoanCode: string | undefined;

    if (activeType === "transfer") {
      finalTxType = "transfer";
    } else if (activeType === "withdrawal") {
      finalTxType = withdrawalSubtype;
    } else if (activeType === "loan") {
      finalTxType = loanSubtype;
      targetLoanCode = loanCode || undefined;
      const matchedLoan = loans.find(
        (l) => l.loanCode.toLowerCase() === (loanCode || "").toLowerCase()
      );
      targetLoanId = matchedLoan ? matchedLoan.id : undefined;
    } else if (activeType === "inflow") {
      if (currentScope === "commercial" && propertyCode) {
        finalTxType = "deal_inflow";
      } else {
        finalTxType = "capital_inflow";
      }
    } else {
      finalTxType = "outflow";
    }

    setIsSubmitting(true);
    try {
      await onSave({
        scope: currentScope,
        transactionType: finalTxType,
        loanId: targetLoanId,
        loanCode: targetLoanCode,
        propertyCode:
          activeType === "withdrawal" ||
          activeType === "transfer" ||
          activeType === "loan"
            ? undefined
            : propertyCode || undefined,
        category: finalCategory,
        mode,
        transferType: activeType === "transfer" ? transferType : undefined,
        amount,
        subPlotNumber:
          activeType === "withdrawal" ||
          activeType === "transfer" ||
          activeType === "loan"
            ? undefined
            : subPlotNumber || undefined,
        attachmentUrl: attachmentUrl.trim() || undefined,
        recipientOrSource: recipient,
        remarks,
        date,
      });
      onClose();
    } catch (err) {
      console.error("Save error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overflow-x-hidden animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-lg w-full max-w-full min-w-0 max-h-[92vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 shadow-2xl my-auto flex flex-col gap-4 sm:gap-5 animate-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-3 sm:pb-3.5 gap-2">
          <div className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 flex-wrap min-w-0 flex-1">
            <span className="break-words">
              {activeType === "outflow"
                ? "Record Outflow / Expense"
                : activeType === "inflow"
                ? "Record Inflow / Receipt"
                : activeType === "withdrawal"
                ? "Record Fund / Capital Withdrawal"
                : activeType === "loan"
                ? "Record Loan / Debt Transaction"
                : "Internal Liquidity Transfer"}
            </span>
            <span className="text-[10px] sm:text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#161616] text-[#A1A1AA] border border-[#262626] flex-shrink-0">
              {currentScope.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#1a1a1a] transition-all duration-150 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Entry Type Selector Tabs */}
        <div className="grid grid-cols-5 gap-1 bg-[#111111] p-1 rounded-lg border border-[#262626] min-w-0">
          <button
            type="button"
            onClick={() => setActiveType("outflow")}
            className={`py-1.5 px-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all duration-150 truncate min-w-0 ${
              activeType === "outflow"
                ? "bg-[#262626] text-white shadow-sm font-bold"
                : "text-[#A1A1AA] hover:text-white"
            }`}
          >
            Outflow
          </button>
          <button
            type="button"
            onClick={() => setActiveType("inflow")}
            className={`py-1.5 px-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all duration-150 truncate min-w-0 ${
              activeType === "inflow"
                ? "bg-[#262626] text-white shadow-sm font-bold text-[#22C55E]"
                : "text-[#A1A1AA] hover:text-white"
            }`}
          >
            Inflow
          </button>
          <button
            type="button"
            onClick={() => setActiveType("withdrawal")}
            className={`py-1.5 px-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all duration-150 truncate min-w-0 ${
              activeType === "withdrawal"
                ? "bg-[#262626] text-white shadow-sm font-bold text-amber-400"
                : "text-[#A1A1AA] hover:text-white"
            }`}
          >
            Withdraw
          </button>
          <button
            type="button"
            onClick={() => setActiveType("loan")}
            className={`py-1.5 px-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all duration-150 truncate min-w-0 ${
              activeType === "loan"
                ? "bg-[#262626] text-white shadow-sm font-bold text-emerald-400"
                : "text-[#A1A1AA] hover:text-white"
            }`}
          >
            Loan
          </button>
          <button
            type="button"
            onClick={() => setActiveType("transfer")}
            className={`py-1.5 px-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all duration-150 truncate min-w-0 ${
              activeType === "transfer"
                ? "bg-[#262626] text-white shadow-sm font-bold text-[#3B82F6]"
                : "text-[#A1A1AA] hover:text-white"
            }`}
          >
            Transfer
          </button>
        </div>

        {/* Loan Flow Selector (Only if activeType === "loan") */}
        {activeType === "loan" && (
          <div className="flex flex-col gap-2 bg-[#111111] p-3 rounded-lg border border-emerald-900/30">
            <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Loan Action / Cashflow Direction
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLoanSubtype("loan_inflow")}
                className={`p-2 rounded-md text-left text-xs transition-all duration-150 border ${
                  loanSubtype === "loan_inflow"
                    ? "bg-emerald-950/50 border-emerald-500 text-white font-bold"
                    : "bg-[#161616] border-[#2a2a2a] text-[#A1A1AA] hover:text-white"
                }`}
              >
                <div className="font-semibold text-emerald-300">+ Borrow Funds</div>
                <div className="text-[10px] text-[#A1A1AA] mt-0.5">
                  Receiving loan injection (+ Bank/Cash)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLoanSubtype("loan_repayment")}
                className={`p-2 rounded-md text-left text-xs transition-all duration-150 border ${
                  loanSubtype === "loan_repayment"
                    ? "bg-emerald-950/50 border-emerald-500 text-white font-bold"
                    : "bg-[#161616] border-[#2a2a2a] text-[#A1A1AA] hover:text-white"
                }`}
              >
                <div className="font-semibold text-emerald-300">- Repay Principal</div>
                <div className="text-[10px] text-[#A1A1AA] mt-0.5">
                  Paying back borrowed loan principal
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLoanSubtype("loan_interest")}
                className={`p-2 rounded-md text-left text-xs transition-all duration-150 border ${
                  loanSubtype === "loan_interest"
                    ? "bg-emerald-950/50 border-emerald-500 text-white font-bold"
                    : "bg-[#161616] border-[#2a2a2a] text-[#A1A1AA] hover:text-white"
                }`}
              >
                <div className="font-semibold text-emerald-300">- Pay Interest</div>
                <div className="text-[10px] text-[#A1A1AA] mt-0.5">
                  Finance charge / interest expense
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLoanSubtype("loan_profit_share")}
                className={`p-2 rounded-md text-left text-xs transition-all duration-150 border ${
                  loanSubtype === "loan_profit_share"
                    ? "bg-emerald-950/50 border-emerald-500 text-white font-bold"
                    : "bg-[#161616] border-[#2a2a2a] text-[#A1A1AA] hover:text-white"
                }`}
              >
                <div className="font-semibold text-emerald-300">- Pay Profit Share</div>
                <div className="text-[10px] text-[#A1A1AA] mt-0.5">
                  Distribute partner/friend profit bonus
                </div>
              </button>
            </div>

            {/* Loan Facility Selector Dropdown */}
            <div className="flex flex-col gap-1 mt-1 pt-2 border-t border-[#1e1e1e]">
              <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
                Tag to Loan Facility Agreement
              </label>
              <select
                value={loanCode}
                onChange={(e) => {
                  setLoanCode(e.target.value);
                  const selLoan = loans.find((l) => l.loanCode === e.target.value);
                  if (selLoan && !recipient) {
                    setRecipient(selLoan.lenderName);
                  }
                }}
                className="w-full max-w-full min-w-0 bg-[#161616] border border-[#2a2a2a] rounded-lg p-2 text-white text-xs outline-none focus:border-emerald-500 cursor-pointer truncate"
              >
                <option value="">-- General Unlinked Debt --</option>
                {loans.map((l) => (
                  <option key={l.id} value={l.loanCode}>
                    {l.loanCode} : {l.lenderName} (₹{l.principalAmount.toLocaleString("en-IN")})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Withdrawal Purpose Selector (Only if activeType === "withdrawal") */}
        {activeType === "withdrawal" && (
          <div className="flex flex-col gap-1.5 bg-[#111111] p-2.5 rounded-lg border border-amber-900/30">
            <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Withdrawal Type &amp; Purpose
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWithdrawalSubtype("profit_withdrawal")}
                className={`p-2 rounded-md text-left text-xs transition-all duration-150 border ${
                  withdrawalSubtype === "profit_withdrawal"
                    ? "bg-amber-950/50 border-amber-500 text-white font-bold"
                    : "bg-[#161616] border-[#2a2a2a] text-[#A1A1AA] hover:text-white"
                }`}
              >
                <div className="font-semibold text-amber-300">Profit / Business Draw</div>
                <div className="text-[10px] text-[#A1A1AA] mt-0.5">
                  Draw profit to fund other venture / personal dividend
                </div>
              </button>
              <button
                type="button"
                onClick={() => setWithdrawalSubtype("capital_withdrawal")}
                className={`p-2 rounded-md text-left text-xs transition-all duration-150 border ${
                  withdrawalSubtype === "capital_withdrawal"
                    ? "bg-amber-950/50 border-amber-500 text-white font-bold"
                    : "bg-[#161616] border-[#2a2a2a] text-[#A1A1AA] hover:text-white"
                }`}
              >
                <div className="font-semibold text-amber-300">Investment Capital Refund</div>
                <div className="text-[10px] text-[#A1A1AA] mt-0.5">
                  Return invested capital principal / reduce equity pool
                </div>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-4 text-sm">
          {/* Big Amount Input with Live Indian Verbal Conversion */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Amount (₹ INR)
            </label>
            <input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full max-w-full min-w-0 bg-[#111111] border border-[#262626] rounded-lg p-2.5 sm:p-3 text-xl sm:text-2xl font-mono font-bold text-white outline-none focus:border-[#555555] transition-all duration-150"
              required
            />
            {/* Verbal Converter Display */}
            <div className="bg-[#111111] border border-dashed border-[#383838] rounded-md px-3 py-1.5 text-xs font-mono font-semibold text-[#F59E0B]">
              {amountToVerbalSummary(amount)}
            </div>

            {/* Smart 1-Click Pay/Collect Balance Pre-fill */}
            {suggestedFill && (
              <button
                type="button"
                onClick={() => {
                  setAmount(suggestedFill.amount);
                  if (suggestedFill.remarks && !remarks) {
                    setRemarks(suggestedFill.remarks);
                  }
                }}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-semibold hover:bg-emerald-900/50 hover:border-emerald-400 transition-all duration-150 text-left"
              >
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{suggestedFill.label}</span>
                </div>
                <span className="font-mono font-bold text-white whitespace-nowrap ml-2">
                  ₹{suggestedFill.amount.toLocaleString("en-IN")}
                </span>
              </button>
            )}

            {/* Quick Amount Increment Preset Chips */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
              {[
                { label: "+10k", val: 10000 },
                { label: "+50k", val: 50000 },
                { label: "+1 Lakh", val: 100000 },
                { label: "+5 Lakhs", val: 500000 },
                { label: "+10 Lakhs", val: 1000000 },
                { label: "+50 Lakhs", val: 5000000 },
                { label: "+1 Crore", val: 10000000 },
              ].map((chip, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleAddPreset(chip.val)}
                  className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md bg-[#141414] border border-[#262626] text-[11px] sm:text-xs font-mono font-medium text-[#D4D4D8] hover:text-black hover:bg-white hover:border-white transition-all duration-150"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Mode (Bank vs Cash) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Payment Mode
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#111111] p-1 rounded-lg border border-[#262626]">
              <button
                type="button"
                onClick={() => setMode("Bank")}
                className={`py-2 sm:py-2.5 rounded-md flex items-center justify-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm transition-all duration-150 ${
                  mode === "Bank"
                    ? "bg-[#262626] text-white shadow-sm font-bold"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
              >
                <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#3B82F6]" />
                <span>Bank (NEFT / RTGS)</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("Cash")}
                className={`py-2 sm:py-2.5 rounded-md flex items-center justify-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm transition-all duration-150 ${
                  mode === "Cash"
                    ? "bg-[#262626] text-white shadow-sm font-bold"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
              >
                <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#22C55E]" />
                <span>Cash in Hand</span>
              </button>
            </div>
          </div>

          {/* Transfer Type (Only if transfer mode) */}
          {activeType === "transfer" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Transfer Direction
              </label>
              <select
                value={transferType}
                onChange={(e) =>
                  setTransferType(
                    e.target.value as
                      | "Bank Withdrawal to Cash"
                      | "Cash Deposit to Bank"
                      | "Cash to Bank"
                      | "Bank to Cash"
                  )
                }
                className="w-full max-w-full min-w-0 bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-base sm:text-sm outline-none focus:border-[#555555] truncate"
              >
                <option value="Bank Withdrawal to Cash">
                  Bank Withdrawal to Cash (Withdraw from Bank into Cash Hand)
                </option>
                <option value="Cash Deposit to Bank">
                  Cash Deposit to Bank (Deposit Cash into Bank Account)
                </option>
              </select>
            </div>
          )}

          {/* Link to Property */}
          {activeType !== "transfer" && activeType !== "withdrawal" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Link to Property / Land Deal
              </label>
              <select
                value={propertyCode}
                onChange={(e) => setPropertyCode(e.target.value)}
                className="w-full max-w-full min-w-0 bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-base sm:text-sm outline-none focus:border-[#555555] truncate"
              >
                <option value="">-- General Portfolio (Unlinked) --</option>
                {properties
                  .filter(
                    (p) =>
                      p.type === currentScope ||
                      currentScope === "commercial"
                  )
                  .map((p) => (
                    <option key={p.id} value={p.propertyCode}>
                      {p.propertyCode} : {p.name}
                    </option>
                  ))}
              </select>

              {/* Sub-Plot Dropdown (if land deal has sub-plots) */}
              {selectedProperty?.subPlots && selectedProperty.subPlots.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-2 bg-[#141414] p-2.5 rounded-lg border border-[#262626]">
                  <label className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                    Tag to Sub-Plot / Unit (Optional)
                  </label>
                  <select
                    value={subPlotNumber}
                    onChange={(e) => setSubPlotNumber(e.target.value)}
                    className="w-full max-w-full min-w-0 bg-[#1c1c1c] border border-[#333333] rounded-lg p-2 text-white text-xs outline-none focus:border-emerald-500 cursor-pointer truncate"
                  >
                    <option value="">-- Deal Level (Whole Land Parcel) --</option>
                    {selectedProperty.subPlots.map((sp) => (
                      <option key={sp.id} value={sp.plotNumber}>
                        Plot #{sp.plotNumber} ({sp.sqftArea.toLocaleString("en-IN")} sqft - {sp.status.toUpperCase()}{sp.buyerName ? ` - ${sp.buyerName}` : ""})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Category Selector (Select / Custom Toggle) */}
          {activeType !== "transfer" && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                  Category
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(!isCustomCategory);
                      if (!isCustomCategory) {
                        setCustomCategoryInput(category);
                      }
                    }}
                    className="text-xs text-[#22C55E] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isCustomCategory ? "Pick from List" : "+ Type Custom"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenCategoryModal}
                    className="text-xs text-[#3B82F6] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="hidden sm:inline">Engine</span>
                  </button>
                </div>
              </div>

              {isCustomCategory ? (
                <div className="relative">
                  <input
                    type="text"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    placeholder="Type custom category name..."
                    list="custom-inflow-suggestions"
                    className="w-full max-w-full min-w-0 bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-base sm:text-sm outline-none focus:border-[#22C55E]"
                    required
                    autoFocus
                  />
                  <datalist id="custom-inflow-suggestions">
                    {availableCategories.map((c, idx) => (
                      <option key={idx} value={c.name} />
                    ))}
                  </datalist>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full max-w-full min-w-0 bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-base sm:text-sm outline-none focus:border-[#555555] cursor-pointer truncate"
                >
                  {availableCategories.map((c, idx) => (
                    <option key={idx} value={c.name} className="bg-[#111111] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Date & Recipient Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full max-w-full min-w-0 bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-base sm:text-sm outline-none focus:border-[#555555]"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                {activeType === "inflow"
                  ? "Received From / Source"
                  : activeType === "withdrawal"
                  ? "Beneficiary / Partner Withdrawing"
                  : "Paid To / Beneficiary"}
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={
                  activeType === "inflow"
                    ? "e.g. Partner, Buyer, Escrow..."
                    : activeType === "withdrawal"
                    ? "e.g. Samad (Draw), Partner A, Other Business LLC..."
                    : "e.g. Seller, Lawyer, Stalin..."
                }
                className="w-full max-w-full min-w-0 bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-base sm:text-sm outline-none focus:border-[#555555]"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
              Remarks / Transaction Notes
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Token advance paid at lawyer office, Cheque #004521"
              className="w-full max-w-full min-w-0 bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-base sm:text-sm outline-none focus:border-[#555555]"
            />
          </div>

          {/* Document / Receipt Proof URL */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#A1A1AA]" />
              <span>Document / Receipt Proof URL (Optional)</span>
            </label>
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://drive.google.com/... or Dropbox / iCloud link"
              className="w-full max-w-full min-w-0 bg-[#111111] border border-[#262626] rounded-lg p-2.5 text-white text-base sm:text-sm outline-none focus:border-[#555555]"
            />
          </div>

          {/* Submit Action Buttons */}
          <div className="flex items-center gap-2.5 pt-2.5 border-t border-[#262626] flex-wrap sm:flex-nowrap">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-action-primary flex-1 py-2.5 rounded-lg text-xs sm:text-sm disabled:opacity-50 font-semibold"
            >
              {isSubmitting ? "Saving Transaction..." : "Save Transaction"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-[#161616] text-white border border-[#2a2a2a] text-xs sm:text-sm font-medium hover:bg-[#222222] transition-all duration-150"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
