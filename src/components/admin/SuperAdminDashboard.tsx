"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  KeyRound,
  Plus,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  AlertCircle,
  X,
} from "lucide-react";
import { generateSecurePassword } from "@/lib/passwordGenerator";
import { useAnimatedModal } from "@/hooks/useAnimatedModal";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "user";
  datasetId: string;
  status: "active" | "suspended";
  propertyCount: number;
  transactionCount: number;
  createdAt: string;
}

interface DatasetOption {
  datasetId: string;
  name: string;
  description?: string;
}

interface SuperAdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentDatasetId: string;
  onSwitchDataset: (datasetId: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  isOpen,
  onClose,
  currentDatasetId,
  onSwitchDataset,
}) => {
  const { shouldRender, isClosing, handleClose } = useAnimatedModal(isOpen, onClose);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [datasets, setDatasets] = useState<DatasetOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Create User Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user">("user");
  const [newDatasetId, setNewDatasetId] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copied, setCopied] = useState(false);

  // Success Created Credential Card
  const [createdCredential, setCreatedCredential] = useState<{
    email: string;
    name: string;
    password: string;
    datasetId: string;
  } | null>(null);

  const loadAdminData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (res.ok && json.success) {
        setUsers(json.data.users || []);
        setDatasets(json.data.datasets || []);
      } else {
        setErrorMsg(json.error || "Failed to load admin controls");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to connect to admin API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAdminData();
    }
  }, [isOpen]);

  const handleOpenCreateModal = () => {
    setNewName("");
    setNewEmail("");
    setNewRole("user");
    setNewDatasetId("new");
    const pw = generateSecurePassword(15);
    setGeneratedPassword(pw);
    setCreatedCredential(null);
    setIsCreateModalOpen(true);
  };

  const handleRegeneratePassword = () => {
    const pw = generateSecurePassword(15);
    setGeneratedPassword(pw);
    setCopied(false);
  };

  const handleCopyPassword = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const targetDataset =
      newDatasetId === "new"
        ? `ds_${newEmail.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")}`
        : newDatasetId;

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          password: generatedPassword,
          role: newRole,
          datasetId: targetDataset,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create user");
      }

      setCreatedCredential({
        name: data.data.name,
        email: data.data.email,
        password: data.data.generatedPassword,
        datasetId: data.data.datasetId,
      });

      setIsCreateModalOpen(false);
      await loadAdminData();
    } catch (err: any) {
      setErrorMsg(err.message || "User creation failed");
    }
  };

  const handleResetPassword = async (user: AdminUser) => {
    if (
      !confirm(
        `Generate new 15-character secure password for ${user.name} (${user.email})?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          resetPassword: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedCredential({
          name: data.data.name,
          email: data.data.email,
          password: data.data.generatedPassword,
          datasetId: data.data.datasetId,
        });
      }
    } catch {
      alert("Password reset failed");
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (
      !confirm(
        `Are you sure you want to delete user ${user.name} (${user.email})?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?userId=${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await loadAdminData();
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch {
      alert("Delete request failed");
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto ${
        isClosing ? "animate-backdrop-exit" : "animate-backdrop"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto ${
          isClosing ? "animate-modal-exit" : "animate-modal"
        }`}
      >
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#262626] flex items-center justify-between bg-[#0e0e0e] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-bold text-white tracking-tight">
                  Super Admin &amp; Tenant Control Center
                </h2>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
                  DEVELOPER ACCESS ONLY
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] font-medium mt-0.5">
                Manage client accounts, dataset mappings, and 15-character secure credentials
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="btn-action-primary flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Provision User</span>
            </button>

            <button
              onClick={handleClose}
              className="p-2 rounded-md text-[#A1A1AA] hover:text-white hover:bg-[#1a1a1a] transition-all duration-150"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* Error Banner */}
          {errorMsg && (
            <div className="bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs sm:text-sm px-3.5 py-2.5 rounded-md flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Newly Created Credential Notification Card */}
          {createdCredential && (
            <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4 sm:p-5 flex flex-col gap-3.5 animate-modal">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <KeyRound className="w-4 h-4" />
                  <span>Secure User Credentials Generated Successfully</span>
                </div>
                <button
                  onClick={() => setCreatedCredential(null)}
                  className="text-xs text-[#A1A1AA] hover:text-white"
                >
                  Dismiss
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm font-mono bg-[#050505] p-3.5 rounded-lg border border-emerald-900/30">
                <div>
                  <span className="text-[#A1A1AA] text-xs block mb-0.5">Email</span>
                  <span className="text-white font-semibold">
                    {createdCredential.email}
                  </span>
                </div>
                <div>
                  <span className="text-[#A1A1AA] text-xs block mb-0.5">
                    15-Char Password (No Ambiguous Chars)
                  </span>
                  <span className="text-emerald-400 font-bold bg-[#111111] px-2.5 py-1 rounded border border-emerald-800/30 inline-block">
                    {createdCredential.password}
                  </span>
                </div>
                <div>
                  <span className="text-[#A1A1AA] text-xs block mb-0.5">
                    Mapped Dataset ID
                  </span>
                  <span className="text-white font-semibold">
                    {createdCredential.datasetId}
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() =>
                    handleCopyPassword(
                      `Email: ${createdCredential.email}\nPassword: ${createdCredential.password}\nLogin URL: https://avaniya.vercel.app`
                    )
                  }
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 text-black text-xs sm:text-sm font-bold hover:bg-emerald-400 active:scale-[0.98] transition-all duration-150"
                >
                  {copied ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copied ? "Copied to Clipboard!" : "Copy Full Client Onboarding Card"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-[#050505] border border-[#262626] rounded-xl p-3.5 hover:border-[#383838] transition-standard">
              <div className="text-xs uppercase text-[#A1A1AA] tracking-wider font-semibold">
                Total Users
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {users.length}
              </div>
            </div>
            <div className="bg-[#050505] border border-[#262626] rounded-xl p-3.5 hover:border-[#383838] transition-standard">
              <div className="text-xs uppercase text-[#A1A1AA] tracking-wider font-semibold">
                Active Datasets
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {new Set(users.map((u) => u.datasetId)).size}
              </div>
            </div>
            <div className="bg-[#050505] border border-[#262626] rounded-xl p-3.5 hover:border-[#383838] transition-standard">
              <div className="text-xs uppercase text-[#A1A1AA] tracking-wider font-semibold">
                Total Land Deals
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {users.reduce((sum, u) => sum + u.propertyCount, 0)}
              </div>
            </div>
            <div className="bg-[#050505] border border-[#262626] rounded-xl p-3.5 hover:border-[#383838] transition-standard">
              <div className="text-xs uppercase text-[#A1A1AA] tracking-wider font-semibold">
                Total Transactions
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {users.reduce((sum, u) => sum + u.transactionCount, 0)}
              </div>
            </div>
          </div>

          {/* User & Dataset Management Table */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#A1A1AA]" />
                <span>Tenant &amp; Dataset Access Matrix</span>
              </div>
              <button
                onClick={loadAdminData}
                className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white transition-all duration-150 font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="border border-[#262626] rounded-xl overflow-x-auto bg-[#050505]">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#111111] border-b border-[#262626] text-[#D4D4D8] uppercase text-xs font-bold tracking-wider">
                    <th className="py-3 px-3.5">User / Entity</th>
                    <th className="py-3 px-3.5">Email</th>
                    <th className="py-3 px-3.5">Role</th>
                    <th className="py-3 px-3.5">Mapped Dataset</th>
                    <th className="py-3 px-3.5 text-right">Properties</th>
                    <th className="py-3 px-3.5 text-right">Transactions</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181818]">
                  {users.map((u) => {
                    const isViewing =
                      currentDatasetId === u.datasetId ||
                      (currentDatasetId === "all" && u.role === "super_admin");

                    return (
                      <tr
                        key={u.id}
                        className={`hover:bg-[#0e0e0e] transition-colors ${
                          isViewing ? "bg-[#111612]" : ""
                        }`}
                      >
                        <td className="py-3 px-3.5 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span>{u.name}</span>
                            {isViewing && (
                              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/30 font-mono font-semibold">
                                ACTIVE VIEW
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 font-mono text-[#D4D4D8]">
                          {u.email}
                        </td>
                        <td className="py-3 px-3.5">
                          <span
                            className={`text-xs font-mono px-2.5 py-0.5 rounded font-semibold border ${
                              u.role === "super_admin"
                                ? "bg-amber-950/30 text-amber-400 border-amber-800/40"
                                : u.role === "admin"
                                ? "bg-blue-950/30 text-blue-400 border-blue-800/40"
                                : "bg-[#161616] text-[#A1A1AA] border-[#2a2a2a]"
                            }`}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-mono text-[#22C55E] font-semibold">
                          {u.datasetId || "Default"}
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono text-white font-bold">
                          {u.propertyCount}
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono text-white font-bold">
                          {u.transactionCount}
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                onSwitchDataset(u.datasetId);
                                handleClose();
                              }}
                              className="btn-action-primary px-2.5 py-1 rounded-md text-xs font-semibold"
                              title="Switch active dashboard to view this user's dataset"
                            >
                              View Ledger
                            </button>

                            <button
                              onClick={() => handleResetPassword(u)}
                              className="p-1.5 rounded-md bg-[#161616] border border-[#2a2a2a] text-[#A1A1AA] hover:text-amber-400 transition-all duration-150"
                              title="Generate new 15-char password"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            {u.role !== "super_admin" && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-md bg-[#161616] border border-[#2a2a2a] text-[#A1A1AA] hover:text-rose-400 transition-all duration-150"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create User Modal Sub-Dialog */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-backdrop">
            <div className="bg-[#0e0e0e] border border-[#2a2a2a] rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-modal">
              <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                <h3 className="text-base font-bold text-white">
                  Provision New User &amp; Assign Dataset
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-[#A1A1AA] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="flex flex-col gap-3.5 text-sm">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                    Full Name / Entity
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Mohammed Yousuf"
                    className="bg-[#141414] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#444444]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="yousuf@avaniya.com"
                    className="bg-[#141414] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#444444]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                      Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="bg-[#141414] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none"
                    >
                      <option value="user">User (Client)</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#D4D4D8] uppercase tracking-wider">
                      Dataset Scope
                    </label>
                    <select
                      value={newDatasetId}
                      onChange={(e) => setNewDatasetId(e.target.value)}
                      className="bg-[#141414] border border-[#262626] rounded-lg p-2.5 text-white text-sm outline-none"
                    >
                      <option value="new">Fresh Dedicated Dataset</option>
                      <option value="ds_yousuf_portfolio">Mohammed Yousuf Portfolio</option>
                      {datasets.map((d) => (
                        <option key={d.datasetId} value={d.datasetId}>
                          {d.name} ({d.datasetId})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Autogenerated 15-Char Password Field */}
                <div className="flex flex-col gap-1.5 bg-[#050505] p-3.5 rounded-lg border border-[#262626]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-emerald-400 font-semibold">
                      15-Char Secure Password (Strict standard)
                    </label>
                    <button
                      type="button"
                      onClick={handleRegeneratePassword}
                      className="text-xs text-[#A1A1AA] hover:text-white flex items-center gap-1 font-medium"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Re-roll</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={generatedPassword}
                      readOnly
                      className="w-full bg-[#111111] border border-[#383838] rounded-md px-3 py-2 text-emerald-400 font-mono font-bold text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyPassword(generatedPassword)}
                      className="p-2 rounded-md bg-[#222222] text-white hover:bg-[#333333] transition-all duration-150"
                      title="Copy password"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <span className="text-xs text-[#A1A1AA] mt-1 font-medium">
                    Guaranteed mix of uppercase, lowercase, numbers, &amp; symbols without ambiguous chars.
                  </span>
                </div>

                <div className="flex justify-end gap-2.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3.5 py-2 rounded-lg bg-[#161616] text-white text-xs sm:text-sm border border-[#2a2a2a] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-action-primary px-4 py-2 rounded-lg text-xs sm:text-sm"
                  >
                    Create &amp; Provision User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3.5 border-t border-[#262626] bg-[#0c0c0c] flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg bg-[#1a1a1a] text-white text-xs sm:text-sm font-semibold hover:bg-[#252525] border border-[#383838] transition-all duration-150"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
