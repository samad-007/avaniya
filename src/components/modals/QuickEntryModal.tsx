"use client";

import React, { useState, useEffect, useMemo } from "react";
import { amountToVerbalSummary } from "@/lib/formatters";
import {
  SeedProperty,
  SeedCategory,
  SeedTransaction,
  SeedLoan,
} from "@/lib/seedData";
import {
  PropertyFinancialMetrics,
  LoanFinancialMetrics,
} from "@/lib/formulaEngine";
import { X, Banknote, Landmark, Plus, Edit3, Zap, Link2 } from "lucide-react";

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
  const [loanCode, setLoanCode] = useState<string>(defaultLoanCode || "");
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
  const [borneBy, setBorneBy] = useState<"self" | "seller" | "buyer" | "split">(
    "self"
  );
  const [amountSelf, setAmountSelf] = useState<number>(500000);
  const [amountSeller, setAmountSeller] = useState<number>(0);
  const [amountBuyer, setAmountBuyer] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (borneBy === "self") {
      setAmountSelf(amount || 0);
      setAmountSeller(0);
      setAmountBuyer(0);
    } else if (borneBy === "seller") {
      setAmountSeller(amount || 0);
      setAmountSelf(0);
      setAmountBuyer(0);
    } else if (borneBy === "buyer") {
      setAmountBuyer(amount || 0);
      setAmountSelf(0);
      setAmountSeller(0);
    }
  }, [amount, borneBy]);

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
          label: `Fill remaining seller balance (${activePropMetric.property.propertyCode})`,
          amount: activePropMetric.pendingOutflow,
          remarks: `Balance settlement for ${activePropMetric.property.propertyCode}`,
        };
      }
    } else if (activeType === "inflow") {
      if (activePropMetric && activePropMetric.pendingInflow > 0) {
        return {
          label: `Fill remaining buyer due (${activePropMetric.property.propertyCode})`,
          amount: activePropMetric.pendingInflow,
          remarks: `Sale value settlement for ${activePropMetric.property.propertyCode}`,
        };
      }
    } else if (activeType === "loan") {
      if (loanSubtype === "loan_repayment") {
        if (activeLoanMetric && activeLoanMetric.outstandingPrincipal > 0) {
          return {
            label: `Fill remaining loan principal (${activeLoanMetric.loan.loanCode})`,
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
            label: `Fill monthly interest (${activeLoanMetric.loan.loanCode})`,
            amount: monthlyInt,
            remarks: `Monthly interest payment for ${activeLoanMetric.loan.loanCode}`,
          };
        }
      } else if (loanSubtype === "loan_profit_share") {
        if (
          activeLoanMetric &&
          (activeLoanMetric.loan.profitSharePct || 0) > 0
        ) {
          return {
            label: `Pay profit share (${activeLoanMetric.loan.loanCode})`,
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
  }, [
    isOpen,
    activeType,
    withdrawalSubtype,
    loanSubtype,
    currentScope,
    availableCategories,
  ]);

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
        borneBy: activeType === "outflow" ? borneBy : "self",
        amountSelf:
          activeType === "outflow"
            ? borneBy === "split"
              ? amountSelf
              : borneBy === "self"
              ? amount
              : 0
            : 0,
        amountSeller:
          activeType === "outflow"
            ? borneBy === "split"
              ? amountSeller
              : borneBy === "seller"
              ? amount
              : 0
            : 0,
        amountBuyer:
          activeType === "outflow"
            ? borneBy === "split"
              ? amountBuyer
              : borneBy === "buyer"
              ? amount
              : 0
            : 0,
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
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overflow-x-hidden animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-md-surface-lowest border border-md-outline-variant rounded-[24px] max-w-lg w-full min-w-0 max-h-[92vh] overflow-y-auto overflow-x-hidden p-5 sm:p-6 shadow-m3-3 my-auto flex flex-col gap-4 sm:gap-5 animate-modal"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-md-outline-variant/60 pb-3.5 gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-base sm:text-lg font-bold text-md-on-surface tracking-tight flex items-center gap-2 flex-wrap">
              <span>
                {activeType === "outflow"
                  ? "Record a Payment"
                  : activeType === "inflow"
                  ? "Record Money Received"
                  : activeType === "withdrawal"
                  ? "Record a Withdrawal"
                  : activeType === "loan"
                  ? "Record Loan Activity"
                  : "Move Money (Bank ↔ Cash)"}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-md-surface-container text-md-on-surface-variant border border-md-outline-variant">
                {currentScope === "commercial" ? "Business" : "Personal"}
              </span>
            </div>
            <p className="text-xs text-md-on-surface-variant mt-0.5">
              {activeType === "outflow"
                ? "Money you paid for a property, registration, or expense."
                : activeType === "inflow"
                ? "Money received from a buyer, partner, or personal savings."
                : activeType === "withdrawal"
                ? "Profit taken out or capital returned to a partner."
                : activeType === "loan"
                ? "Loan amount borrowed, repaid, or interest paid."
                : "Transfer cash between your bank account and cash in hand."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-container transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Entry Type Selector Tabs */}
        <div className="grid grid-cols-5 gap-1 bg-md-surface-container p-1 rounded-[18px] border border-md-outline-variant min-w-0">
          {(
            [
              { id: "outflow", label: "Payment", activeClass: "text-md-error" },
              { id: "inflow", label: "Receipt", activeClass: "text-md-positive" },
              { id: "withdrawal", label: "Withdraw", activeClass: "text-md-warning" },
              { id: "loan", label: "Loan", activeClass: "text-teal-700" },
              { id: "transfer", label: "Transfer", activeClass: "text-md-tertiary" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveType(tab.id)}
              className={`py-1.5 px-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all truncate min-w-0 ${
                activeType === tab.id
                  ? `bg-md-surface-lowest shadow-sm font-bold ${tab.activeClass}`
                  : "text-md-on-surface-variant hover:text-md-on-surface"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loan Flow Selector */}
        {activeType === "loan" && (
          <div className="flex flex-col gap-2.5 bg-md-primary-container/45 p-3.5 rounded-[18px] border border-md-outline-variant">
            <label className="text-xs font-bold text-md-on-primary-container">
              What kind of loan entry is this?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  {
                    id: "loan_inflow",
                    title: "+ Borrowed Money",
                    desc: "Loan received into bank/cash",
                  },
                  {
                    id: "loan_repayment",
                    title: "- Repaid Principal",
                    desc: "Paying back the loan amount",
                  },
                  {
                    id: "loan_interest",
                    title: "- Paid Interest",
                    desc: "Monthly or periodic interest",
                  },
                  {
                    id: "loan_profit_share",
                    title: "- Paid Profit Share",
                    desc: "Share of profit given to lender",
                  },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLoanSubtype(opt.id)}
                  className={`p-2.5 rounded-[18px] text-left text-xs transition-all border ${
                    loanSubtype === opt.id
                      ? "bg-md-surface-lowest border-md-primary text-md-on-surface shadow-sm ring-2 ring-md-primary/20"
                      : "bg-md-surface-lowest/70 border-md-outline-variant text-md-on-surface-variant hover:bg-md-surface-lowest"
                  }`}
                >
                  <div className="font-bold text-md-on-primary-container">{opt.title}</div>
                  <div className="text-[11px] text-md-on-surface-variant mt-0.5">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1 pt-2 border-t border-md-outline-variant/70">
              <label className="text-xs font-semibold text-md-on-surface">
                Which Loan?
              </label>
              <select
                value={loanCode}
                onChange={(e) => {
                  setLoanCode(e.target.value);
                  const selLoan = loans.find(
                    (l) => l.loanCode === e.target.value
                  );
                  if (selLoan && !recipient) {
                    setRecipient(selLoan.lenderName);
                  }
                }}
                className="w-full min-w-0 bg-md-surface-lowest border border-md-outline-variant rounded-[18px] p-2 text-md-on-surface text-xs outline-none focus:border-md-primary cursor-pointer truncate"
              >
                <option value="">-- General Unlinked Loan --</option>
                {loans.map((l) => (
                  <option key={l.id} value={l.loanCode}>
                    {l.loanCode} : {l.lenderName} (₹
                    {l.principalAmount.toLocaleString("en-IN")})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Withdrawal Purpose Selector */}
        {activeType === "withdrawal" && (
          <div className="flex flex-col gap-2 bg-md-warning-container/50 p-3.5 rounded-[18px] border border-md-outline-variant">
            <label className="text-xs font-bold text-md-on-warning-container">
              What are you withdrawing?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWithdrawalSubtype("profit_withdrawal")}
                className={`p-2.5 rounded-[18px] text-left text-xs transition-all border ${
                  withdrawalSubtype === "profit_withdrawal"
                    ? "bg-md-surface-lowest border-md-warning text-md-on-surface shadow-sm ring-2 ring-md-warning/20"
                    : "bg-md-surface-lowest/70 border-md-outline-variant text-md-on-surface-variant hover:bg-md-surface-lowest"
                }`}
              >
                <div className="font-bold text-md-on-warning-container">Profit Drawing</div>
                <div className="text-[11px] text-md-on-surface-variant mt-0.5">
                  Take out earned profit for personal use
                </div>
              </button>
              <button
                type="button"
                onClick={() => setWithdrawalSubtype("capital_withdrawal")}
                className={`p-2.5 rounded-[18px] text-left text-xs transition-all border ${
                  withdrawalSubtype === "capital_withdrawal"
                    ? "bg-md-surface-lowest border-md-warning text-md-on-surface shadow-sm ring-2 ring-md-warning/20"
                    : "bg-md-surface-lowest/70 border-md-outline-variant text-md-on-surface-variant hover:bg-md-surface-lowest"
                }`}
              >
                <div className="font-bold text-md-on-warning-container">Capital Refund</div>
                <div className="text-[11px] text-md-on-surface-variant mt-0.5">
                  Return original invested money
                </div>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
          {/* Amount Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-md-on-surface">
              Amount (₹ INR)
            </label>
            <input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full min-w-0 bg-md-surface-low border border-md-outline-variant rounded-[18px] p-3 text-xl sm:text-2xl font-mono font-bold text-md-on-surface outline-none focus:bg-md-surface-lowest focus:border-md-primary focus:ring-2 focus:ring-md-primary/20 transition-all"
              required
            />
            <div className="bg-md-warning-container border border-md-outline-variant rounded-lg px-3 py-1.5 text-xs font-mono font-semibold text-md-on-warning-container">
              {amountToVerbalSummary(amount)}
            </div>

            {suggestedFill && (
              <button
                type="button"
                onClick={() => {
                  setAmount(suggestedFill.amount);
                  if (suggestedFill.remarks && !remarks) {
                    setRemarks(suggestedFill.remarks);
                  }
                }}
                className="flex items-center justify-between px-3 py-2 rounded-[18px] bg-md-primary-container border border-md-outline-variant text-md-on-primary-container text-xs font-semibold hover:bg-md-primary-container transition-colors text-left"
              >
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-md-primary flex-shrink-0" />
                  <span>{suggestedFill.label}</span>
                </div>
                <span className="font-mono font-bold text-md-on-primary-container whitespace-nowrap ml-2">
                  ₹{suggestedFill.amount.toLocaleString("en-IN")}
                </span>
              </button>
            )}

            <div className="flex flex-wrap gap-1.5 mt-1">
              {[
                { label: "+10k", val: 10000 },
                { label: "+50k", val: 50000 },
                { label: "+1L", val: 100000 },
                { label: "+5L", val: 500000 },
                { label: "+10L", val: 1000000 },
                { label: "+50L", val: 5000000 },
                { label: "+1Cr", val: 10000000 },
              ].map((chip, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleAddPreset(chip.val)}
                  className="px-2.5 py-1 rounded-lg bg-md-surface-container hover:bg-md-surface-high border border-md-outline-variant text-xs font-mono font-semibold text-md-on-surface transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Mode */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-md-on-surface">
              Payment Mode
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-md-surface-container p-1 rounded-[18px] border border-md-outline-variant">
              <button
                type="button"
                onClick={() => setMode("Bank")}
                className={`py-2 rounded-lg flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm transition-all ${
                  mode === "Bank"
                    ? "bg-md-surface-lowest text-md-on-surface shadow-sm"
                    : "text-md-on-surface-variant hover:text-md-on-surface"
                }`}
              >
                <Landmark className="w-4 h-4 text-md-tertiary" />
                <span>Bank / UPI / Cheque</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("Cash")}
                className={`py-2 rounded-lg flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm transition-all ${
                  mode === "Cash"
                    ? "bg-md-surface-lowest text-md-on-surface shadow-sm"
                    : "text-md-on-surface-variant hover:text-md-on-surface"
                }`}
              >
                <Banknote className="w-4 h-4 text-md-primary" />
                <span>Cash</span>
              </button>
            </div>
          </div>

          {/* Transfer Direction */}
          {activeType === "transfer" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-md-on-surface">
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
                className="w-full min-w-0 bg-md-surface-low border border-md-outline-variant rounded-[18px] p-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:border-md-primary truncate"
              >
                <option value="Bank Withdrawal to Cash">
                  Bank → Cash (Withdrew cash from bank)
                </option>
                <option value="Cash Deposit to Bank">
                  Cash → Bank (Deposited cash into bank)
                </option>
              </select>
            </div>
          )}

          {/* Link to Property */}
          {activeType !== "transfer" && activeType !== "withdrawal" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-md-on-surface">
                Which Property?
              </label>
              <select
                value={propertyCode}
                onChange={(e) => setPropertyCode(e.target.value)}
                className="w-full min-w-0 bg-md-surface-low border border-md-outline-variant rounded-[18px] p-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:border-md-primary truncate"
              >
                <option value="">-- General Portfolio (Not linked to one property) --</option>
                {properties
                  .filter(
                    (p) =>
                      p.type === currentScope || currentScope === "commercial"
                  )
                  .map((p) => (
                    <option key={p.id} value={p.propertyCode}>
                      {p.propertyCode} : {p.name}
                    </option>
                  ))}
              </select>

              {selectedProperty?.subPlots &&
                selectedProperty.subPlots.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1 bg-md-primary-container/40 p-2.5 rounded-[18px] border border-md-outline-variant">
                    <label className="text-[11px] font-bold text-md-on-primary-container">
                      Specific Sub-Plot (Optional)
                    </label>
                    <select
                      value={subPlotNumber}
                      onChange={(e) => setSubPlotNumber(e.target.value)}
                      className="w-full min-w-0 bg-md-surface-lowest border border-md-outline-variant rounded-lg p-2 text-md-on-surface text-xs outline-none focus:border-md-primary cursor-pointer truncate"
                    >
                      <option value="">-- Whole Property --</option>
                      {selectedProperty.subPlots.map((sp) => (
                        <option key={sp.id} value={sp.plotNumber}>
                          Plot #{sp.plotNumber} (
                          {sp.sqftArea.toLocaleString("en-IN")} sqft -{" "}
                          {sp.status.toUpperCase()}
                          {sp.buyerName ? ` - ${sp.buyerName}` : ""})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
            </div>
          )}

          {/* Category */}
          {activeType !== "transfer" && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="text-xs font-semibold text-md-on-surface">
                  Category
                </label>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(!isCustomCategory);
                      if (!isCustomCategory) {
                        setCustomCategoryInput(category);
                      }
                    }}
                    className="text-xs text-md-positive hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>
                      {isCustomCategory ? "Pick from List" : "Type Custom"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenCategoryModal}
                    className="text-xs text-md-tertiary hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Manage</span>
                  </button>
                </div>
              </div>

              {isCustomCategory ? (
                <div className="relative">
                  <input
                    type="text"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    placeholder="Type category name..."
                    list="custom-inflow-suggestions"
                    className="w-full min-w-0 bg-md-surface-low border border-md-outline-variant rounded-[18px] p-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:border-md-primary"
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
                  className="w-full min-w-0 bg-md-surface-low border border-md-outline-variant rounded-[18px] p-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:border-md-primary cursor-pointer truncate"
                >
                  {availableCategories.map((c, idx) => (
                    <option key={idx} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Who Pays / Bears This Cost (Outflows only) */}
          {activeType === "outflow" && (
            <div className="flex flex-col gap-2 bg-md-surface-low p-3.5 rounded-[18px] border border-md-outline-variant">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="text-xs font-semibold text-md-on-surface">
                  Who bears this cost?
                </label>
                <span className="text-[11px] text-md-on-surface-variant">
                  {borneBy === "self"
                    ? "Your own project expense"
                    : borneBy === "seller"
                    ? "Deducted from seller balance"
                    : borneBy === "buyer"
                    ? "Added to buyer bill"
                    : "Split between parties"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-md-surface-container p-1 rounded-[18px] border border-md-outline-variant/80">
                <button
                  type="button"
                  onClick={() => {
                    setBorneBy("self");
                    setAmountSelf(amount);
                    setAmountSeller(0);
                    setAmountBuyer(0);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    borneBy === "self"
                      ? "bg-md-surface-lowest text-md-on-surface shadow-sm"
                      : "text-md-on-surface-variant hover:text-md-on-surface"
                  }`}
                >
                  Myself
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBorneBy("seller");
                    setAmountSeller(amount);
                    setAmountSelf(0);
                    setAmountBuyer(0);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    borneBy === "seller"
                      ? "bg-md-warning-container text-md-on-warning-container shadow-sm"
                      : "text-md-on-surface-variant hover:text-md-on-surface"
                  }`}
                >
                  For Seller
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBorneBy("buyer");
                    setAmountBuyer(amount);
                    setAmountSelf(0);
                    setAmountSeller(0);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    borneBy === "buyer"
                      ? "bg-md-tertiary-container text-md-on-tertiary-container shadow-sm"
                      : "text-md-on-surface-variant hover:text-md-on-surface"
                  }`}
                >
                  For Buyer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBorneBy("split");
                    if (amountSelf + amountSeller + amountBuyer !== amount) {
                      setAmountSelf(amount);
                      setAmountSeller(0);
                      setAmountBuyer(0);
                    }
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    borneBy === "split"
                      ? "bg-md-secondary-container text-md-on-secondary-container shadow-sm"
                      : "text-md-on-surface-variant hover:text-md-on-surface"
                  }`}
                >
                  Split Cost
                </button>
              </div>

              {borneBy === "split" && (
                <div className="flex flex-col gap-2.5 pt-2 border-t border-md-outline-variant/80">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-md-on-surface-variant font-semibold mr-1">
                      Quick split:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const half = Math.round(amount * 0.5);
                        setAmountSelf(half);
                        setAmountSeller(amount - half);
                        setAmountBuyer(0);
                      }}
                      className="px-2 py-0.5 rounded-md bg-md-surface-lowest border border-md-outline-variant text-[11px] text-md-on-surface hover:bg-md-surface-container"
                    >
                      50/50 Self &amp; Seller
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const half = Math.round(amount * 0.5);
                        setAmountBuyer(half);
                        setAmountSeller(amount - half);
                        setAmountSelf(0);
                      }}
                      className="px-2 py-0.5 rounded-md bg-md-surface-lowest border border-md-outline-variant text-[11px] text-md-on-surface hover:bg-md-surface-container"
                    >
                      50/50 Buyer &amp; Seller
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const third = Math.floor(amount / 3);
                        setAmountSelf(third);
                        setAmountSeller(third);
                        setAmountBuyer(amount - third * 2);
                      }}
                      className="px-2 py-0.5 rounded-md bg-md-surface-lowest border border-md-outline-variant text-[11px] text-md-on-surface hover:bg-md-surface-container"
                    >
                      Equal 3-Way
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-md-on-surface">
                        My Share (₹)
                      </label>
                      <input
                        type="number"
                        value={amountSelf || ""}
                        onChange={(e) =>
                          setAmountSelf(parseFloat(e.target.value) || 0)
                        }
                        placeholder="0"
                        className="bg-md-surface-lowest border border-md-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-md-on-surface font-mono focus:border-md-secondary outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-md-warning">
                        Seller Share (₹)
                      </label>
                      <input
                        type="number"
                        value={amountSeller || ""}
                        onChange={(e) =>
                          setAmountSeller(parseFloat(e.target.value) || 0)
                        }
                        placeholder="0"
                        className="bg-md-surface-lowest border border-md-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-md-on-warning-container font-mono focus:border-md-warning outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-md-tertiary">
                        Buyer Share (₹)
                      </label>
                      <input
                        type="number"
                        value={amountBuyer || ""}
                        onChange={(e) =>
                          setAmountBuyer(parseFloat(e.target.value) || 0)
                        }
                        placeholder="0"
                        className="bg-md-surface-lowest border border-md-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-md-on-tertiary-container font-mono focus:border-md-tertiary outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-md-on-surface-variant">
                      Split Total:{" "}
                      <span className="font-mono font-bold text-md-on-surface">
                        ₹
                        {(
                          (amountSelf || 0) +
                          (amountSeller || 0) +
                          (amountBuyer || 0)
                        ).toLocaleString("en-IN")}
                      </span>{" "}
                      / ₹{amount.toLocaleString("en-IN")}
                    </span>
                    {amount -
                      ((amountSelf || 0) +
                        (amountSeller || 0) +
                        (amountBuyer || 0)) ===
                    0 ? (
                      <span className="text-md-positive font-semibold">
                        Matches 100%
                      </span>
                    ) : (
                      <span className="text-md-warning font-semibold">
                        ₹
                        {Math.abs(
                          amount -
                            ((amountSelf || 0) +
                              (amountSeller || 0) +
                              (amountBuyer || 0))
                        ).toLocaleString("en-IN")}{" "}
                        difference
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Date & Person */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-w-0 bg-md-surface-low border border-md-outline-variant rounded-[18px] p-2.5 text-md-on-surface text-sm outline-none focus:bg-md-surface-lowest focus:border-md-primary"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-xs font-semibold text-md-on-surface">
                {activeType === "inflow"
                  ? "Received From"
                  : activeType === "withdrawal"
                  ? "Taken By"
                  : "Paid To"}
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={
                  activeType === "inflow"
                    ? "e.g. Buyer name, Partner..."
                    : activeType === "withdrawal"
                    ? "e.g. Personal account, Partner..."
                    : "e.g. Seller, Lawyer, Broker..."
                }
                className="w-full min-w-0 bg-md-surface-low border border-md-outline-variant rounded-[18px] p-2.5 text-md-on-surface placeholder:text-md-on-surface-variant text-sm outline-none focus:bg-md-surface-lowest focus:border-md-primary"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-md-on-surface">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Token advance paid, Cheque #004521"
              className="w-full min-w-0 bg-md-surface-low border border-md-outline-variant rounded-[18px] p-2.5 text-md-on-surface placeholder:text-md-on-surface-variant text-sm outline-none focus:bg-md-surface-lowest focus:border-md-primary"
            />
          </div>

          {/* Receipt Link */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-xs font-semibold text-md-on-surface flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-md-on-surface-variant" />
              <span>Receipt / Document Link (Optional)</span>
            </label>
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full min-w-0 bg-md-surface-low border border-md-outline-variant rounded-[18px] p-2.5 text-md-on-surface placeholder:text-md-on-surface-variant text-sm outline-none focus:bg-md-surface-lowest focus:border-md-primary"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-2.5 pt-3 border-t border-md-outline-variant/60 flex-wrap sm:flex-nowrap">
            <button
              type="submit"
              disabled={
                isSubmitting ||
                (activeType === "outflow" &&
                  borneBy === "split" &&
                  (amountSelf || 0) + (amountSeller || 0) + (amountBuyer || 0) !==
                    amount)
              }
              className="btn-action-brand flex-1 py-2.5 rounded-[18px] text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Entry"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-action-secondary px-4 py-2.5 rounded-[18px] text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
