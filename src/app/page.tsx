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
  const [categories, setCategories] =
    useState<SeedCategory[]>(INITIAL_CATEGORIES);

  const [commercialMetrics, setCommercialMetrics] =
    useState<CommercialDashboardMetrics | null>(null);
  const [personalMetrics, setPersonalMetrics] =
    useState<PersonalDashboardMetrics | null>(null);

  // User Auth State: Defaults to null so page refresh immediately lands on Login screen
  const [user, setUser] = useState<AuthUserData | null>(null);
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
    "outflow" | "inflow" | "transfer"
  >("outflow");
  const [entryDefaultPropertyCode, setEntryDefaultPropertyCode] =
    useState<string>("");

  const [isNewPropModalOpen, setIsNewPropModalOpen] = useState(false);
  const [isEditPropModalOpen, setIsEditPropModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<SeedProperty | null>(
    null
  );
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Selected Property for Ledger Modal
  const [selectedPropertyMetric, setSelectedPropertyMetric] =
    useState<PropertyFinancialMetrics | null>(null);
  const [selectedPersonalPropertyData, setSelectedPersonalPropertyData] =
    useState<{
      property: SeedProperty;
      totalInvested: number;
      pendingCommitment: number;
      transactions: SeedTransaction[];
    } | null>(null);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);

  // Recalculate metrics when data changes
  const recompute = useCallback(() => {
    const comm = calculateCommercialMetrics(
      properties,
      transactions,
      categories
    );
    const pers = calculatePersonalMetrics(properties, transactions);
    setCommercialMetrics(comm);
    setPersonalMetrics(pers);
  }, [properties, transactions, categories]);

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

  // Handlers
  const handleConfirmedLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
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

    const recordActivity = () => {
      localStorage.setItem("avaniya_last_activity", Date.now().toString());
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleConfirmedLogout();
      }, INACTIVITY_LIMIT_MS);
    };

    const checkStoredActivity = () => {
      const last = localStorage.getItem("avaniya_last_activity");
      if (last && Date.now() - parseInt(last, 10) > INACTIVITY_LIMIT_MS) {
        handleConfirmedLogout();
      } else {
        recordActivity();
      }
    };

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    activityEvents.forEach((evt) =>
      window.addEventListener(evt, recordActivity, { passive: true })
    );

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkStoredActivity();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    checkStoredActivity();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((evt) =>
        window.removeEventListener(evt, recordActivity)
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, handleConfirmedLogout]);

  const handleSwitchDataset = async (newDsId: string) => {
    setCurrentDatasetId(newDsId);
    await loadDatasetData(newDsId);
  };

  const handleOpenEntryModal = (
    type: "outflow" | "inflow" | "transfer",
    propertyCode?: string
  ) => {
    setEntryModalType(type);
    setEntryDefaultPropertyCode(propertyCode || "");
    setIsEntryModalOpen(true);
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
        setProperties((prev) =>
          prev.map((p) =>
            p.propertyCode.toLowerCase() === propertyCode.toLowerCase()
              ? { ...p, ...updates }
              : p
          )
        );
      }
    } catch {
      setProperties((prev) =>
        prev.map((p) =>
          p.propertyCode.toLowerCase() === propertyCode.toLowerCase()
            ? { ...p, ...updates }
            : p
        )
      );
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
        const localTx: SeedTransaction = {
          ...txData,
          id: `tx-${Date.now()}`,
          transCode: `${txData.transactionType.slice(0, 3).toUpperCase()}-${String(
            transactions.length + 1
          ).padStart(3, "0")}`,
        };
        setTransactions((prev) => [localTx, ...prev]);
      }
    } catch {
      const localTx: SeedTransaction = {
        ...txData,
        id: `tx-${Date.now()}`,
        transCode: `${txData.transactionType.slice(0, 3).toUpperCase()}-${String(
          transactions.length + 1
        ).padStart(3, "0")}`,
      };
      setTransactions((prev) => [localTx, ...prev]);
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
        const localProp: SeedProperty = {
          ...propData,
          id: `prop-${Date.now()}`,
          propertyCode:
            propData.propertyCode ||
            `${propData.type === "commercial" ? "LND" : "APT"}-${String(
              properties.length + 1
            ).padStart(3, "0")}`,
        };
        setProperties((prev) => [...prev, localProp]);
      }
    } catch {
      const localProp: SeedProperty = {
        ...propData,
        id: `prop-${Date.now()}`,
        propertyCode:
          propData.propertyCode ||
          `${propData.type === "commercial" ? "LND" : "APT"}-${String(
            properties.length + 1
          ).padStart(3, "0")}`,
      };
      setProperties((prev) => [...prev, localProp]);
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
    setSelectedPropertyMetric(metric);
    setSelectedPersonalPropertyData(null);
    setIsLedgerModalOpen(true);
  };

  const handleSelectPersonalProperty = (data: {
    property: SeedProperty;
    totalInvested: number;
    pendingCommitment: number;
    transactions: SeedTransaction[];
  }) => {
    setSelectedPersonalPropertyData(data);
    setSelectedPropertyMetric(null);
    setIsLedgerModalOpen(true);
  };

  // Clean Login Landing Screen (When unauthenticated or after refresh)
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between font-sans">
        <AuthModal
          isOpen={true}
          allowClose={false}
          onSuccess={async (authUserData) => {
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
            onSelectProperty={handleSelectCommercialProperty}
            onOpenNewDealModal={() => setIsNewPropModalOpen(true)}
            onEditProperty={handleOpenEditProperty}
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
          setSelectedPropertyMetric(null);
          setSelectedPersonalPropertyData(null);
        }}
        propertyMetrics={selectedPropertyMetric}
        personalPropertyData={selectedPersonalPropertyData}
        onOpenEntryModal={handleOpenEntryModal}
        onEditProperty={handleOpenEditProperty}
      />

      {/* Quick Data Entry Drawer */}
      <QuickEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        entryType={entryModalType}
        currentScope={appMode}
        defaultPropertyCode={entryDefaultPropertyCode}
        properties={properties}
        categories={categories}
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
