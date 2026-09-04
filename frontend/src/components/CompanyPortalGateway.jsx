import React, { useState } from "react";
import { 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Lock, 
  Search, 
  PlusCircle, 
  ExternalLink,
  KeyRound,
  Shield,
  Layers,
  ChevronRight
} from "lucide-react";

export const COMPANIES_METADATA = [
  {
    id: "comp_apex",
    name: "Apex Corp",
    slug: "apex",
    industry: "Financial Services & Investment Banking",
    domain: "apex.enterprise-hr.internal",
    location: "New York, USA",
    employeeCount: "350+ Employees",
    themeColor: "#818CF8", // Pastel Indigo / Lavender
    accentBg: "from-indigo-50/80 via-purple-50/50 to-white",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    heroTagline: "Institutional Investment & Global Wealth Management",
    tagline: "Secure Corporate HR & Knowledge Portal",
    securityLevel: "SOC2 Type II • ISO 27001",
    inviteCode: "APEX-2026",
    hrEmail: "hr.a@demo.com",
    empEmail: "employee.a@demo.com",
    hrName: "Priya Sharma (HR Lead)",
    empName: "Rahul Verma (Financial Analyst)",
  },
  {
    id: "comp_nexus",
    name: "Nexus Tech",
    slug: "nexus",
    industry: "Enterprise AI & Cloud Infrastructure",
    domain: "nexus.enterprise-hr.internal",
    location: "San Francisco, USA",
    employeeCount: "180+ Employees",
    themeColor: "#38BDF8", // Pastel Sky Blue
    accentBg: "from-sky-50/80 via-cyan-50/50 to-white",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200/80",
    heroTagline: "Next-Generation Autonomous Cloud & AI Architecture",
    tagline: "Remote-First Team Knowledge & Policy Hub",
    securityLevel: "HIPAA Compliant • Zero Trust",
    inviteCode: "NEXUS-2026",
    hrEmail: "hr.b@demo.com",
    empEmail: "employee.b@demo.com",
    hrName: "Nandhana Menon (VP People)",
    empName: "Meera Tiwari (Senior Engineer)",
  },
  {
    id: "comp_global",
    name: "Global Logistics",
    slug: "global",
    industry: "Supply Chain, Freight & Maritime Shipping",
    domain: "global.enterprise-hr.internal",
    location: "Chicago, USA",
    employeeCount: "750+ Employees",
    themeColor: "#FBBF24", // Pastel Amber / Honey
    accentBg: "from-amber-50/80 via-orange-50/50 to-white",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200/80",
    heroTagline: "Multi-Modal Freight & Global Cold Chain Distribution",
    tagline: "Workforce Operations & Benefits Portal",
    securityLevel: "C-TPAT Certified • Enterprise Auth",
    inviteCode: "GLOBAL-2026",
    hrEmail: "hr.c@demo.com",
    empEmail: "employee.c@demo.com",
    hrName: "Ananya Iyer (HR Director)",
    empName: "Rohan Gupta (Operations Lead)",
  }
];

export default function CompanyPortalGateway({ onSelectCompany, onSelectAdmin, onSelectNewTenant }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = COMPANIES_METADATA.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.inviteCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8FF] via-[#F5F3FF] to-[#EFF6FF] text-slate-800 flex flex-col justify-between selection:bg-purple-200 selection:text-purple-900 relative overflow-hidden">
      {/* Background ambient pastel glowing orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[500px] bg-purple-300/25 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-10 w-[550px] h-[450px] bg-sky-200/35 rounded-full blur-[130px]" />
        <div className="absolute -bottom-20 left-10 w-[500px] h-[400px] bg-rose-200/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-amber-100/40 rounded-full blur-[100px]" />
      </div>

      {/* Top Enterprise Bar */}
      <header className="relative z-10 border-b border-purple-100/80 bg-white/70 backdrop-blur-md px-6 lg:px-12 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center text-white shadow-md shadow-purple-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-slate-800 tracking-tight">Enterprise HR Platform</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100/80 text-purple-700 border border-purple-200">
                Multi-Tenant v2.4
              </span>
            </div>
            <p className="text-xs text-slate-500">Identity & Workspace Gateway</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onSelectAdmin}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-purple-200 bg-white/80 hover:bg-purple-50 text-purple-700 text-xs font-semibold shadow-xs transition"
          >
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>Super Admin Console</span>
          </button>
          <button
            onClick={onSelectNewTenant}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-xs font-semibold shadow-md shadow-purple-200 transition hover:scale-102 active:scale-98"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Onboard New Tenant</span>
          </button>
        </div>
      </header>

      {/* Main Gateway Body */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-purple-100 text-slate-600 text-xs font-medium shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Strict Company Isolation • Zero Cross-Tenant Leakage</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Select Your Organization Portal
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Each company operates in its own dedicated, cryptographically isolated knowledge base. Choose your workspace to access your company's documents and AI assistant.
          </p>

          {/* Search / Filter Input */}
          <div className="pt-2 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name, domain or invite code..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-purple-200/70 bg-white/90 text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Company Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCompanies.map((comp) => (
            <div
              key={comp.id}
              onClick={() => onSelectCompany(comp)}
              className="group cursor-pointer rounded-3xl border border-white/80 bg-white/85 hover:bg-white p-6 flex flex-col justify-between transition-all duration-300 card-shadow hover:card-shadow-hover hover:-translate-y-1.5 relative overflow-hidden backdrop-blur-md"
            >
              {/* Subtle top pastel color bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-2 opacity-80 group-hover:opacity-100 transition"
                style={{ backgroundColor: comp.themeColor }}
              />

              <div className="space-y-4 pt-1">
                {/* Header with Icon and Tenant ID */}
                <div className="flex items-start justify-between">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shadow-purple-100 transition group-hover:scale-105"
                    style={{ backgroundColor: comp.themeColor }}
                  >
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                    {comp.id}
                  </span>
                </div>

                {/* Name & Industry */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-700 transition">
                    {comp.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {comp.industry}
                  </p>
                </div>

                {/* Info tags */}
                <div className="space-y-2 pt-3 border-t border-purple-50 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Domain:</span>
                    <span className="font-mono text-slate-700 text-[11px]">{comp.domain}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Workspace Code:</span>
                    <span className="font-mono font-bold text-emerald-700 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {comp.inviteCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Security:</span>
                    <span className="text-slate-700 text-[11px]">{comp.securityLevel}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-purple-50 flex items-center justify-between text-xs font-semibold text-purple-600 group-hover:text-purple-800">
                <span>Enter Company Portal</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner: Notice on Data Privacy */}
        <div className="mt-10 p-4 rounded-2xl border border-purple-100 bg-white/70 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 card-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <span>
              <strong>Cross-Tenant Protection:</strong> Logging into Company A prevents any visibility or querying of Company B. To access another company, you must sign out first.
            </span>
          </div>
          <div className="flex items-center space-x-4 shrink-0 text-[11px] text-slate-400">
            <span>Qdrant Vector Isolation</span>
            <span>•</span>
            <span>FastAPI JWT Auth</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-100/60 py-4 px-6 text-center text-xs text-slate-400 bg-white/40">
        Enterprise Multi-Tenant AI Platform • Powered by Qdrant Vector Search & Deep Tenant Isolation
      </footer>
    </div>
  );
}
