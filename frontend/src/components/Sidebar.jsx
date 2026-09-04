import React from "react";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Sparkles, 
  FileText, 
  Upload, 
  Building2, 
  User, 
  Users, 
  ShieldCheck,
  LogOut,
  X
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen, onOpenUploadModal }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "HR";
    const clean = name.replace(/[()[\]{}]/g, " ");
    const parts = clean.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
      const first = parts[0].replace(/[^a-zA-Z0-9]/g, "")[0] || "";
      const last = parts[parts.length - 1].replace(/[^a-zA-Z0-9]/g, "")[0] || "";
      return (first + last).toUpperCase() || "HR";
    }
    const single = parts[0]?.replace(/[^a-zA-Z0-9]/g, "") || "HR";
    return single.slice(0, 2).toUpperCase() || "HR";
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "HR":
        return "HR Manager";
      case "EMPLOYEE":
        return "Employee";
      default:
        return role;
    }
  };

  const navItemClass = (tabKey) => {
    const isActive = activeTab === tabKey;
    return `w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
      isActive
        ? "bg-[#8FA688] text-white font-semibold shadow-xs"
        : "text-[#6B6259] hover:text-[#3A342E] hover:bg-[#F4EFE3]"
    }`;
  };

  const handleNavClick = (tabKey) => {
    if (tabKey === "upload") {
      if (onOpenUploadModal) {
        onOpenUploadModal();
      } else {
        setActiveTab("documents");
      }
    } else {
      setActiveTab(tabKey);
    }
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-[#3A342E]/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container: Sage & Sand Paper Theme */}
      <aside 
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-[260px] bg-[#FBF6F0] border-r border-[#EFE8DE] flex flex-col justify-between transition-transform duration-300 ease-in-out select-none shadow-2xl lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Header & Brand */}
        <div className="p-5">
          <div className="flex items-center justify-between pb-5 border-b border-[#EFE8DE]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-[#8FA688] flex items-center justify-center text-white shadow-xs">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-serif font-bold text-[#3A342E] leading-tight">HR Multi</h1>
                <p className="text-[10px] uppercase tracking-wider text-[#6B6259] font-semibold mt-0.5">Workspace</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-[#EFE8DE] bg-white hover:bg-[#F4EFE3] text-[#3A342E] text-xs font-semibold shadow-2xs active:scale-95 transition lg:hidden"
              aria-label="Close sidebar"
              title="Close sidebar"
            >
              <X className="w-3.5 h-3.5 text-[#6B6259]" />
              <span className="text-[11px]">Close</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-6">
            {/* MAIN SECTION */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#A8A095] mb-2">
                Main
              </p>
              
              <button
                onClick={() => handleNavClick("overview")}
                className={navItemClass("overview")}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => handleNavClick("chat")}
                className={navItemClass("chat")}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>AI Assistant</span>
              </button>
            </div>

            {/* DOCUMENTS SECTION */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#A8A095] mb-2">
                Documents
              </p>

              <button
                onClick={() => handleNavClick("documents")}
                className={navItemClass("documents")}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>{user.role === "EMPLOYEE" ? "Company Policies" : "My Documents"}</span>
              </button>

              {user.role !== "EMPLOYEE" && (
                <button
                  onClick={() => handleNavClick("upload")}
                  className={navItemClass("upload")}
                >
                  <Upload className="w-4 h-4 shrink-0" />
                  <span>Upload Document</span>
                </button>
              )}
            </div>

            {/* PLATFORM SECTION (Super Admin Only) */}
            {user.role === "SUPER_ADMIN" && (
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#A8A095] mb-2">
                  Platform
                </p>

                <button
                  onClick={() => handleNavClick("tenants")}
                  className={navItemClass("tenants")}
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>Tenants</span>
                </button>

                <button
                  onClick={() => handleNavClick("users")}
                  className={navItemClass("users")}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span>User Directory</span>
                </button>
              </div>
            )}

            {/* SETTINGS SECTION */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#A8A095] mb-2">
                Settings
              </p>

              <button
                onClick={() => handleNavClick("company")}
                className={navItemClass("company")}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Company Info</span>
              </button>

              <button
                onClick={() => handleNavClick("profile")}
                className={navItemClass("profile")}
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Profile</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom User Card */}
        <div className="p-4 border-t border-[#EFE8DE] bg-[#F4EFE3]/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#8FA688] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#3A342E] truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[11px] text-[#6B6259] truncate leading-tight mt-0.5 font-medium">
                  {user.company_name || getRoleLabel(user.role)}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-[#6B6259] hover:text-[#C53030] hover:bg-[#EFE8DE] rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
