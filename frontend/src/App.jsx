import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import CompanyPortalGateway, { COMPANIES_METADATA } from "./components/CompanyPortalGateway";
import DemoLoginCards from "./components/DemoLoginCards";
import HRDashboard from "./components/HRDashboard";
import EmployeeChat from "./components/EmployeeChat";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import CompanyInfoView from "./components/CompanyInfoView";
import ProfileView from "./components/ProfileView";
import EmployeeOverview from "./components/EmployeeOverview";
import { Sparkles, Building2 } from "lucide-react";

import LandingAuthPage from "./components/LandingAuthPage";

function MainAppShell() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [initialChatPrompt, setInitialChatPrompt] = useState("");

  // Set default active tab when user changes
  useEffect(() => {
    if (user) {
      setActiveTab("overview");
    }
  }, [user?.role, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF6F0] flex flex-col items-center justify-center space-y-4 text-[#6B6259]">
        <div className="w-12 h-12 rounded-2xl bg-[#EBF0E6] border border-[#DCE5D5] flex items-center justify-center text-[#8FA688] shadow-xs animate-pulse">
          <Building2 className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold tracking-wider text-[#6F8867] uppercase font-mono">
          Loading workspace...
        </p>
      </div>
    );
  }

  // If not authenticated, show universal Sage & Sand landing & auth page
  if (!user) {
    return <LandingAuthPage />;
  }

  return (
    <div className="min-h-screen flex bg-[#FBF6F0] text-[#3A342E] font-sans antialiased">
      {/* 1. PASTEL-SLATE SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenUploadModal={() => {
          setActiveTab("documents");
          setUploadModalOpen(true);
        }}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Clean Top Header with strict company badge and logout */}
        <Header
          setMobileOpen={setMobileOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">
          {/* SUPER ADMIN VIEWS */}
          {user.role === "SUPER_ADMIN" && (
            <>
              {(activeTab === "overview" || activeTab === "tenants" || activeTab === "users" || !["chat", "documents", "company", "profile"].includes(activeTab)) && (
                <SuperAdminDashboard defaultTab={["overview", "tenants", "users"].includes(activeTab) ? activeTab : "overview"} />
              )}
              {activeTab === "chat" && <EmployeeChat />}
              {activeTab === "documents" && (
                <HRDashboard
                  uploadModalOpen={uploadModalOpen}
                  setUploadModalOpen={setUploadModalOpen}
                  onNavigateToChat={(prompt) => {
                    if (prompt) setInitialChatPrompt(prompt);
                    setActiveTab("chat");
                  }}
                />
              )}
              {activeTab === "company" && (
                <CompanyInfoView
                  onNavigateToDocuments={() => setActiveTab("documents")}
                  onNavigateToChat={() => setActiveTab("chat")}
                />
              )}
              {activeTab === "profile" && <ProfileView />}
            </>
          )}

          {/* HR MANAGER VIEWS */}
          {user.role === "HR" && (
            <>
              {(activeTab === "overview" || activeTab === "documents" || !["chat", "company", "profile"].includes(activeTab)) && (
                <HRDashboard
                  uploadModalOpen={uploadModalOpen}
                  setUploadModalOpen={setUploadModalOpen}
                  onNavigateToChat={(prompt) => {
                    if (prompt) setInitialChatPrompt(prompt);
                    setActiveTab("chat");
                  }}
                />
              )}
              {activeTab === "chat" && <EmployeeChat />}
              {activeTab === "company" && (
                <CompanyInfoView
                  onNavigateToDocuments={() => setActiveTab("documents")}
                  onNavigateToChat={() => setActiveTab("chat")}
                />
              )}
              {activeTab === "profile" && <ProfileView />}
            </>
          )}

          {/* EMPLOYEE VIEWS */}
          {user.role === "EMPLOYEE" && (
            <>
              {(activeTab === "overview" || !["chat", "documents", "company", "profile"].includes(activeTab)) && (
                <EmployeeOverview
                  onNavigateToChat={(prompt) => {
                    if (prompt) setInitialChatPrompt(prompt);
                    setActiveTab("chat");
                  }}
                  onNavigateToCompanyInfo={() => setActiveTab("company")}
                />
              )}
              {activeTab === "chat" && <EmployeeChat initialPrompt={initialChatPrompt} />}
              {activeTab === "documents" && (
                <HRDashboard
                  uploadModalOpen={false}
                  setUploadModalOpen={() => {}}
                  onNavigateToChat={(prompt) => {
                    if (prompt) setInitialChatPrompt(prompt);
                    setActiveTab("chat");
                  }}
                />
              )}
              {activeTab === "company" && (
                <CompanyInfoView
                  onNavigateToDocuments={() => setActiveTab("documents")}
                  onNavigateToChat={() => setActiveTab("chat")}
                />
              )}
              {activeTab === "profile" && <ProfileView />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppShell />
    </AuthProvider>
  );
}
