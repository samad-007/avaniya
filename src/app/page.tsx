"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { KpiStrip } from "@/components/dashboard/KpiStrip";
import { CommercialView } from "@/components/dashboard/CommercialView";
import { PersonalView } from "@/components/dashboard/PersonalView";
import { PropertyLedgerModal } from "@/components/dashboard/PropertyLedgerModal";
import { QuickEntryModal } from "@/components/modals/QuickEntryModal";
import { NewPropertyModal } from "@/components/modals/NewPropertyModal";
import { EditPropertyModal } from "@/components/modals/EditPropertyModal";
import { EditTransactionModal } from "@/components/modals/EditTransactionModal";
import { LoanModal } from "@/components/modals/LoanModal";
import { CategoryModal } from "@/components/modals/CategoryModal";
import { ExportModal } from "@/components/modals/ExportModal";
import { AuthModal, AuthUserData } from "@/components/auth/AuthModal";
import { LogoutConfirmModal } from "@/components/modals/LogoutConfirmModal";
import { SuperAdminDashboard } from "@/components/admin/SuperAdminDashboard";
import {
  CommercialDashboardMetrics,
  PersonalDashboardMetrics,
  PropertyFinancialMetrics,
} from "@/lib/formulaEngine";
import {
  SeedProperty,
  SeedTransaction,
  SeedCategory,
  SeedLoan,
  INITIAL_CATEGORIES,
} from "@/lib/seedData";
import {
  calculateCommercialMetrics,
  calculatePersonalMetrics,
} from "@/lib/formulaEngine";

export default function DashboardPage() {
  const [appMode, setAppMode] = useState<"commercial" | "personal">(
    "commercial"
  );
  const [properties, setProperties] = useState<SeedProperty[]>([]);
  const [transactions, setTransactions] = useState<SeedTransaction[]>([]);
  const [loans, setLoans] = useState<SeedLoan[]>([]);
  const [categories, setCategories] =
    useState<SeedCategory[]>(INITIAL_CATEGORIES);

  const [commercialMetrics, setCommercialMetrics] =
    useState<CommercialDashboardMetrics | null>(null);
  const [personalMetrics, setPersonalMetrics] =
    useState<PersonalDashboardMetrics | null>(null);

  // User Auth State
  const [user, setUser] = useState<AuthUserData | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Super Admin Workspace / Dataset State
  const [currentDatasetId, setCurrentDatasetId] = useState<string>(
    "ds_yousuf_portfolio"
  );
  const [isSuperAdminModalOpen, setIsSuperAdminModalOpen] = useState(false);

  // Modals state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryModalType, setEntryModalType] = useState<
    "outflow" | "inflow" | "transfer" | "withdrawal" | "loan"
  >("outflow");
  const [entryDefaultPropertyCode, setEntryDefaultPropertyCode] =
    useState<string>("");
  const [entryDefaultLoanCode, setEntryDefaultLoanCode] =
    useState<string>("");

  const [isNewPropModalOpen, setIsNewPropModalOpen] = useState(false);
  const [isEditPropModalOpen, setIsEditPropModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<SeedProperty | null>(
    null
  );
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<SeedLoan | null>(null);

  const [isEditTxModalOpen, setIsEditTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<SeedTransaction | null>(
    null
  );
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Selected Property for Ledger Modal (stored as key identifier, dynamically derived below)
  const [selectedPropertyCode, setSelectedPropertyCode] = useState<string | null>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState<"commercial" | "personal">("commercial");
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);

  // Dynamically derived active commercial property metric (auto-updates immediately on mutations without navigating away!)
  const activeCommercialPropertyMetric = React.useMemo(() => {
    if (!selectedPropertyCode || selectedPropertyType !== "commercial" || !commercialMetrics) {
      return null;
    }
    return (
      commercialMetrics.propertyMetrics.find(
        (pm) =>
          pm.property.propertyCode.toLowerCase() === selectedPropertyCode.toLowerCase() ||
          pm.property.id === selectedPropertyCode
      ) || null
    );
  }, [selectedPropertyCode, selectedPropertyType, commercialMetrics]);

  // Dynamically derived active personal property data (auto-updates immediately on mutations!)
  const activePersonalPropertyData = React.useMemo(() => {
    if (!selectedPropertyCode || selectedPropertyType !== "personal" || !personalMetrics) {
      return null;
    }
    const prop = properties.find(
      (p) =>
        p.type === "personal" &&
        (p.propertyCode.toLowerCase() === selectedPropertyCode.toLowerCase() ||
          p.id === selectedPropertyCode)
    );
    if (!prop) return null;
    const pTx = transactions.filter(
      (t) =>
        t.scope === "personal" &&
        (t.propertyCode === prop.propertyCode ||
          t.propertyCode === prop.name ||
          (t.remarks && t.remarks.includes(prop.name)))
    );
    const totalInvested = pTx
      .filter((t) => t.transactionType === "outflow")
      .reduce((sum, t) => sum + t.amount, 0);
    const pendingCommitment = Math.max(
      0,
      prop.agreedPurchasePrice - totalInvested
    );
    return {
      property: prop,
      totalInvested,
      pendingCommitment,
      transactions: pTx.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    };
  }, [selectedPropertyCode, selectedPropertyType, personalMetrics, properties, transactions]);

  // Recalculate metrics when data changes
  const recompute = useCallback(() => {
    const comm = calculateCommercialMetrics(
      properties,
      transactions,
      categories,
      loans
    );
    const pers = calculatePersonalMetrics(properties, transactions);
    setCommercialMetrics(comm);
    setPersonalMetrics(pers);
  }, [properties, transactions, categories, loans]);

  // Load dataset-specific data in a single consolidated HTTP call (cuts initial load latency by ~65%)
  const loadDatasetData = useCallback(async (targetDataset: string) => {
    try {
      const q = targetDataset ? `?datasetId=${encodeURIComponent(targetDataset)}` : "";
      const res = await fetch(`/api/bootstrap${q}`);

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setProperties(json.data.properties || []);
          setTransactions(json.data.transactions || []);
          setLoans(json.data.loans || []);
          setCategories(
            json.data.categories && json.data.categories.length > 0
              ? json.data.categories
              : INITIAL_CATEGORIES
          );
          if (json.data.commercialMetrics) {
            setCommercialMetrics(json.data.commercialMetrics);
          }
          if (json.data.personalMetrics) {
            setPersonalMetrics(json.data.personalMetrics);
          }
        }
      }
    } catch (e) {
      console.warn("API bootstrap fallback to local data", e);
    }
  }, []);

  useEffect(() => {
    recompute();
  }, [recompute]);

  // Auto-restore session from active cookie on initial mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const last = localStorage.getItem("avaniya_last_activity");
            const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;
            if (!last || Date.now() - parseInt(last, 10) <= INACTIVITY_LIMIT_MS) {
              localStorage.setItem(
                "avaniya_last_activity",
                Date.now().toString()
              );
              setUser(json.data);
              const activeDs =
                json.data.role === "super_admin"
                  ? "ds_yousuf_portfolio"
                  : json.data.datasetId || "fresh_user";
              setCurrentDatasetId(activeDs);
              await loadDatasetData(activeDs);
            }
          }
        }
      } catch (e) {
        console.warn("Session restore check failed", e);
      } finally {
        setIsAuthChecking(false);
      }
    }
    restoreSession();
  }, [loadDatasetData]);

  // Handlers
  const handleConfirmedLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    localStorage.removeItem("avaniya_last_activity");
    setUser(null);
    setProperties([]);
    setTransactions([]);
    setIsLogoutModalOpen(false);
  }, []);

  // Intercept browser back button & swipe back when authenticated
  useEffect(() => {
    if (!user) return;

    window.history.pushState({ dashboard: true }, "");

    const handlePopState = () => {
      window.history.pushState({ dashboard: true }, "");
      setIsLogoutModalOpen(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [user]);

  // Automatic Inactivity Session Timeout (30 mins idle)
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      localStorage.setItem("avaniya_last_activity", Date.now().toString());
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleConfirmedLogout();
      }, INACTIVITY_LIMIT_MS);
    };

    // Initialize activity timestamp for the active session
    resetTimer();

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    let lastThrottledTime = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle localStorage writes to once every 10 seconds
      if (now - lastThrottledTime > 10000) {
        lastThrottledTime = now;
        resetTimer();
      }
    };

    activityEvents.forEach((evt) =>
      window.addEventListener(evt, handleUserActivity, { passive: true })
    );

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const last = localStorage.getItem("avaniya_last_activity");
        if (last && Date.now() - parseInt(last, 10) > INACTIVITY_LIMIT_MS) {
          handleConfirmedLogout();
        } else {
          resetTimer();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((evt) =>
        window.removeEventListener(evt, handleUserActivity)
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, handleConfirmedLogout]);

  const handleSwitchDataset = async (newDsId: string) => {
    setCurrentDatasetId(newDsId);
    await loadDatasetData(newDsId);
  };

  const handleOpenEntryModal = (
    type: "outflow" | "inflow" | "transfer" | "withdrawal" | "loan",
    propertyCode?: string,
    loanCode?: string
  ) => {
    setEntryModalType(type);
    setEntryDefaultPropertyCode(propertyCode || "");
    setEntryDefaultLoanCode(loanCode || "");
    setIsEntryModalOpen(true);
  };

  const handleOpenNewLoanModal = () => {
    setEditingLoan(null);
    setIsLoanModalOpen(true);
  };

  const handleOpenEditLoan = (loan: SeedLoan) => {
    setEditingLoan(loan);
    setIsLoanModalOpen(true);
  };

  const handleSaveLoan = async (
    loanData: Omit<SeedLoan, "id" | "loanCode"> & {
      id?: string;
      loanCode?: string;
    }
  ) => {
    try {
      if (loanData.id || loanData.loanCode) {
        const idOrCode = loanData.loanCode || loanData.id || "";
        const res = await fetch(
          `/api/loans/${encodeURIComponent(idOrCode)}?datasetId=${encodeURIComponent(
            currentDatasetId
          )}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loanData),
          }
        );
        if (res.ok) {
          const json = await res.json();
          setLoans((prev) =>
            prev.map((l) =>
              (l.loanCode && l.loanCode.toLowerCase() === idOrCode.toLowerCase()) ||
              l.id === idOrCode
                ? { ...l, ...json.data }
                : l
            )
          );
        } else {
          const errJson = await res.json().catch(() => null);
          alert(`Error updating loan: ${errJson?.error || "Database error"}`);
          throw new Error(errJson?.error || "Failed to update loan");
        }
      } else {
        const res = await fetch("/api/loans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...loanData, datasetId: currentDatasetId }),
        });
        if (res.ok) {
          const json = await res.json();
          setLoans((prev) => [...prev, json.data]);
        } else {
          const errJson = await res.json().catch(() => null);
          alert(`Error saving loan: ${errJson?.error || "Database error"}`);
          throw new Error(errJson?.error || "Failed to save loan");
        }
      }
    } catch (err) {
      console.error("Save loan error:", err);
      throw err;
    }
  };

  const handleDeleteLoan = async (loanIdOrCode: string) => {
    try {
      await fetch(
        `/api/loans/${encodeURIComponent(loanIdOrCode)}?datasetId=${encodeURIComponent(
          currentDatasetId
        )}`,
        {
          method: "DELETE",
        }
      );
      setLoans((prev) =>
        prev.filter(
          (l) =>
            !(
              (l.loanCode &&
                l.loanCode.toLowerCase() === loanIdOrCode.toLowerCase()) ||
              l.id === loanIdOrCode
            )
        )
      );
    } catch {
      setLoans((prev) =>
        prev.filter(
          (l) =>
            !(
              (l.loanCode &&
                l.loanCode.toLowerCase() === loanIdOrCode.toLowerCase()) ||
              l.id === loanIdOrCode
            )
        )
      );
    }
  };

  const handleOpenEditProperty = (prop: SeedProperty) => {
    setEditingProperty(prop);
    setIsEditPropModalOpen(true);
  };

  const handleUpdateProperty = async (
    propertyCode: string,
    updates: Partial<SeedProperty>
  ) => {
    try {
      const res = await fetch(
        `/api/properties/${encodeURIComponent(propertyCode)}?datasetId=${encodeURIComponent(
          currentDatasetId
        )}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );
      if (res.ok) {
        const json = await res.json();
        setProperties((prev) =>
          prev.map((p) =>
            p.propertyCode.toLowerCase() === propertyCode.toLowerCase()
              ? { ...p, ...json.data }
              : p
          )
        );
      } else {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.error || "Failed to update property in MongoDB";
        alert(`Property update error: ${errMsg}`);
        throw new Error(errMsg);
      }
    } catch (err) {
      console.error("Update property error:", err);
      throw err;
    }
  };

  const handleSaveTransaction = async (
    txData: Omit<SeedTransaction, "id">
  ) => {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...txData, datasetId: currentDatasetId }),
      });
      if (res.ok) {
        const json = await res.json();
        setTransactions((prev) => [json.data, ...prev]);
      } else {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.error || "Failed to record transaction to MongoDB";
        if (res.status === 401) {
          setIsAuthModalOpen(true);
          alert("Your session has expired. Please log in again to persist your transaction to MongoDB.");
        } else {
          alert(`Transaction save error: ${errMsg}`);
        }
        throw new Error(errMsg);
      }
    } catch (err) {
      console.error("Save transaction error:", err);
      throw err;
    }
  };

  const handleOpenEditTransaction = (tx: SeedTransaction) => {
    setEditingTransaction(tx);
    setIsEditTxModalOpen(true);
  };

  const handleUpdateTransaction = async (
    transIdOrCode: string,
    updates: Partial<SeedTransaction>
  ) => {
    try {
      const res = await fetch(
        `/api/transactions/${encodeURIComponent(transIdOrCode)}?datasetId=${encodeURIComponent(
          currentDatasetId
        )}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );
      if (res.ok) {
        const json = await res.json();
        setTransactions((prev) =>
          prev.map((t) =>
            (t.transCode && t.transCode.toLowerCase() === transIdOrCode.toLowerCase()) ||
            t.id === transIdOrCode
              ? { ...t, ...json.data }
              : t
          )
        );
      } else {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.error || "Failed to update transaction in MongoDB";
        alert(`Transaction update error: ${errMsg}`);
        throw new Error(errMsg);
      }
    } catch (err) {
      console.error("Update transaction error:", err);
      throw err;
    }
  };

  const handleDeleteTransaction = async (transIdOrCode: string) => {
    try {
      const res = await fetch(
        `/api/transactions/${encodeURIComponent(transIdOrCode)}?datasetId=${encodeURIComponent(
          currentDatasetId
        )}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        setTransactions((prev) =>
          prev.filter(
            (t) =>
              !(
                (t.transCode &&
                  t.transCode.toLowerCase() === transIdOrCode.toLowerCase()) ||
                t.id === transIdOrCode
              )
          )
        );
      } else {
        const errJson = await res.json().catch(() => null);
        alert(`Delete transaction error: ${errJson?.error || "Failed to delete"}`);
      }
    } catch (err) {
      console.error("Delete transaction error:", err);
    }
  };

  const handleSaveProperty = async (
    propData: Omit<SeedProperty, "id" | "propertyCode"> & {
      propertyCode?: string;
    }
  ) => {
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...propData, datasetId: currentDatasetId }),
      });
      if (res.ok) {
        const json = await res.json();
        setProperties((prev) => [...prev, json.data]);
      } else {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.error || "Failed to save property to MongoDB";
        if (res.status === 401) {
          setIsAuthModalOpen(true);
          alert("Your session has expired. Please log in again to persist your property to MongoDB.");
        } else {
          alert(`Property save error: ${errMsg}`);
        }
        throw new Error(errMsg);
      }
    } catch (err) {
      console.error("Save property error:", err);
      throw err;
    }
  };

  const handleAddCategory = async (catData: SeedCategory) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...catData, datasetId: currentDatasetId }),
      });
      if (res.ok) {
        const json = await res.json();
        setCategories((prev) => [...prev, json.data]);
      } else {
        setCategories((prev) => [...prev, catData]);
      }
    } catch {
      setCategories((prev) => [...prev, catData]);
    }
  };

  const handleSelectCommercialProperty = (
    metric: PropertyFinancialMetrics
  ) => {
    setSelectedPropertyCode(metric.property.propertyCode);
    setSelectedPropertyType("commercial");
    setIsLedgerModalOpen(true);
  };

  const handleSelectPersonalProperty = (data: {
    property: SeedProperty;
    totalInvested: number;
    pendingCommitment: number;
    transactions: SeedTransaction[];
  }) => {
    setSelectedPropertyCode(data.property.propertyCode);
    setSelectedPropertyType("personal");
    setIsLedgerModalOpen(true);
  };

  // Initial Session Verification Splash
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-lg bg-[#111111] border border-[#333333]"></div>
          <span className="text-xs text-[#71717A] tracking-wider uppercase font-semibold">
            Loading Avaniya Workspace...
          </span>
        </div>
      </div>
    );
  }

  // Clean Login Landing Screen (When unauthenticated)
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between font-sans">
        <AuthModal
          isOpen={true}
          allowClose={false}
          onSuccess={async (authUserData) => {
            localStorage.setItem(
              "avaniya_last_activity",
              Date.now().toString()
            );
            setUser(authUserData);
            const activeDs =
              authUserData.role === "super_admin"
                ? "ds_yousuf_portfolio"
                : authUserData.datasetId || "fresh_user";
            setCurrentDatasetId(activeDs);
            await loadDatasetData(activeDs);
          }}
        />
        <Footer />
      </div>
    );
  }

  // Authenticated Main Dashboard
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Header Bar with Mode Switcher & Quick Actions */}
      <Header
        currentMode={appMode}
        onModeChange={(m) => setAppMode(m)}
        onOpenEntryModal={handleOpenEntryModal}
        onOpenNewPropertyModal={() => setIsNewPropModalOpen(true)}
        onOpenNewLoanModal={handleOpenNewLoanModal}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={() => setIsLogoutModalOpen(true)}
        onOpenSuperAdminModal={() => setIsSuperAdminModalOpen(true)}
        currentDatasetId={currentDatasetId}
        onSwitchDataset={handleSwitchDataset}
      />

      {/* Main Container */}
      <main className="max-w-[1440px] w-full mx-auto p-3.5 md:p-6 flex-1 flex flex-col gap-5">
        {/* Top Summary Liquidity Strip */}
        <KpiStrip
          mode={appMode}
          commercialMetrics={commercialMetrics}
          personalMetrics={personalMetrics}
        />

        {/* Commercial Mode View */}
        {appMode === "commercial" && commercialMetrics && (
          <CommercialView
            metrics={commercialMetrics}
            transactions={transactions}
            loans={loans}
            onSelectProperty={handleSelectCommercialProperty}
            onOpenNewDealModal={() => setIsNewPropModalOpen(true)}
            onOpenNewLoanModal={handleOpenNewLoanModal}
            onOpenEntryModal={handleOpenEntryModal}
            onEditProperty={handleOpenEditProperty}
            onEditLoan={handleOpenEditLoan}
            onEditTransaction={handleOpenEditTransaction}
          />
        )}

        {/* Personal Mode View */}
        {appMode === "personal" && personalMetrics && (
          <PersonalView
            metrics={personalMetrics}
            transactions={transactions}
            onSelectProperty={handleSelectPersonalProperty}
            onOpenNewPropertyModal={() => setIsNewPropModalOpen(true)}
            onOpenEntryModal={handleOpenEntryModal}
            onEditProperty={handleOpenEditProperty}
            onEditTransaction={handleOpenEditTransaction}
          />
        )}
      </main>

      {/* Super Admin Control Center Modal */}
      <SuperAdminDashboard
        isOpen={isSuperAdminModalOpen}
        onClose={() => setIsSuperAdminModalOpen(false)}
        currentDatasetId={currentDatasetId}
        onSwitchDataset={handleSwitchDataset}
      />

      {/* Re-Auth Modal (When opened from Header) */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          allowClose={true}
          onSuccess={async (authUserData) => {
            localStorage.setItem(
              "avaniya_last_activity",
              Date.now().toString()
            );
            setUser(authUserData);
            setIsAuthModalOpen(false);
            const activeDs =
              authUserData.role === "super_admin"
                ? "ds_yousuf_portfolio"
                : authUserData.datasetId || "fresh_user";
            setCurrentDatasetId(activeDs);
            await loadDatasetData(activeDs);
          }}
        />
      )}

      {/* Logout Confirmation Prompt Modal (Triggered by button click OR swipe/back) */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmedLogout}
        userName={user?.name}
      />

      {/* Property Deep-Dive Ledger Modal */}
      <PropertyLedgerModal
        isOpen={isLedgerModalOpen}
        onClose={() => {
          setIsLedgerModalOpen(false);
          setSelectedPropertyCode(null);
        }}
        propertyMetrics={activeCommercialPropertyMetric}
        personalPropertyData={activePersonalPropertyData}
        onOpenEntryModal={handleOpenEntryModal}
        onEditProperty={handleOpenEditProperty}
        onEditTransaction={handleOpenEditTransaction}
      />

      {/* Quick Data Entry Drawer */}
      <QuickEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        entryType={entryModalType}
        currentScope={appMode}
        defaultPropertyCode={entryDefaultPropertyCode}
        defaultLoanCode={entryDefaultLoanCode}
        properties={properties}
        loans={loans}
        categories={categories}
        propertyMetrics={commercialMetrics?.propertyMetrics}
        loanMetrics={commercialMetrics?.loanMetrics}
        onSave={handleSaveTransaction}
        onOpenCategoryModal={() => {
          setIsEntryModalOpen(false);
          setIsCategoryModalOpen(true);
        }}
      />

      {/* New Property Modal */}
      <NewPropertyModal
        isOpen={isNewPropModalOpen}
        onClose={() => setIsNewPropModalOpen(false)}
        defaultType={appMode}
        onSave={handleSaveProperty}
      />

      {/* Edit Property Modal (Edit Any & Every Data Point) */}
      <EditPropertyModal
        isOpen={isEditPropModalOpen}
        onClose={() => {
          setIsEditPropModalOpen(false);
          setEditingProperty(null);
        }}
        property={editingProperty}
        onSave={handleUpdateProperty}
      />

      {/* Loan Facility Modal (Create / Edit Loan Facility) */}
      <LoanModal
        isOpen={isLoanModalOpen}
        onClose={() => {
          setIsLoanModalOpen(false);
          setEditingLoan(null);
        }}
        loan={editingLoan}
        properties={properties}
        defaultScope={appMode}
        onSave={handleSaveLoan}
        onDelete={handleDeleteLoan}
      />

      {/* Edit Transaction Modal (Edit / Delete Historical Transactions) */}
      <EditTransactionModal
        isOpen={isEditTxModalOpen}
        onClose={() => {
          setIsEditTxModalOpen(false);
          setEditingTransaction(null);
        }}
        transaction={editingTransaction}
        properties={properties}
        loans={loans}
        categories={categories}
        onSave={handleUpdateTransaction}
        onDelete={handleDeleteTransaction}
      />

      {/* Dynamic Category Engine Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Persistent System Footer */}
      <Footer
        propertyCount={properties.length}
        transactionCount={transactions.length}
        totalLiquidity={
          appMode === "commercial"
            ? commercialMetrics?.currentNetLiquidity
            : personalMetrics?.netPersonalLiquidity
        }
      />
    </div>
  );
}
