import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { documentAPI } from "../services/api";
import { 
  Building2, 
  Sparkles, 
  FileText, 
  UserCheck, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Mail, 
  HelpCircle, 
  Calendar, 
  HeartHandshake, 
  Laptop, 
  ChevronRight,
  Eye,
  CheckCircle2,
  FileCheck,
  Check
} from "lucide-react";

export default function EmployeeOverview({ onNavigateToChat, onNavigateToCompanyInfo }) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const res = await documentAPI.list();
        setDocuments(res.data);
      } catch (err) {
        console.error("Failed to load documents:", err);
      } finally {
        setLoadingDocs(false);
      }
    };
    loadDocs();
  }, [user]);

  // Company specific information
  const companyHighlights = {
    comp_apex: {
      name: "Apex Corp",
      hrName: "Priya Sharma",
      hrRole: "HR Lead & People Operations",
      hrEmail: "hr.a@demo.com",
      leaveSummary: "20 Paid Days / Year (1.67 days/mo)",
      healthSummary: "80% Apex Care Comprehensive Plan",
      workplaceSummary: "Hybrid (2 Days Remote / Week)",
      policies: [
        { name: "Employee Leave & Benefits Policy 2026", type: "Leave & Time Off", query: "How many annual leave days do I get and what is the rollover policy?" },
        { name: "Apex Health & Dental Insurance Guide", type: "Health Benefits", query: "What does the Apex Care health insurance plan cover?" },
        { name: "Hybrid Workplace & Remote Culture Guide", type: "Workplace Guidelines", query: "What is the remote work and hybrid policy for Apex Corp?" }
      ]
    },
    comp_nexus: {
      name: "Nexus Tech",
      hrName: "Nandhana Menon",
      hrRole: "VP People & Culture",
      hrEmail: "hr.b@demo.com",
      leaveSummary: "30 Paid Days / Year (Zero Expiry Rollover)",
      healthSummary: "100% Nexus Health Elite Coverage",
      workplaceSummary: "100% Remote-First Culture + $1,200 Stipend",
      policies: [
        { name: "Nexus Global Benefits & Remote Guide 2026", type: "Benefits & Perks", query: "What are the remote work benefits and home office stipend?" },
        { name: "Unlimited Wellness & Mental Health Plan", type: "Wellness", query: "How many sick and wellness days do I have at Nexus Tech?" },
        { name: "Comprehensive Parental Leave Framework", type: "Parental Policy", query: "How long is parental leave at Nexus Tech?" }
      ]
    },
    comp_global: {
      name: "Global Logistics",
      hrName: "Ananya Iyer",
      hrRole: "HR Director & Operations",
      hrEmail: "hr.c@demo.com",
      leaveSummary: "22 Paid Days / Year",
      healthSummary: "Global Standard Health Plus",
      workplaceSummary: "On-site Shift & Operations Hub",
      policies: [
        { name: "Logistics Safety & Operations Standards", type: "Operations", query: "What are the standard operating safety guidelines?" },
        { name: "Employee Leave & Shift Allowance Policy", type: "Leave & Shift", query: "What is the shift allowance and overtime policy?" }
      ]
    }
  };

  const currentHighlight = companyHighlights[user?.company_id] || {
    name: user?.company_name || "Enterprise Company",
    hrName: "Human Resources Lead",
    hrRole: "People Operations Manager",
    hrEmail: "hr@company.com",
    leaveSummary: "Configured by Company HR",
    healthSummary: "Corporate Health Coverage",
    workplaceSummary: "Company Workplace Standard",
    policies: [
      { name: "Company Code of Conduct & Policies", type: "General Policy", query: "What are the main company leave and benefits policies?" }
    ]
  };

  const handleAskQuestion = (promptText) => {
    if (onNavigateToChat) {
      onNavigateToChat(promptText);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
      
      {/* 1. TOP OVERVIEW HERO BANNER (SAGE & SAND EDITORIAL) */}
      <div className="rounded-3xl bg-[#FFFFFF] border border-[#EFE8DE] p-6 sm:p-8 lg:p-10 card-shadow space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EBF0E6] text-xs font-semibold text-[#6F8867] border border-[#DCE5D5]">
              <Check className="w-3.5 h-3.5" />
              <span>{user?.company_name || "Company"} Workspace</span>
              <span>•</span>
              <span>Private Partition</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal font-serif text-[#3A342E] tracking-tight">
              One place for your HR knowledge.
            </h1>
            <p className="text-sm sm:text-base text-[#6B6259] max-w-xl leading-relaxed">
              Get instant, accurate answers from your company's policies and procedures. All documents are verified and indexed in your isolated tenant database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => handleAskQuestion("")}
              className="px-5 py-3 rounded-xl bg-[#8FA688] hover:bg-[#6F8867] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center space-x-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. THREE SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Your HR Manager Contact */}
        <div className="rounded-3xl bg-white border border-[#EFE8DE] card-shadow p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#A8A095] uppercase tracking-wider">
                HR Leadership
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF0E6] text-[#6F8867] border border-[#DCE5D5]">
                Document Admin
              </span>
            </div>

            <div className="flex items-center space-x-3.5 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-[#F4EFE3] border border-[#EFE8DE] flex items-center justify-center text-[#6F8867] font-bold text-sm shadow-2xs">
                {currentHighlight.hrName.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#3A342E]">{currentHighlight.hrName}</h3>
                <p className="text-xs text-[#6B6259]">{currentHighlight.hrRole}</p>
                <div className="flex items-center space-x-1.5 text-[11px] text-[#8FA688] font-mono mt-0.5">
                  <Mail className="w-3 h-3" />
                  <span>{currentHighlight.hrEmail}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#EFE8DE] flex items-center justify-between text-xs text-[#6B6259]">
            <span>Upload & Policy Owner</span>
            <span className="text-[#6F8867] font-medium">● Available</span>
          </div>
        </div>

        {/* Card 2: Annual Leave Standard */}
        <div className="rounded-3xl bg-white border border-[#EFE8DE] card-shadow p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#A8A095] uppercase tracking-wider">
                Leave Entitlement
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#EBF0E6] flex items-center justify-center text-[#6F8867]">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            <div>
              <p className="text-xs text-[#6B6259]">Annual Paid Leave</p>
              <h3 className="text-base font-serif font-bold text-[#3A342E] mt-0.5">
                {currentHighlight.leaveSummary}
              </h3>
            </div>
          </div>

          <button
            onClick={() => handleAskQuestion("How do I apply for annual leave and what are the rollover rules?")}
            className="text-left text-xs font-semibold text-[#8FA688] hover:text-[#6F8867] flex items-center justify-between pt-3 border-t border-[#EFE8DE] group"
          >
            <span>Ask AI for leave details</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </button>
        </div>

        {/* Card 3: Healthcare & Workplace Standard */}
        <div className="rounded-3xl bg-white border border-[#EFE8DE] card-shadow p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#A8A095] uppercase tracking-wider">
                Health & Workplace
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#F4EFE3] flex items-center justify-center text-[#6F8867]">
                <HeartHandshake className="w-4 h-4" />
              </div>
            </div>

            <div>
              <p className="text-xs text-[#6B6259]">{currentHighlight.healthSummary}</p>
              <h3 className="text-xs font-serif font-bold text-[#3A342E] mt-1">
                {currentHighlight.workplaceSummary}
              </h3>
            </div>
          </div>

          <button
            onClick={() => handleAskQuestion("What are the medical insurance benefits and coverage limits?")}
            className="text-left text-xs font-semibold text-[#8FA688] hover:text-[#6F8867] flex items-center justify-between pt-3 border-t border-[#EFE8DE] group"
          >
            <span>Ask AI about health coverage</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </div>

      {/* 3. VERIFIED POLICY DOCUMENTS (READ-ONLY EXPLORER) */}
      <div className="bg-white rounded-3xl border border-[#EFE8DE] card-shadow p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFE8DE]">
          <div>
            <div className="flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-[#8FA688]" />
              <h2 className="text-lg font-serif font-bold text-[#3A342E]">Company Policies & Handbooks</h2>
            </div>
            <p className="text-xs text-[#6B6259] mt-0.5">
              Verified documents indexed in Qdrant Vector DB powering your AI assistant.
            </p>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EBF0E6] text-[#6F8867] text-xs font-medium border border-[#DCE5D5]">
            <Check className="w-3.5 h-3.5" />
            <span>Read-Only Explorer</span>
          </div>
        </div>

        {/* Documents Grid */}
        {loadingDocs ? (
          <div className="py-8 text-center text-xs text-[#6B6259]">Loading company documents...</div>
        ) : documents.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#6B6259]">No documents uploaded for this company yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl border border-[#EFE8DE] hover:border-[#8FA688] bg-[#FBF6F0] hover:bg-[#F4EFE3]/50 transition space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#EFE8DE] flex items-center justify-center text-[#8FA688] shrink-0 shadow-2xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[#3A342E] truncate" title={doc.filename}>
                      {doc.filename}
                    </h4>
                    <p className="text-[11px] text-[#6B6259] mt-0.5">
                      Uploaded by: <span className="font-mono">{doc.uploaded_by}</span>
                    </p>
                    <div className="flex items-center space-x-2 mt-1 text-[10px] text-[#6B6259]">
                      <span className="font-mono bg-white px-2 py-0.5 rounded-full border border-[#EFE8DE] text-[#6F8867] font-semibold">
                        {doc.chunk_count} Vector Chunks
                      </span>
                      <span>•</span>
                      <span className="text-[#6F8867] font-semibold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>AI Searchable</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EFE8DE] flex items-center justify-between text-xs">
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="text-[#6B6259] hover:text-[#3A342E] font-semibold flex items-center space-x-1 text-[11px]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Metadata</span>
                  </button>

                  <button
                    onClick={() => handleAskQuestion(`Tell me what is covered in ${doc.filename}`)}
                    className="text-[#8FA688] hover:text-[#6F8867] font-semibold flex items-center space-x-1 text-[11px]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI About This</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. QUICK ASK AI SHORTCUTS (SAGE & SAND) */}
      <div className="bg-white rounded-3xl border border-[#EFE8DE] card-shadow p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-serif font-bold text-[#3A342E] flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#8FA688]" />
              <span>Frequently Asked Policy Questions</span>
            </h3>
            <p className="text-xs text-[#6B6259] mt-0.5">
              Click any question below to immediately ask the AI Assistant.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {currentHighlight.policies.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleAskQuestion(p.query)}
              className="text-left p-4 rounded-2xl border border-[#EFE8DE] hover:border-[#8FA688] hover:bg-[#F4EFE3]/50 transition group flex items-center justify-between bg-white card-shadow"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#8FA688] uppercase tracking-wider">{p.type}</span>
                <p className="text-xs font-semibold text-[#3A342E] group-hover:text-[#6F8867] transition">
                  {p.query}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#A8A095] group-hover:text-[#8FA688] shrink-0 ml-2 group-hover:translate-x-0.5 transition" />
            </button>
          ))}
        </div>
      </div>

      {/* 5. METADATA MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3A342E]/30 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#EFE8DE] shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE8DE]">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EBF0E6] text-[#6F8867] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#3A342E]">{selectedDoc.filename}</h3>
                  <p className="text-[11px] text-[#6B6259] font-mono">ID: {selectedDoc.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg text-[#6B6259] hover:text-[#3A342E] hover:bg-[#F4EFE3]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#FBF6F0] rounded-2xl border border-[#EFE8DE]">
                <div>
                  <span className="text-[10px] text-[#A8A095] font-bold uppercase">Company Partition</span>
                  <p className="font-semibold text-[#3A342E]">{user?.company_name}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#A8A095] font-bold uppercase">Tenant ID</span>
                  <p className="font-mono font-semibold text-[#3A342E]">{selectedDoc.company_id}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#A8A095] font-bold uppercase">Uploaded By</span>
                  <p className="font-mono text-[#6B6259]">{selectedDoc.uploaded_by}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#A8A095] font-bold uppercase">Vector Chunks</span>
                  <p className="font-semibold text-[#6F8867]">{selectedDoc.chunk_count} Chunks in Qdrant</p>
                </div>
              </div>

              <p className="text-[#6B6259] text-[11px] leading-relaxed">
                This document is indexed and protected under your company's dedicated vector partition. You can ask any specific questions regarding its contents in the AI Assistant.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#EFE8DE]">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B6259] bg-[#F4EFE3] hover:bg-[#EFE8DE] transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const query = `Summarize the key points in ${selectedDoc.filename}`;
                  setSelectedDoc(null);
                  handleAskQuestion(query);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#8FA688] hover:bg-[#6F8867] transition flex items-center space-x-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI About This Policy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
