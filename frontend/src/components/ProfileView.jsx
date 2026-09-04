import React from "react";
import { useAuth } from "../context/AuthContext";
import { 
  User, 
  Mail, 
  Building2, 
  Shield, 
  KeyRound, 
  LogOut, 
  CheckCircle2,
  Check
} from "lucide-react";

export default function ProfileView() {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return "HR";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin (Platform Master)";
      case "HR":
        return "HR Manager";
      case "EMPLOYEE":
        return "Employee";
      default:
        return role;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A342E] tracking-tight">
          User Profile
        </h1>
        <p className="text-sm text-[#6B6259]">
          Personal account details, assigned roles, and authentication status.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-[#EFE8DE] card-shadow p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EFE8DE] gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-[#8FA688] flex items-center justify-center text-white text-lg font-bold shadow-xs">
              {getInitials(user?.name)}
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#3A342E]">{user?.name}</h2>
              <p className="text-xs text-[#6F8867] mt-0.5 font-semibold">{getRoleLabel(user?.role)}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-[#FFF5F5] hover:bg-[#FED7D7] text-[#C53030] border border-[#FEB2B2] text-xs font-semibold flex items-center space-x-2 transition self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Info Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1.5 p-4 rounded-2xl bg-[#FBF6F0] border border-[#EFE8DE]">
            <div className="flex items-center space-x-2 text-[#A8A095] font-semibold uppercase tracking-wider text-[10px]">
              <Mail className="w-3.5 h-3.5" />
              <span>Email Address</span>
            </div>
            <p className="text-sm font-semibold text-[#3A342E] font-mono">{user?.email}</p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-[#FBF6F0] border border-[#EFE8DE]">
            <div className="flex items-center space-x-2 text-[#A8A095] font-semibold uppercase tracking-wider text-[10px]">
              <Building2 className="w-3.5 h-3.5" />
              <span>Assigned Tenant</span>
            </div>
            <p className="text-sm font-semibold text-[#3A342E]">{user?.company_name || "Platform Master"}</p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-[#FBF6F0] border border-[#EFE8DE]">
            <div className="flex items-center space-x-2 text-[#A8A095] font-semibold uppercase tracking-wider text-[10px]">
              <Shield className="w-3.5 h-3.5" />
              <span>Role Permissions</span>
            </div>
            <p className="text-sm font-semibold text-[#6F8867]">
              {user?.role === "EMPLOYEE" ? "Chat and Query Policies" : "Full Document Upload, Deletion & Management"}
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-[#FBF6F0] border border-[#EFE8DE]">
            <div className="flex items-center space-x-2 text-[#A8A095] font-semibold uppercase tracking-wider text-[10px]">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Authentication Method</span>
            </div>
            <p className="text-sm font-semibold text-[#6F8867] flex items-center space-x-1.5">
              <Check className="w-4 h-4 text-[#6F8867]" />
              <span>Signed JWT Session Token</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
