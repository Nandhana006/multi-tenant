import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  User,
  Mail,
  Shield,
  FileText,
  Zap,
  Check,
  Sparkles,
  ShieldAlert
} from "lucide-react";

export default function LandingAuthPage() {
  const { login, register, registerCompany, error, setError } = useAuth();
  
  // Auth Tab: "login_employee" | "login_hr" | "register_company" | "register_employee"
  const [authTab, setAuthTab] = useState("login_employee");
  const [loading, setLoading] = useState(false);

  // 1. Sign In States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // 2. Register New Company (HR / Admin)
  const [companyName, setCompanyName] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [hrName, setHrName] = useState("");
  const [hrEmail, setHrEmail] = useState("");
  const [hrPassword, setHrPassword] = useState("");

  // 3. Register as Employee for Existing Company
  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const [empInviteCode, setEmpInviteCode] = useState("");

  // Quick autofill demo handler
  const handleQuickFill = async (email, pass = "Demo1234!", requiredRole = null) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoading(true);
    await login(email, pass, requiredRole);
    setLoading(false);
  };

  const handleLoginSubmit = async (e, requiredRole = null) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError("Please enter your work email and password.");
      return;
    }
    setLoading(true);
    await login(loginEmail, loginPassword, requiredRole);
    setLoading(false);
  };

  const handleRegisterCompanySubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim() || !hrName.trim() || !hrEmail.trim() || !hrPassword.trim()) {
      setError("Please complete all required fields (Company Name, HR Name, Email, Password).");
      return;
    }
    setLoading(true);
    await registerCompany({
      company_name: companyName.trim(),
      industry: companyIndustry.trim() || "Enterprise",
      admin_name: hrName.trim(),
      admin_email: hrEmail.trim(),
      admin_password: hrPassword.trim()
    });
    setLoading(false);
  };

  const handleRegisterEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!empName.trim() || !empEmail.trim() || !empPassword.trim() || !empInviteCode.trim()) {
      setError("Please fill out your Name, Work Email, Password, and Company Invite Code.");
      return;
    }

    const code = empInviteCode.trim().toUpperCase();
    let compId = "comp_apex";
    if (code.startsWith("NEXUS")) compId = "comp_nexus";
    else if (code.startsWith("GLOBAL")) compId = "comp_global";

    setLoading(true);
    await register({
      name: empName.trim(),
      email: empEmail.trim(),
      password: empPassword.trim(),
      company_id: compId,
      role: "EMPLOYEE"
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FBF6F0] text-[#3A342E] flex flex-col justify-between selection:bg-[#8FA688] selection:text-white">
      
      {/* Top Navbar */}
      <header className="border-b border-[#EFE8DE] bg-[#FFFFFF]/80 backdrop-blur-md px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#8FA688] flex items-center justify-center text-white shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-bold font-serif text-[#3A342E] tracking-tight">HR Multi</span>
            <p className="text-[11px] text-[#6B6259] font-medium leading-none">Sage & Sand Workspace</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EBF0E6] text-[#6F8867] text-xs font-medium border border-[#DCE5D5]">
            <Check className="w-3.5 h-3.5 text-[#6F8867]" />
            <span>Role-separated secure login</span>
          </div>
        </div>
      </header>

      {/* Main Landing & Authentication Body */}
      <main className="max-w-6xl mx-auto px-6 py-10 lg:py-16 flex-1 flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* Left Side: Editorial Introduction */}
        <div className="lg:w-1/2 space-y-6 text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F4EFE3] text-[#6F8867] text-xs font-semibold uppercase tracking-wider">
            <span>Enterprise Multi-Tenant</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal font-serif text-[#3A342E] tracking-tight leading-[1.15]">
            Your company's knowledge.
          </h1>

          <p className="text-base sm:text-lg text-[#6B6259] font-serif leading-relaxed max-w-lg">
            Role-isolated AI assistance for your enterprise. Separate access control for HR policy managers and team employees.
          </p>

          {/* Clean Editorial Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-[#EFE8DE] card-shadow space-y-1">
              <span className="text-xs font-bold text-[#6F8867] uppercase tracking-wider">Role Isolation</span>
              <h4 className="font-serif font-bold text-[#3A342E] text-sm">Dedicated HR & Employee Portals</h4>
              <p className="text-xs text-[#6B6259] leading-relaxed">HR management tools are strictly gated to ensure sensitive administrative safety.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#EFE8DE] card-shadow space-y-1">
              <span className="text-xs font-bold text-[#6F8867] uppercase tracking-wider">Vector Privacy</span>
              <h4 className="font-serif font-bold text-[#3A342E] text-sm">Zero Cross-Tenant Leakage</h4>
              <p className="text-xs text-[#6B6259] leading-relaxed">Strict partition filters ensure no other organization can access your policies.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Sage & Sand Authentication Card */}
        <div className="w-full lg:w-[480px]">
          <div className="bg-white rounded-3xl border border-[#EFE8DE] popover-shadow p-6 sm:p-8 space-y-6">
            
            {/* 3-Way Mode Switcher: Employee Login | HR Login | Register Company */}
            <div className="flex bg-[#F4EFE3] p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setAuthTab("login_employee"); setError(null); }}
                className={`flex-1 py-2 px-3 rounded-lg whitespace-nowrap transition ${
                  authTab === "login_employee"
                    ? "bg-white text-[#3A342E] card-shadow"
                    : "text-[#6B6259] hover:text-[#3A342E]"
                }`}
              >
                Employee Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab("login_hr"); setError(null); }}
                className={`flex-1 py-2 px-3 rounded-lg whitespace-nowrap transition flex items-center justify-center space-x-1 ${
                  authTab === "login_hr"
                    ? "bg-white text-[#6F8867] card-shadow"
                    : "text-[#6B6259] hover:text-[#3A342E]"
                }`}
              >
                <Lock className="w-3 h-3 text-[#8FA688]" />
                <span>HR Portal</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab("register_company"); setError(null); }}
                className={`flex-1 py-2 px-3 rounded-lg whitespace-nowrap transition ${
                  authTab === "register_company"
                    ? "bg-white text-[#6F8867] card-shadow"
                    : "text-[#6B6259] hover:text-[#3A342E]"
                }`}
              >
                Register Company
              </button>
            </div>


            {/* Error Banner with quick-switch assistance */}
            {error && (
              <div className="bg-[#FFF5F5] border border-[#FED7D7] text-[#C53030] px-4 py-3 rounded-xl text-xs flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  {error.includes("HR Portal") && (
                    <button 
                      type="button"
                      onClick={() => { setAuthTab("login_hr"); setError(null); }}
                      className="underline font-bold text-[#6F8867] hover:text-[#5C7255]"
                    >
                      Switch to HR →
                    </button>
                  )}
                  {error.includes("Employee Sign-In") && (
                    <button 
                      type="button"
                      onClick={() => { setAuthTab("login_employee"); setError(null); }}
                      className="underline font-bold text-[#8FA688] hover:text-[#6F8867]"
                    >
                      Switch to Employee →
                    </button>
                  )}
                  <button type="button" onClick={() => setError(null)} className="font-bold">✕</button>
                </div>
              </div>
            )}

            {/* 1. EMPLOYEE SIGN IN TAB */}
            {authTab === "login_employee" && (
              <form onSubmit={(e) => handleLoginSubmit(e, "EMPLOYEE")} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-serif font-normal text-[#3A342E]">Employee Sign In</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4EFE3] text-[#6B6259] border border-[#EFE8DE] uppercase">
                      Staff Access
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6259]">
                    Access your company's official policies, handbooks, and AI assistant.
                  </p>
                </div>

                {/* Provisioning Notice Box */}
                <div className="p-3 rounded-xl bg-[#F4EFE3]/80 border border-[#EFE8DE] flex items-start space-x-2 text-[11px] text-[#6B6259]">
                  <ShieldCheck className="w-4 h-4 text-[#6F8867] shrink-0 mt-0.5" />
                  <span>
                    <strong>HR-Provisioned Accounts:</strong> Employee IDs are created exclusively by your company's HR Manager. Sign in using the work email and initial password provided by HR.
                  </span>
                </div>


                <div>
                  <label className="block text-xs font-semibold text-[#3A342E] mb-1.5">
                    Employee Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="employee@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE8DE] bg-[#FFFFFF] text-[#3A342E] text-xs sm:text-sm placeholder-[#A8A095] focus:outline-none focus:border-[#8FA688] focus:ring-1 focus:ring-[#8FA688] transition"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#3A342E]">
                      Password
                    </label>
                    <span className="text-[11px] text-[#6B6259]">Default: Demo1234!</span>
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE8DE] bg-[#FFFFFF] text-[#3A342E] text-xs sm:text-sm placeholder-[#A8A095] focus:outline-none focus:border-[#8FA688] focus:ring-1 focus:ring-[#8FA688] transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#8FA688] hover:bg-[#6F8867] text-white font-semibold text-xs sm:text-sm transition duration-150 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? "Verifying..." : "Sign in as Employee"}</span>
                </button>

                {/* Quick Demo Employee Logins */}
                <div className="pt-3 border-t border-[#EFE8DE] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#6B6259] font-medium">
                    <span>Quick Employee Demo Sign-In:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleQuickFill("employee.a@demo.com", "Demo1234!", "EMPLOYEE")}
                      className="p-2.5 rounded-xl border border-[#EFE8DE] hover:border-[#8FA688] bg-[#FBF6F0] hover:bg-[#EBF0E6] text-left transition"
                    >
                      <p className="font-bold text-[#3A342E]">Apex (Employee)</p>
                      <p className="text-[10px] text-[#6B6259] font-mono truncate">employee.a@demo.com</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill("employee.b@demo.com", "Demo1234!", "EMPLOYEE")}
                      className="p-2.5 rounded-xl border border-[#EFE8DE] hover:border-[#8FA688] bg-[#FBF6F0] hover:bg-[#EBF0E6] text-left transition"
                    >
                      <p className="font-bold text-[#3A342E]">Nexus (Employee)</p>
                      <p className="text-[10px] text-[#6B6259] font-mono truncate">employee.b@demo.com</p>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* 2. HR EXECUTIVE SIGN IN TAB (RESTRICTED) */}
            {authTab === "login_hr" && (
              <form onSubmit={(e) => handleLoginSubmit(e, "HR")} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-serif font-normal text-[#3A342E]">HR Manager Sign In</h2>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EBF0E6] text-[#6F8867] border border-[#DCE5D5] flex items-center space-x-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Restricted</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6259]">
                    Exclusive access for HR managers to upload documents, manage employees, and view audit trails.
                  </p>
                </div>

                {/* Restricted Notice Box */}
                <div className="p-3 rounded-xl bg-[#F4EFE3] border border-[#EFE8DE] flex items-start space-x-2 text-[11px] text-[#6B6259]">
                  <ShieldCheck className="w-4 h-4 text-[#6F8867] shrink-0 mt-0.5" />
                  <span>
                    Strict security active: Employee accounts cannot access this administrative portal.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3A342E] mb-1.5">
                    HR Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="hr.lead@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE8DE] bg-[#FFFFFF] text-[#3A342E] text-xs sm:text-sm placeholder-[#A8A095] focus:outline-none focus:border-[#8FA688] focus:ring-1 focus:ring-[#8FA688] transition"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#3A342E]">
                      Password
                    </label>
                    <span className="text-[11px] text-[#6B6259]">Default: Demo1234!</span>
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE8DE] bg-[#FFFFFF] text-[#3A342E] text-xs sm:text-sm placeholder-[#A8A095] focus:outline-none focus:border-[#8FA688] focus:ring-1 focus:ring-[#8FA688] transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#6F8867] hover:bg-[#5C7255] text-white font-semibold text-xs sm:text-sm transition duration-150 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-xs"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? "Authenticating HR Access..." : "Sign In to HR Portal"}</span>
                </button>

                {/* Quick Demo HR Logins */}
                <div className="pt-3 border-t border-[#EFE8DE] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#6B6259] font-medium">
                    <span>Quick HR Demo Sign-In:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleQuickFill("hr.a@demo.com", "Demo1234!", "HR")}
                      className="p-2.5 rounded-xl border border-[#DCE5D5] hover:border-[#6F8867] bg-[#EBF0E6]/50 hover:bg-[#EBF0E6] text-left transition"
                    >
                      <p className="font-bold text-[#3A342E]">Apex Corp (HR)</p>
                      <p className="text-[10px] text-[#6F8867] font-mono truncate">hr.a@demo.com</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill("hr.b@demo.com", "Demo1234!", "HR")}
                      className="p-2.5 rounded-xl border border-[#DCE5D5] hover:border-[#6F8867] bg-[#EBF0E6]/50 hover:bg-[#EBF0E6] text-left transition"
                    >
                      <p className="font-bold text-[#3A342E]">Nexus Tech (HR)</p>
                      <p className="text-[10px] text-[#6F8867] font-mono truncate">hr.b@demo.com</p>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* 3. REGISTER COMPANY TAB */}
            {authTab === "register_company" && (
              <form onSubmit={handleRegisterCompanySubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <h2 className="text-2xl font-serif font-normal text-[#3A342E]">Register company</h2>
                  <p className="text-xs text-[#6B6259]">
                    Set up your organization's private HR workspace.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3A342E] mb-1">
                    Company Name <span className="text-[#8FA688]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Corporation"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE8DE] bg-[#FFFFFF] text-[#3A342E] text-xs focus:outline-none focus:border-[#8FA688] focus:ring-1 focus:ring-[#8FA688]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3A342E] mb-1">
                    HR Manager Name <span className="text-[#8FA688]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={hrName}
                    onChange={(e) => setHrName(e.target.value)}
                    placeholder="e.g. Nandhana Menon"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE8DE] bg-[#FFFFFF] text-[#3A342E] text-xs focus:outline-none focus:border-[#8FA688] focus:ring-1 focus:ring-[#8FA688]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#3A342E] mb-1">
                      HR Work Email <span className="text-[#8FA688]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={hrEmail}
                      onChange={(e) => setHrEmail(e.target.value)}
                      placeholder="hr@acme.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE8DE] bg-[#FFFFFF] text-[#3A342E] text-xs focus:outline-none focus:border-[#8FA688] focus:ring-1 focus:ring-[#8FA688]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3A342E] mb-1">
                      Password <span className="text-[#8FA688]">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={hrPassword}
                      onChange={(e) => setHrPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE8DE] bg-[#FFFFFF] text-[#3A342E] text-xs focus:outline-none focus:border-[#8FA688] focus:ring-1 focus:ring-[#8FA688]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3A342E] mb-1">
                    Industry / Sector (Optional)
                  </label>
                  <input
                    type="text"
                    value={companyIndustry}
                    onChange={(e) => setCompanyIndustry(e.target.value)}
                    placeholder="e.g. Financial Services, AI, Healthcare"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE8DE] bg-[#FFFFFF] text-[#3A342E] text-xs focus:outline-none focus:border-[#8FA688] focus:ring-1 focus:ring-[#8FA688]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#8FA688] hover:bg-[#6F8867] text-white font-semibold text-xs sm:text-sm transition duration-150 mt-2"
                >
                  {loading ? "Registering Company..." : "Register Company"}
                </button>
              </form>
            )}

            {/* Bottom Security Note */}
            <div className="pt-2 text-center text-[11px] text-[#6B6259] flex items-center justify-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FA688]" />
              <span>Multi-tenant isolation & HR-provisioned staff accounts</span>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#EFE8DE] py-4 px-6 text-center text-xs text-[#6B6259]">
        HR Multi • Sage & Sand Editorial B2B Design
      </footer>
    </div>
  );
}
