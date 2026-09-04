import React from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Building2, 
  Menu, 
  Sparkles, 
  ShieldCheck, 
  User, 
  LogOut,
  Lock,
  Check
} from "lucide-react";

export default function Header({ setMobileOpen, activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "HR";
    const clean = name.replace(/[()[\]{}]/g, " ");
    const parts = clean.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      const first = parts[0].replace(/[^a-zA-Z0-9]/g, "")[0] || "";
      const second = parts[1].replace(/[^a-zA-Z0-9]/g, "")[0] || "";
      return (first + second).toUpperCase() || "HR";
    }
    const single = parts[0]?.replace(/[^a-zA-Z0-9]/g, "") || "HR";
    return single.slice(0, 2).toUpperCase() || "HR";
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <span className="bg-[#EBF0E6] text-[#6F8867] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#DCE5D5] uppercase tracking-wider">Super Admin</span>;
      case "HR":
        return <span className="bg-[#EBF0E6] text-[#6F8867] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#DCE5D5] uppercase tracking-wider">HR Manager</span>;
      case "EMPLOYEE":
        return <span className="bg-[#F4EFE3] text-[#6B6259] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#EFE8DE] uppercase tracking-wider">Employee</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#EFE8DE] px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left side: Mobile Toggle + Company Badge */}
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
        {/* Mobile Open Sidebar Button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center space-x-1.5 p-2 px-2.5 rounded-xl border border-[#EFE8DE] bg-[#FBF6F0] hover:bg-[#EBF0E6] text-[#3A342E] shadow-2xs active:scale-95 transition lg:hidden shrink-0"
          aria-label="Open sidebar"
          title="Open menu"
        >
          <Menu className="w-4 h-4 text-[#6B6259]" />
          <span className="text-xs font-semibold text-[#3A342E] hidden xs:inline">Menu</span>
        </button>

        {/* Company Organization Pill */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-[#EFE8DE] bg-[#FBF6F0] text-[#3A342E] min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[#8FA688] flex items-center justify-center text-white text-xs shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="text-xs font-serif font-bold text-[#3A342E] truncate max-w-[105px] xs:max-w-[150px] sm:max-w-none">
                {user?.company_name || (user?.role === "SUPER_ADMIN" ? "Platform Master" : "Company Workspace")}
              </span>
              {user?.company_id && (
                <span className="hidden sm:inline font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#EBF0E6] text-[#6F8867] font-semibold shrink-0">
                  {user.company_id}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Verified Isolation Pill */}
        <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EBF0E6] text-[#6F8867] text-[11px] font-medium border border-[#DCE5D5] shrink-0">
          <Check className="w-3.5 h-3.5 text-[#6F8867]" />
          <span>Tenant Isolated (Zero Leakage)</span>
        </div>
      </div>

      {/* Right side: Role Badge + User Info + Direct Sign Out */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="hidden sm:block">
          {getRoleBadge(user?.role)}
        </div>

        {/* User Card */}
        <div 
          onClick={() => setActiveTab && setActiveTab("profile")}
          className="cursor-pointer flex items-center space-x-2.5 p-1 sm:pr-3 rounded-xl hover:bg-[#F4EFE3] transition"
          title="View Profile Settings"
        >
          <div className="w-8 h-8 rounded-xl bg-[#8FA688] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
            {getInitials(user?.name)}
          </div>
          <div className="hidden lg:block text-left text-xs">
            <p className="font-bold text-[#3A342E] leading-tight">{user?.name}</p>
            <p className="text-[11px] text-[#6B6259] leading-tight font-mono">{user?.email}</p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-[#EFE8DE] bg-[#FFFFFF] hover:bg-[#FFF5F5] text-[#6B6259] hover:text-[#C53030] text-xs font-semibold transition"
          title="Sign out of this company"
        >
          <LogOut className="w-3.5 h-3.5 text-[#C53030]" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
