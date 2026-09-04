import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Building2, 
  ShieldCheck, 
  UserCircle2, 
  LogOut, 
  ChevronDown, 
  UserCheck, 
  Sparkles,
  Layers,
  Lock
} from "lucide-react";

const DEMO_PERSONAS = [
  { label: "Company A (Apex Corp) - HR Lead", email: "hr.a@demo.com", role: "HR", company: "Apex Corp" },
  { label: "Company A (Apex Corp) - Employee", email: "employee.a@demo.com", role: "EMPLOYEE", company: "Apex Corp" },
  { label: "Company B (Nexus Tech) - HR Lead", email: "hr.b@demo.com", role: "HR", company: "Nexus Tech" },
  { label: "Company B (Nexus Tech) - Employee", email: "employee.b@demo.com", role: "EMPLOYEE", company: "Nexus Tech" },
  { label: "Company C (Global Log.) - HR Lead", email: "hr.c@demo.com", role: "HR", company: "Global Logistics" },
  { label: "Company C (Global Log.) - Employee", email: "employee.c@demo.com", role: "EMPLOYEE", company: "Global Logistics" },
  { label: "Platform Super Admin", email: "admin@platform.com", role: "SUPER_ADMIN", company: "All Tenants" }
];

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout, login } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleQuickSwitch = async (email) => {
    setDropdownOpen(false);
    await login(email, "Demo1234!");
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <span className="bg-purple-900/60 text-purple-300 border border-purple-700/50 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide">SUPER ADMIN</span>;
      case "HR":
        return <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide">HR MANAGER</span>;
      case "EMPLOYEE":
        return <span className="bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide">EMPLOYEE</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                  HR Multi
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono uppercase bg-blue-950 text-blue-400 border border-blue-800/80 px-2 py-0.5 rounded">
                  <Lock className="w-3 h-3" /> Qdrant Isolated
                </span>
              </div>
              <p className="text-xs text-slate-400">Multi-Company Policy AI Platform</p>
            </div>
          </div>

          {/* User Info & Switcher */}
          {user && (
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Tenant Badge */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/60">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Tenant</p>
                  <p className="text-xs font-medium text-slate-200">
                    {user.company_name || (user.role === "SUPER_ADMIN" ? "Platform Master" : "Unknown")}
                  </p>
                </div>
              </div>

              {/* User Profile Pill */}
              <div className="flex items-center space-x-2 bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-700/60">
                <UserCircle2 className="w-5 h-5 text-slate-300" />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-slate-200 leading-tight">{user.name}</p>
                  <div className="mt-0.5">{getRoleBadge(user.role)}</div>
                </div>
              </div>

              {/* Quick Persona Switcher */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-1.5 text-xs bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/60 px-3 py-2 rounded-lg transition shadow-sm"
                  title="Switch Demo Persona"
                >
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline font-medium">Switch Persona</span>
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Demo Persona Quick Switch
                    </div>
                    {DEMO_PERSONAS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickSwitch(p.email)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                          user.email === p.email ? "bg-slate-800/80 font-semibold text-cyan-300" : "text-slate-300"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-slate-200">{p.label}</p>
                          <p className="text-[10px] text-slate-400">{p.email}</p>
                        </div>
                        {getRoleBadge(p.role)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
