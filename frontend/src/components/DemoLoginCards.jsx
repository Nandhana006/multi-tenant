import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Sparkles, 
  Check, 
  Lock, 
  Shield, 
  Building2, 
  AlertCircle, 
  UserPlus, 
  LogIn, 
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { COMPANIES_METADATA } from "./CompanyPortalGateway";

export default function DemoLoginCards({ 
  selectedCompany, 
  onBackToGateway, 
  isSuperAdminMode = false,
  isNewTenantMode = false 
}) {
  const { login, register, registerCompany, error, setError } = useAuth();
  
  // Auth Modes: "signin" | "register_user" | "register_company"
  const [authMode, setAuthMode] = useState(isNewTenantMode ? "register_company" : "signin");
  
  // Sign In State
  const defaultEmail = isSuperAdminMode 
    ? "admin@platform.com" 
    : (selectedCompany?.hrEmail || "hr.a@demo.com");

  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("Demo1234!");
  const [loading, setLoading] = useState(false);

  // Individual Employee Registration for this Company
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("Demo1234!");
  const [regInviteCode, setRegInviteCode] = useState(selectedCompany?.inviteCode || "");
  const [regRole, setRegRole] = useState("EMPLOYEE");

  // New Company Tenant Registration State
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyIndustry, setNewCompanyIndustry] = useState("Enterprise Technology");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("Demo1234!");

  useEffect(() => {
    if (selectedCompany) {
      setEmail(selectedCompany.hrEmail);
      setRegInviteCode(selectedCompany.inviteCode);
      if (isNewTenantMode) {
        setAuthMode("register_company");
      } else {
        setAuthMode("signin");
      }
    } else if (isSuperAdminMode) {
      setEmail("admin@platform.com");
      setAuthMode("signin");
    } else if (isNewTenantMode) {
      setAuthMode("register_company");
    }
  }, [selectedCompany, isSuperAdminMode, isNewTenantMode]);

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  const handleQuickDemoClick = async (demoEmail, demoPassword = "Demo1234!") => {
    setEmail(demoEmail);
    setLoading(true);
    await login(demoEmail, demoPassword);
    setLoading(false);
  };

  const handleUserRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regEmail || !regName || !regPassword) {
      setError("Please fill out all required fields.");
      return;
    }
    
    // Validate invite code match
    if (selectedCompany && regInviteCode.trim().toUpperCase() !== selectedCompany.inviteCode.toUpperCase()) {
      setError(`Invalid Invite Code for ${selectedCompany.name}. Code must be ${selectedCompany.inviteCode}.`);
      return;
    }

    setLoading(true);
    await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      company_id: selectedCompany?.id || "comp_apex",
      role: regRole
    });
    setLoading(false);
  };

  const handleCompanyRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!newCompanyName || !newAdminEmail || !newAdminName || !newAdminPassword) {
      setError("Please fill out all required fields to onboard this tenant.");
      return;
    }
    setLoading(true);
    await registerCompany({
      company_name: newCompanyName,
      industry: newCompanyIndustry,
      admin_name: newAdminName,
      admin_email: newAdminEmail,
      admin_password: newAdminPassword
    });
    setLoading(false);
  };

  // Resolve branding configuration
  const companyName = isSuperAdminMode 
    ? "Platform Governance" 
    : (selectedCompany?.name || "Enterprise Portal");

  const companyDomain = isSuperAdminMode 
    ? "admin.enterprise-hr.internal" 
    : (selectedCompany?.domain || "portal.enterprise-hr.internal");

  const companyTagline = isSuperAdminMode 
    ? "Master Administrator & Cross-Tenant Oversight" 
    : (selectedCompany?.heroTagline || "Secure Enterprise HR & Knowledge Workspace");

  const themeColor = isSuperAdminMode 
    ? "#A855F7" 
    : (selectedCompany?.themeColor || "#818CF8");

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF8FF]">
      {/* LEFT SIDE: Tailored Pastel Hero */}
      <div className="lg:w-[46%] xl:w-[44%] bg-gradient-to-br from-[#2D2A4A] via-[#24213B] to-[#1D1B2E] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Soft Pastel Ambient glow */}
        <div 
          className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-35"
          style={{ backgroundColor: themeColor }}
        />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Back to Gateway Button & Logo */}
        <div className="relative z-10 space-y-6">
          <button
            type="button"
            onClick={onBackToGateway}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-purple-200 hover:text-white px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition backdrop-blur-xs shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch Company / Return to Gateway</span>
          </button>

          <div className="flex items-center space-x-3.5 pt-2">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-900/40"
              style={{ backgroundColor: themeColor }}
            >
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white tracking-tight">{companyName}</h1>
                {selectedCompany && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-purple-200 border border-white/15">
                    {selectedCompany.id}
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-300/80 font-mono mt-0.5">{companyDomain}</p>
            </div>
          </div>
        </div>

        {/* Main Value Statement */}
        <div className="relative z-10 my-auto py-10 lg:py-0 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Dedicated Pastel Tenant Partition</span>
            </div>
            <h2 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {companyTagline}
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-md leading-relaxed">
              {isSuperAdminMode 
                ? "Platform Master Console for monitoring tenant health, Qdrant vectors, and compliance across all registered organizations."
                : `All personnel data, policy documents, and vector embeddings for ${companyName} are isolated within this partition.`
              }
            </p>
          </div>

          {/* 3 Security Bullets */}
          <div className="space-y-2.5 pt-2 text-xs text-purple-100/90">
            <div className="flex items-center space-x-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
              <span>Exclusive Access: Only verified {companyName} staff</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
              <span>Qdrant Vector Isolation: Zero cross-tenant leakage</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
              <span>Enterprise Encrypted JWT Authentication</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-purple-300/60 border-t border-white/10 pt-4 flex items-center justify-between">
          <span>{selectedCompany?.securityLevel || "Enterprise Grade Security"}</span>
          <span className="font-mono">Port: 8000 / 5173</span>
        </div>
      </div>

      {/* RIGHT SIDE: Dedicated Sign-In & Join Forms */}
      <div className="lg:w-[54%] xl:w-[56%] bg-[#FAF8FF] flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          
          {/* Mode Switcher */}
          {!isSuperAdminMode && !isNewTenantMode && (
            <div className="flex bg-purple-50/80 p-1 rounded-2xl border border-purple-100">
              <button
                type="button"
                onClick={() => { setAuthMode("signin"); setError(null); }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition ${
                  authMode === "signin"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Sign In to {companyName}
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("register_user"); setError(null); }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition ${
                  authMode === "register_user"
                    ? "bg-white text-purple-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Join with Invite Code
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs flex items-center justify-between animate-in fade-in shadow-xs">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-rose-500 font-bold ml-2">✕</button>
            </div>
          )}

          {/* 1. SIGN IN TAB */}
          {authMode === "signin" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="text-left space-y-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {isSuperAdminMode ? "Super Admin Access" : `Welcome to ${companyName}`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {isSuperAdminMode 
                    ? "Enter master administrator credentials to access platform controls."
                    : `Authenticate to enter your company's secure HR and AI assistant workspace.`
                  }
                </p>
              </div>

              {/* Role Picker for Company Sign-In */}
              {selectedCompany && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Select Your Role:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEmail(selectedCompany.hrEmail)}
                      className={`p-3.5 rounded-2xl border text-left transition ${
                        email === selectedCompany.hrEmail
                          ? "border-purple-300 bg-white ring-2 ring-purple-300/40 card-shadow"
                          : "border-purple-100 hover:border-purple-200 bg-white/70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">HR Manager</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Upload & Manage
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 truncate font-mono">
                        {selectedCompany.hrEmail}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEmail(selectedCompany.empEmail)}
                      className={`p-3.5 rounded-2xl border text-left transition ${
                        email === selectedCompany.empEmail
                          ? "border-purple-300 bg-white ring-2 ring-purple-300/40 card-shadow"
                          : "border-purple-100 hover:border-purple-200 bg-white/70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Employee</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                          Read-Only & AI
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 truncate font-mono">
                        {selectedCompany.empEmail}
                      </p>
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Authorized Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-4 py-3 rounded-2xl border border-purple-200/80 bg-white text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition shadow-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <span className="text-xs text-slate-400">Default: Demo1234!</span>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-2xl border border-purple-200/80 bg-white text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-white font-semibold text-xs sm:text-sm transition shadow-md shadow-purple-200 hover:shadow-lg active:scale-[0.99] disabled:opacity-50 flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? "Authenticating..." : `Sign In to ${companyName}`}</span>
                </button>
              </form>

              {/* Company-Specific Quick Test Accounts */}
              {selectedCompany && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-900">
                      Authorized {selectedCompany.name} Accounts:
                    </p>
                    <span className="text-[10px] text-slate-400">Click to autofill & login</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* HR Card */}
                    <button
                      type="button"
                      onClick={() => handleQuickDemoClick(selectedCompany.hrEmail)}
                      className="text-left p-3.5 rounded-2xl border border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 transition bg-white card-shadow group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 group-hover:text-purple-700">
                          {selectedCompany.hrName.split(" ")[0]} (HR)
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          HR Lead
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">
                        {selectedCompany.hrEmail}
                      </p>
                    </button>

                    {/* Employee Card */}
                    <button
                      type="button"
                      onClick={() => handleQuickDemoClick(selectedCompany.empEmail)}
                      className="text-left p-3.5 rounded-2xl border border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 transition bg-white card-shadow group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 group-hover:text-purple-700">
                          {selectedCompany.empName.split(" ")[0]} (Staff)
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                          Employee
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">
                        {selectedCompany.empEmail}
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Super Admin Quick Link */}
              {isSuperAdminMode && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoClick("admin@platform.com")}
                    className="w-full p-4 rounded-2xl border border-purple-200 bg-purple-50/60 hover:bg-purple-50 text-left transition card-shadow"
                  >
                    <p className="text-xs font-bold text-purple-900">Arjun Mehta (Platform Admin)</p>
                    <p className="text-[11px] text-purple-700 font-mono mt-0.5">admin@platform.com</p>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. REGISTER EMPLOYEE FOR THIS COMPANY */}
          {authMode === "register_user" && selectedCompany && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-left space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Join {selectedCompany.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Register your account under {selectedCompany.name}'s secure tenant partition.
                </p>
              </div>

              {/* Company Invite Code Info Badge */}
              <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl text-xs text-purple-900 flex items-center justify-between card-shadow">
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Required Company Invite Code:</span>
                </div>
                <span className="font-mono font-bold bg-white px-2.5 py-0.5 rounded-full text-purple-700 border border-purple-200">
                  {selectedCompany.inviteCode}
                </span>
              </div>

              <form onSubmit={handleUserRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Vikram Seth"
                    className="w-full px-4 py-2.5 rounded-2xl border border-purple-200/80 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={`name@${selectedCompany.slug}.com`}
                    className="w-full px-4 py-2.5 rounded-2xl border border-purple-200/80 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Invite Code
                  </label>
                  <input
                    type="text"
                    required
                    value={regInviteCode}
                    onChange={(e) => setRegInviteCode(e.target.value)}
                    placeholder={selectedCompany.inviteCode}
                    className="w-full px-4 py-2.5 rounded-2xl border border-purple-200/80 bg-white text-slate-900 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Designated Role
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-purple-200/80 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="EMPLOYEE">Employee (Chat Only)</option>
                      <option value="HR">HR Manager (Manage Docs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-2xl border border-purple-200/80 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl text-white font-semibold text-xs sm:text-sm transition shadow-md shadow-purple-200 mt-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  {loading ? "Creating Account..." : `Join ${selectedCompany.name} Workspace`}
                </button>
              </form>
            </div>
          )}

          {/* 3. REGISTER BRAND NEW COMPANY TENANT */}
          {authMode === "register_company" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-left space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Onboard New Organization
                </h2>
                <p className="text-xs text-slate-500">
                  Provision a new tenant partition in database and Qdrant vector space.
                </p>
              </div>

              <form onSubmit={handleCompanyRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="e.g. Horizon Biotech Inc."
                    className="w-full px-4 py-2.5 rounded-2xl border border-purple-200/80 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Industry / Sector
                  </label>
                  <input
                    type="text"
                    value={newCompanyIndustry}
                    onChange={(e) => setNewCompanyIndustry(e.target.value)}
                    placeholder="e.g. Healthcare, Finance, AI"
                    className="w-full px-4 py-2.5 rounded-2xl border border-purple-200/80 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial HR Administrator Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="e.g. Aditi Rao"
                    className="w-full px-4 py-2.5 rounded-2xl border border-purple-200/80 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="hr@horizon.com"
                      className="w-full px-4 py-2.5 rounded-2xl border border-purple-200/80 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-2xl border border-purple-200/80 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl text-white font-semibold text-xs sm:text-sm transition shadow-md shadow-purple-200 mt-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  {loading ? "Provisioning Tenant..." : "Register Company & Launch Workspace"}
                </button>
              </form>
            </div>
          )}

          {/* Security footnote */}
          <div className="pt-4 text-center border-t border-purple-100 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Strict Company Isolation • Cross-Tenant Access Blocked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
