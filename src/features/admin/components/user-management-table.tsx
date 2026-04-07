"use client";

import { useMemo, useState } from "react";
import { Search, FileText, ShieldOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button, Pagination } from "@/global/components";
import { UserDocumentsViewer } from "@/features/documents";
import type { UserProfile, UserRole } from "@/global/stores/auth-store";
import { useAdminUsers, useUpdateUser } from "../hooks";

const roles: UserRole[] = ["admin", "donor", "volunteer", "student"];
const PAGE_SIZE = 10;

export function UserManagementTable() {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
  const [blockedFilter, setBlockedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);

  const filters = useMemo(() => {
    const f: { role?: string; verified?: boolean; blocked?: boolean } = {};
    if (roleFilter !== "all") f.role = roleFilter;
    if (verifiedFilter !== "all") f.verified = verifiedFilter === "verified";
    if (blockedFilter !== "all") f.blocked = blockedFilter === "blocked";
    return f;
  }, [roleFilter, verifiedFilter, blockedFilter]);

  const { data: users, isLoading } = useAdminUsers(filters);
  const updateUser = useUpdateUser();

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const query = searchQuery.toLowerCase();
    if (!query) return users;
    return users.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginated = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  function handleToggleBlock(user: UserProfile) {
    const next = !user.is_blocked;
    updateUser.mutate(
      { id: user.id, is_blocked: next },
      {
        onSuccess: () =>
          toast.success(
            next
              ? `${user.full_name} has been blocked`
              : `${user.full_name} has been unblocked`
          ),
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <h2 className="text-heading text-2xl font-light tracking-tight">
          All Users
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-body" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => resetPage(setSearchQuery)(e.target.value)}
              className="pl-9 pr-3 py-2 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none w-56"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => resetPage(setRoleFilter)(e.target.value)}
            className="px-3 py-2 rounded border border-border text-sm text-heading focus:border-primary focus:outline-none"
          >
            <option value="all">All Roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={verifiedFilter}
            onChange={(e) => resetPage(setVerifiedFilter)(e.target.value)}
            className="px-3 py-2 rounded border border-border text-sm text-heading focus:border-primary focus:outline-none"
          >
            <option value="all">All Verification</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
          <select
            value={blockedFilter}
            onChange={(e) => resetPage(setBlockedFilter)(e.target.value)}
            className="px-3 py-2 rounded border border-border text-sm text-heading focus:border-primary focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <p className="text-body text-sm">Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-body text-sm">No users found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg overflow-hidden shadow-elevated">
              <thead>
                <tr className="bg-brand-dark text-white text-left text-sm">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-4 py-3 text-sm text-heading">
                      {u.full_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-body">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          updateUser.mutate(
                            { id: u.id, role: e.target.value },
                            {
                              onSuccess: () =>
                                toast.success(
                                  `Role updated to ${e.target.value}`
                                ),
                              onError: (err) => toast.error(err.message),
                            }
                          )
                        }
                        disabled={updateUser.isPending}
                        className="px-2 py-1 text-xs rounded border border-border text-heading focus:border-primary focus:outline-none"
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-block w-fit px-2 py-0.5 text-xs rounded border ${
                            u.is_verified
                              ? "bg-success/20 text-success-text border-success/40"
                              : "bg-[#facc15]/10 text-[#9b6829] border-[#facc15]/30"
                          }`}
                        >
                          {u.is_verified ? "Verified" : "Unverified"}
                        </span>
                        {u.is_blocked && (
                          <span className="inline-block w-fit px-2 py-0.5 text-xs rounded border bg-ruby/10 text-ruby border-ruby/30">
                            Blocked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          className="text-xs px-3 py-1 flex items-center gap-1"
                          onClick={() => setViewingUser(u)}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Documents
                        </Button>
                        <Button
                          className={`text-xs px-3 py-1 flex items-center gap-1 ${
                            u.is_blocked
                              ? "!bg-emerald-600 hover:!bg-emerald-700"
                              : "!bg-ruby hover:!bg-ruby/90"
                          }`}
                          onClick={() => handleToggleBlock(u)}
                          disabled={updateUser.isPending}
                        >
                          {u.is_blocked ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Unblock
                            </>
                          ) : (
                            <>
                              <ShieldOff className="w-3.5 h-3.5" />
                              Block
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {viewingUser && (
        <UserDocumentsViewer
          userId={viewingUser.id}
          userName={viewingUser.full_name}
          onClose={() => setViewingUser(null)}
        />
      )}
    </div>
  );
}
