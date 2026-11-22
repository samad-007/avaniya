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
  LogOut,
} from "lucide-react";
import { generateSecurePassword } from "@/lib/passwordGenerator";

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
  user?: { name: string; email: string; role: string; datasetId?: string } | null;
  onLogout?: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  isOpen,
  onClose,
  currentDatasetId,
  onSwitchDataset,
  user,
  onLogout,
}) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [datasets, setDatasets] = useState<DatasetOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user">("user");
  const [newDatasetId, setNewDatasetId] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copied, setCopied] = useState(false);

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
    } catch (e: unknown) {
      setErrorMsg(
        e instanceof Error ? e.message : "Failed to connect to admin API"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAdminData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "User creation failed"
      );
    }
  };

  const handleResetPassword = async (u: AdminUser) => {
    if (
      !confirm(
        `Generate new 15-character secure password for ${u.name} (${u.email})?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: u.id,
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

  const handleDeleteUser = async (u: AdminUser) => {
    if (!confirm(`Are you sure you want to delete user ${u.name} (${u.email})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?userId=${u.id}`, {
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

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-backdrop"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-modal overflow-hidden my-auto animate-modal"
      >
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
                  Admin Console
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Admin Access
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage client accounts, portfolios, and secure login credentials
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleOpenCreateModal}
              className="btn-action-brand flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add User</span>
            </button>

            {user && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="font-semibold text-xs whitespace-nowrap">
                    {user.name}
                  </span>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-xl bg-white text-slate-500 border border-slate-200 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {createdCredential && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 animate-modal">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>New Login Credentials Ready</span>
                </div>
                <button
                  onClick={() => setCreatedCredential(null)}
                  className="text-xs text-slate-500 hover:text-slate-900"
                >
                  Dismiss
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm font-mono bg-white p-3.5 rounded-xl border border-emerald-200">
                <div>
                  <span className="text-slate-500 text-xs block mb-0.5">
                    Email
                  </span>
                  <span className="text-slate-900 font-semibold">
                    {createdCredential.email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block mb-0.5">
                    Password
                  </span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                    {createdCredential.password}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block mb-0.5">
                    Portfolio ID
                  </span>
                  <span className="text-slate-900 font-semibold">
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
                  className="btn-action-brand flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs"
                >
                  {copied ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copied ? "Copied!" : "Copy Login Details"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="text-xs text-slate-500 font-semibold">
                Total Users
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {users.length}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="text-xs text-slate-500 font-semibold">
                Active Portfolios
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                {new Set(users.map((u) => u.datasetId)).size}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="text-xs text-slate-500 font-semibold">
                Total Properties
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {users.reduce((sum, u) => sum + u.propertyCount, 0)}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="text-xs text-slate-500 font-semibold">
                Total Entries
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {users.reduce((sum, u) => sum + u.transactionCount, 0)}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span>Users &amp; Portfolios</span>
              </div>
              <button
                onClick={loadAdminData}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-x-auto bg-white">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Portfolio</th>
                    <th className="py-3 px-4 text-right">Properties</th>
                    <th className="py-3 px-4 text-right">Entries</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isViewing =
                      currentDatasetId === u.datasetId ||
                      (currentDatasetId === "all" && u.role === "super_admin");

                    return (
                      <tr
                        key={u.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isViewing ? "bg-emerald-50/40" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{u.name}</span>
                            {isViewing && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                                Viewing
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-600">
                          {u.email}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                              u.role === "super_admin"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : u.role === "admin"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-emerald-700 font-semibold">
                          {u.datasetId || "Default"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-900 font-bold">
                          {u.propertyCount}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-900 font-bold">
                          {u.transactionCount}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                onSwitchDataset(u.datasetId);
                                onClose();
                              }}
                              className="btn-action-secondary px-2.5 py-1 rounded-lg text-xs"
                            >
                              Open
                            </button>

                            <button
                              onClick={() => handleResetPassword(u)}
                              className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                              title="Reset password"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {u.role !== "super_admin" && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

        {/* Create User Sub-Dialog */}
        {isCreateModalOpen && (
          <div
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setIsCreateModalOpen(false);
              }
            }}
            className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-backdrop"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-modal flex flex-col gap-4 animate-modal"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Add New User
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="flex flex-col gap-3.5 text-sm">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Mohammed Yousuf"
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-sm outline-none focus:bg-white focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) =>
                        setNewRole(e.target.value as "admin" | "user")
                      }
                      className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-sm outline-none"
                    >
                      <option value="user">User (Client)</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Portfolio
                    </label>
                    <select
                      value={newDatasetId}
                      onChange={(e) => setNewDatasetId(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-sm outline-none"
                    >
                      <option value="new">New Dedicated Portfolio</option>
                      <option value="ds_yousuf_portfolio">
                        Mohammed Yousuf Portfolio
                      </option>
                      {datasets.map((d) => (
                        <option key={d.datasetId} value={d.datasetId}>
                          {d.name} ({d.datasetId})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-emerald-800">
                      Generated Password
                    </label>
                    <button
                      type="button"
                      onClick={handleRegeneratePassword}
                      className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={generatedPassword}
                      readOnly
                      className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-emerald-800 font-mono font-bold text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyPassword(generatedPassword)}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                      title="Copy password"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="btn-action-secondary px-4 py-2 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-action-brand px-4 py-2 rounded-xl text-xs"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="btn-action-primary px-4 py-2 rounded-xl text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
