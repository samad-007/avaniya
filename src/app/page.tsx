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
import { CategoryModal } from "@/components/modals/CategoryModal";
import { ExportModal } from "@/components/modals/ExportModal";
import { AuthModal } from "@/components/auth/AuthModal";
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
  INITIAL_PROPERTIES,
  INITIAL_TRANSACTIONS,
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
  const [properties, setProperties] =
    useState<SeedProperty[]>(INITIAL_PROPERTIES);
  const [transactions, setTransactions] =
    useState<SeedTransaction[]>(INITIAL_TRANSACTIONS);
  const [categories, setCategories] =
    useState<SeedCategory[]>(INITIAL_CATEGORIES);

  const [commercialMetrics, setCommercialMetrics] =
    useState<CommercialDashboardMetrics | null>(null);
  const [personalMetrics, setPersonalMetrics] =
    useState<PersonalDashboardMetrics | null>(null);

  // User Auth State
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
    datasetId?: string;
  } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  // Load dataset-specific data
  const loadDatasetData = useCallback(async (targetDataset: string) => {
    try {
      const q = targetDataset ? `?datasetId=${encodeURIComponent(targetDataset)}` : "";
      const [propsRes, txsRes, catsRes] = await Promise.all([
        fetch(`/api/properties${q}`),
        fetch(`/api/transactions${q}`),
        fetch(`/api/categories${q}`),
      ]);

      if (propsRes.ok && txsRes.ok && catsRes.ok) {
        const propsData = await propsRes.json();
        const txsData = await txsRes.json();
        const catsData = await catsRes.json();

        setProperties(propsData.data || []);
        setTransactions(txsData.data || []);
        setCategories(
          catsData.data && catsData.data.length > 0
            ? catsData.data
            : INITIAL_CATEGORIES
        );
      }
    } catch (e) {
      console.warn("API load fallback to local data", e);
    }
  }, []);

  // Check auth and initial Fetch from API
  useEffect(() => {
    async function initSessionAndData() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.success && meData.data) {
            setUser(meData.data);
            const activeDs =
              meData.data.role === "super_admin"
                ? "ds_yousuf_portfolio"
                : meData.data.datasetId || "fresh_user";
            setCurrentDatasetId(activeDs);
            await loadDatasetData(activeDs);
            return;
          }
        }
        setIsAuthModalOpen(true);
        await loadDatasetData("ds_yousuf_portfolio");
      } catch (e) {
        console.warn("API init error", e);
      }
    }
    initSessionAndData();
  }, [loadDatasetData]);

  useEffect(() => {
    recompute();
  }, [recompute]);

  // Handlers
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    setIsAuthModalOpen(true);
  };

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

  const handleSaveTransaction = async (txData: any) => {
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

  const handleSaveProperty = async (propData: Omit<SeedProperty, "id">) => {
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
        onLogout={handleLogout}
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

      {/* Authentication Screen / Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        allowClose={!!user}
        onSuccess={async (authUserData) => {
          setUser(authUserData);
          setIsAuthModalOpen(false);
          const activeDs =
            authUserData.role === "super_admin"
              ? "ds_yousuf_portfolio"
              : (authUserData as any).datasetId || "fresh_user";
          setCurrentDatasetId(activeDs);
          await loadDatasetData(activeDs);
        }}
      />

      {/* Property Deep-Dive Ledger Modal */}
      <PropertyLedgerModal
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
        propertyMetrics={selectedPropertyMetric}
        personalPropertyData={selectedPersonalPropertyData}
        onOpenEntryModal={handleOpenEntryModal}
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
