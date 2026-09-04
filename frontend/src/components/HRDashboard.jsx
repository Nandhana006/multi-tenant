import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { documentAPI, companyAPI } from "../services/api";
import { 
  FileText, 
  MessageSquare, 
  Users, 
  Database, 
  Plus, 
  Upload, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  File, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Search, 
  Activity, 
  Copy, 
  LogIn, 
  LogOut, 
  UserPlus,
  Check,
  KeyRound
} from "lucide-react";

export default function HRDashboard({ uploadModalOpen, setUploadModalOpen, onNavigateToChat }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("documents"); // "documents" | "employees" | "logs"
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [auditLogs, setAuditLogs] = useState({ mongo_connected: false, auth_logs: [], chat_logs: [] });
  
  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewDoc, setViewDoc] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Pagination & Search
  const [activePage, setActivePage] = useState(1);
  const [activeEmpPage, setActiveEmpPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 6;
  const empItemsPerPage = 8;

  // Provision New Employee Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpEmail, setNewEmpEmail] = useState("");
  const [newEmpTitle, setNewEmpTitle] = useState("");
  const [newEmpPassword, setNewEmpPassword] = useState("Demo1234!");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [newlyCreatedUserId, setNewlyCreatedUserId] = useState(null);

  // Employee AI Conversation Modal State
  const [selectedEmployeeChat, setSelectedEmployeeChat] = useState(null);
  const [empChatLoading, setEmpChatLoading] = useState(false);
  const [empChatData, setEmpChatData] = useState(null);
  const [empChatError, setEmpChatError] = useState(null);
  const [logsSubTab, setLogsSubTab] = useState("auth"); // "auth" | "chat"

  const handleOpenEmployeeChat = async (emp) => {
    setSelectedEmployeeChat(emp);
    setEmpChatLoading(true);
    setEmpChatError(null);
    setEmpChatData(null);
    try {
      const res = await companyAPI.getEmployeeChatHistory(emp.id);
      setEmpChatData(res.data);
    } catch (err) {
      console.error("Failed to load employee chat history:", err);
      setEmpChatError(err.response?.data?.detail || "Could not retrieve chat history for this employee.");
    } finally {
      setEmpChatLoading(false);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentAPI.list();
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const res = await companyAPI.getEmployees();
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Failed to load company employees:", err);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await companyAPI.getAuditLogs();
      setAuditLogs(res.data || { mongo_connected: false, auth_logs: [], chat_logs: [] });
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleCreateEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpEmail.trim()) {
      setCreateError("Please enter the employee's name and work email.");
      return;
    }

    setCreateLoading(true);
    setCreateError(null);

    try {
      const payload = {
        name: newEmpName.trim(),
        email: newEmpEmail.trim(),
        title: newEmpTitle.trim() || null,
        password: newEmpPassword.trim() || "Demo1234!"
      };

      const res = await companyAPI.createEmployee(payload);
      const createdUser = res.data?.user;

      setCreatedCredentials({
        name: createdUser?.name || newEmpName.trim(),
        email: res.data?.credentials?.email || newEmpEmail.trim(),
        password: res.data?.credentials?.initial_password || newEmpPassword.trim() || "Demo1234!"
      });

      if (createdUser?.id) {
        setNewlyCreatedUserId(createdUser.id);
      }

      // Clear input fields
      setNewEmpName("");
      setNewEmpEmail("");
      setNewEmpTitle("");
      setNewEmpPassword("Demo1234!");

      // Ensure activeTab is set to employees and page 1 so it's directly visible
      setActiveTab("employees");
      setActiveEmpPage(1);

      // Auto-refresh employee list and audit logs
      await fetchEmployees();
      await fetchLogs();
    } catch (err) {
      console.error("Failed to provision employee:", err);
      const msg = err.response?.data?.detail || "Failed to create employee account. Please try again.";
      setCreateError(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    if (user?.role !== "EMPLOYEE") {
      fetchEmployees();
      fetchLogs();
    }
  }, [user]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await documentAPI.upload(formData);
      setUploadSuccess(`Successfully uploaded and indexed "${res.data.filename}" with ${res.data.chunk_count} vector chunks!`);
      fetchDocuments();
      setTimeout(() => {
        if (setUploadModalOpen) setUploadModalOpen(false);
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to upload and process document.";
      setUploadError(msg);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (docId, filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}" and purge its vectors from Qdrant?`)) {
      return;
    }

    setDeleteId(docId);
    try {
      await documentAPI.delete(docId);
      setUploadSuccess(`Deleted "${filename}" successfully.`);
      fetchDocuments();
    } catch (err) {
      alert("Failed to delete document: " + (err.response?.data?.detail || err.message));
    } finally {
      setDeleteId(null);
    }
  };

  const copyInviteCode = () => {
    if (!user?.company_id) return;
    navigator.clipboard.writeText(user.company_id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes <= 0) return "0 KB";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + (sizes[i] || "KB");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateString;
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Just now";
    try {
      const d = new Date(dateString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " · " + d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateString;
    }
  };

  const getCategoryBadge = (filename) => {
    const name = filename.toLowerCase();
    if (name.includes("leave") || name.includes("holiday") || name.includes("vacation")) {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#EBF0E6] text-[#6F8867] border border-[#DCE5D5]">Leave Policy</span>;
    } else if (name.includes("handbook") || name.includes("hr") || name.includes("onboarding")) {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F4EFE3] text-[#6B6259] border border-[#EFE8DE]">HR Handbook</span>;
    } else if (name.includes("health") || name.includes("insurance") || name.includes("benefit") || name.includes("care")) {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FBF6F0] text-[#6F8867] border border-[#EFE8DE]">Benefits</span>;
    } else if (name.includes("remote") || name.includes("work") || name.includes("hybrid") || name.includes("home")) {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#EBF0E6] text-[#3A342E] border border-[#DCE5D5]">Work Policy</span>;
    } else {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F4EFE3] text-[#6F8867] border border-[#EFE8DE]">Company Policy</span>;
    }
  };

  const firstName = user?.name ? user.name.split(" ")[0] : "Manager";
  const totalChunks = documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0);
  const totalSizeBytes = documents.reduce((acc, d) => acc + (d.file_size || 0), 0);

  // Filtered documents
  const filteredDocs = documents.filter(d => 
    d.filename?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;
  const currentDocs = filteredDocs.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  // Filtered employees
  const filteredEmployees = employees.filter(e => 
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalEmpPages = Math.ceil(filteredEmployees.length / empItemsPerPage) || 1;
  const currentEmployees = filteredEmployees.slice((activeEmpPage - 1) * empItemsPerPage, activeEmpPage * empItemsPerPage);


  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* 1. TOP GREETING & COMPANY CONTEXT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A342E] tracking-tight">
              Welcome back, {firstName}! 👋
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF0E6] text-[#6F8867] border border-[#DCE5D5]">
              {user?.company_name || "Company Tenant"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B6259]">
            Enterprise HR workspace with grounded AI knowledge & MongoDB audit trails.
          </p>
        </div>

        {/* Company Quick Actions */}
        {user?.role !== "EMPLOYEE" && (
          <div className="flex items-center space-x-2.5">
            <button
              onClick={copyInviteCode}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F4EFE3] border border-[#EFE8DE] text-[#6B6259] hover:text-[#3A342E] text-xs font-semibold flex items-center space-x-2 transition card-shadow"
              title="Copy Company ID to invite staff"
            >
              <Copy className="w-3.5 h-3.5 text-[#8FA688]" />
              <span>{copiedCode ? "Copied ID!" : `Company ID: ${user?.company_id?.slice(0, 10)}...`}</span>
            </button>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#8FA688] hover:bg-[#6F8867] text-white text-xs font-semibold flex items-center space-x-2 transition card-shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Upload document</span>
            </button>
          </div>
        )}
      </div>

      {/* Global feedback alerts */}
      {uploadSuccess && (
        <div className="bg-[#EBF0E6] border border-[#DCE5D5] text-[#6F8867] px-4 py-3 rounded-2xl text-xs flex items-center justify-between card-shadow animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#6F8867] shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
          <button onClick={() => setUploadSuccess(null)} className="text-[#3A342E] font-bold ml-2">✕</button>
        </div>
      )}

      {/* 2. FOUR COMPACT STATISTIC CARDS (SAGE & SAND PALETTE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Documents */}
        <div className="bg-white rounded-3xl p-5 border border-[#EFE8DE] card-shadow flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#A8A095] uppercase tracking-wider">Company Docs</p>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#3A342E]">
                {documents.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#EBF0E6] text-[#6F8867] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center text-xs font-medium text-[#6F8867]">
            <span>{totalChunks} vector chunks indexed</span>
          </div>
        </div>

        {/* Card 2: Total Employees */}
        <div className="bg-white rounded-3xl p-5 border border-[#EFE8DE] card-shadow flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#A8A095] uppercase tracking-wider">Stored Employees</p>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#3A342E]">
                {employees.length > 0 ? employees.length : 1}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F4EFE3] text-[#6F8867] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center text-xs font-medium text-[#6F8867]">
            <span>Registered in company account</span>
          </div>
        </div>

        {/* Card 3: Storage & Vectors */}
        <div className="bg-white rounded-3xl p-5 border border-[#EFE8DE] card-shadow flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#A8A095] uppercase tracking-wider">Storage Used</p>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#3A342E]">
                {totalSizeBytes > 0 ? formatFileSize(totalSizeBytes) : "450 KB"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#EBF0E6] text-[#6F8867] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center text-xs font-medium text-[#6B6259]">
            <span>Isolated in Qdrant Vector DB</span>
          </div>
        </div>

        {/* Card 4: MongoDB Audit Status */}
        <div className="bg-white rounded-3xl p-5 border border-[#EFE8DE] card-shadow flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#A8A095] uppercase tracking-wider">MongoDB Audit</p>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#6F8867]">
                Active
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F4EFE3] text-[#6F8867] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center text-xs font-medium text-[#6F8867]">
            <span>Sign-in, sign-out & chats logged</span>
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION TABS (DOCUMENTS | EMPLOYEES | MONGO AUDIT LOGS) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE8DE] pb-3">
        <div className="flex items-center space-x-2 bg-[#F4EFE3] p-1 rounded-2xl border border-[#EFE8DE]">
          <button
            onClick={() => { setActiveTab("documents"); setActivePage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
              activeTab === "documents"
                ? "bg-white text-[#3A342E] card-shadow"
                : "text-[#6B6259] hover:text-[#3A342E]"
            }`}
          >
            <FileText className="w-4 h-4 text-[#8FA688]" />
            <span>Policy Documents ({documents.length})</span>
          </button>

          {user?.role !== "EMPLOYEE" && (
            <>
              <button
                onClick={() => { setActiveTab("employees"); setActivePage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
                  activeTab === "employees"
                    ? "bg-white text-[#3A342E] card-shadow"
                    : "text-[#6B6259] hover:text-[#3A342E]"
                }`}
              >
                <Users className="w-4 h-4 text-[#8FA688]" />
                <span>Employee Directory ({employees.length})</span>
              </button>

              <button
                onClick={() => { setActiveTab("logs"); setActivePage(1); fetchLogs(); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
                  activeTab === "logs"
                    ? "bg-white text-[#3A342E] card-shadow"
                    : "text-[#6B6259] hover:text-[#3A342E]"
                }`}
              >
                <Activity className="w-4 h-4 text-[#8FA688]" />
                <span>MongoDB Activity & Audit</span>
              </button>
            </>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#A8A095] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === "documents"
                ? "Search policy documents..."
                : activeTab === "employees"
                ? "Search employee accounts..."
                : "Search audit logs..."
            }
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setActivePage(1); }}
            className="pl-8 pr-3 py-2 text-xs rounded-xl border border-[#EFE8DE] bg-white text-[#3A342E] placeholder-[#A8A095] focus:outline-none focus:border-[#8FA688] focus:ring-1 focus:ring-[#8FA688] w-full sm:w-64 transition"
          />
        </div>
      </div>

      {/* TAB 1: POLICY DOCUMENTS TABLE */}
      {activeTab === "documents" && (
        <div className="bg-white rounded-3xl border border-[#EFE8DE] card-shadow overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-[#6B6259] text-xs">
              <div className="w-8 h-8 rounded-full border-2 border-[#8FA688] border-t-transparent animate-spin mx-auto mb-3" />
              Loading your documents repository...
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="py-16 text-center text-[#6B6259] text-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FBF6F0] text-[#8FA688] flex items-center justify-center mx-auto border border-[#EFE8DE]">
                <File className="w-6 h-6" />
              </div>
              <p className="font-bold text-[#3A342E]">No policy documents found.</p>
              <p className="text-[#6B6259] max-w-sm mx-auto">Upload your first company handbook or policy PDF to index it into the vector assistant.</p>
              {user?.role !== "EMPLOYEE" && (
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#8FA688] hover:bg-[#6F8867] text-white text-xs font-semibold inline-flex items-center space-x-1.5 shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Document</span>
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#EFE8DE] text-[#6B6259] font-bold uppercase tracking-wider text-[11px] bg-[#F4EFE3]/50">
                      <th className="py-4 px-6">Document Name</th>
                      <th className="py-4 px-4">Category</th>
                      <th className="py-4 px-4">Uploaded On</th>
                      <th className="py-4 px-4">Size</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE8DE] text-[#3A342E]">
                    {currentDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-[#FBF6F0]/80 transition-colors group">
                        {/* Document Name */}
                        <td className="py-4 px-6 font-semibold text-[#3A342E]">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-[#EBF0E6] border border-[#DCE5D5] text-[#6F8867] flex items-center justify-center shrink-0 shadow-2xs font-bold text-[9px]">
                              {doc.file_type?.toUpperCase() || "DOC"}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate max-w-xs sm:max-w-sm text-[#3A342E] font-medium">{doc.filename}</p>
                              <p className="text-[10px] text-[#6F8867] font-normal font-mono mt-0.5">{doc.chunk_count} vector chunks indexed</p>
                            </div>
                          </div>
                        </td>

                        {/* Category badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {getCategoryBadge(doc.filename)}
                        </td>

                        {/* Uploaded On */}
                        <td className="py-4 px-4 text-[#6B6259] whitespace-nowrap">
                          {formatDate(doc.created_at)}
                        </td>

                        {/* Size */}
                        <td className="py-4 px-4 text-[#6B6259] whitespace-nowrap font-mono text-[11px]">
                          {formatFileSize(doc.file_size)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setViewDoc(doc)}
                              className="p-1.5 text-[#6B6259] hover:text-[#3A342E] hover:bg-[#F4EFE3] rounded-lg transition"
                              title="Inspect Vector Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {user?.role !== "EMPLOYEE" && (
                              <button
                                disabled={deleteId === doc.id}
                                onClick={() => handleDelete(doc.id, doc.filename)}
                                className="p-1.5 text-[#6B6259] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Document"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => onNavigateToChat && onNavigateToChat(`Tell me about ${doc.filename}`)}
                              className="p-1.5 text-[#8FA688] hover:text-[#6F8867] hover:bg-[#EBF0E6] rounded-lg transition"
                              title="Ask AI Assistant About This Policy"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer with Pagination */}
              <div className="px-6 py-4 border-t border-[#EFE8DE] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6259]">
                <div>
                  Showing <span className="font-bold text-[#3A342E]">{Math.min((activePage - 1) * itemsPerPage + 1, filteredDocs.length)}</span> to <span className="font-bold text-[#3A342E]">{Math.min(activePage * itemsPerPage, filteredDocs.length)}</span> of <span className="font-bold text-[#3A342E]">{filteredDocs.length}</span> documents
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setActivePage(p => Math.max(1, p - 1))}
                    disabled={activePage === 1}
                    className="p-1.5 rounded-lg border border-[#EFE8DE] hover:bg-[#F4EFE3] disabled:opacity-40 text-[#3A342E]"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setActivePage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                        activePage === pageNum
                          ? "bg-[#8FA688] text-white"
                          : "text-[#3A342E] hover:bg-[#F4EFE3]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => setActivePage(p => Math.min(totalPages, p + 1))}
                    disabled={activePage === totalPages}
                    className="p-1.5 rounded-lg border border-[#EFE8DE] hover:bg-[#F4EFE3] disabled:opacity-40 text-[#3A342E]"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: STORED EMPLOYEE ACCOUNTS DIRECTORY */}
      {activeTab === "employees" && (
        <div className="bg-white rounded-3xl border border-[#EFE8DE] card-shadow overflow-hidden">
          <div className="p-6 border-b border-[#EFE8DE] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F4EFE3]/30">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#3A342E]">Registered Employee Accounts</h2>
              <p className="text-xs text-[#6B6259]">All user accounts partitioned under {user?.company_name || "this company"}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-[#6F8867] bg-[#EBF0E6] px-3 py-1.5 rounded-full border border-[#DCE5D5]">
                {filteredEmployees.length} Total Users
              </span>
              <button
                onClick={() => {
                  setCreatedCredentials(null);
                  setCreateError(null);
                  setNewEmpName("");
                  setNewEmpEmail("");
                  setNewEmpTitle("");
                  setNewEmpPassword("Demo1234!");
                  setShowCreateModal(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#6F8867] hover:bg-[#5C7255] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Employee</span>
              </button>
            </div>

          </div>

          {employeesLoading ? (
            <div className="py-16 text-center text-[#6B6259] text-xs">
              <div className="w-8 h-8 rounded-full border-2 border-[#8FA688] border-t-transparent animate-spin mx-auto mb-3" />
              Loading employee accounts...
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="py-16 text-center text-[#6B6259] text-xs space-y-3">
              <Users className="w-10 h-10 text-[#8FA688] mx-auto" />
              <p className="font-bold text-[#3A342E]">No employees registered yet.</p>
              <p className="text-[#6B6259] max-w-sm mx-auto">Share your company invite code with staff to let them register into this company workspace.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#EFE8DE] text-[#6B6259] font-bold uppercase tracking-wider text-[11px] bg-[#F4EFE3]/50">
                    <th className="py-4 px-6">User Name</th>
                    <th className="py-4 px-4">Email Address</th>
                    <th className="py-4 px-4">Role</th>
                    <th className="py-4 px-4 text-center">AI Conversations</th>
                    <th className="py-4 px-4">Registered On</th>
                    <th className="py-4 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE8DE] text-[#3A342E]">
                  {currentEmployees.map((emp) => (
                    <tr 
                      key={emp.id} 
                      className={`transition ${
                        newlyCreatedUserId === emp.id 
                          ? "bg-[#EBF0E6]/50 hover:bg-[#EBF0E6]/70 border-l-4 border-l-[#6F8867]" 
                          : "hover:bg-[#FBF6F0]/80"
                      }`}
                    >
                      <td className="py-4 px-6 font-bold text-[#3A342E]">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-[#EBF0E6] text-[#6F8867] flex items-center justify-center font-bold text-xs border border-[#DCE5D5] shrink-0 shadow-2xs">
                            {emp.name ? (emp.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase() || "EM") : "EM"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-[#3A342E] font-medium truncate max-w-[150px] sm:max-w-none">{emp.name}</p>
                              {newlyCreatedUserId === emp.id && (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#6F8867] text-white uppercase tracking-wider animate-pulse">
                                  Just Added
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[#A8A095] font-mono">{emp.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-[#6B6259]">
                        {emp.email}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          emp.role === "HR" 
                            ? "bg-[#EBF0E6] text-[#6F8867] border border-[#DCE5D5]" 
                            : "bg-[#F4EFE3] text-[#6B6259] border border-[#EFE8DE]"
                        }`}>
                          {emp.role}
                        </span>
                      </td>

                      {/* AI CONVERSATION INSPECTOR BUTTON */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEmployeeChat(emp)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-[#DCE5D5] bg-white hover:bg-[#6F8867] hover:text-white text-[#6F8867] text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
                          title={`Inspect AI chat history for ${emp.name}`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>View AI Chat</span>
                        </button>
                      </td>

                      <td className="py-4 px-4 text-[#6B6259] whitespace-nowrap">
                        {formatDate(emp.created_at)}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#EBF0E6] text-[#6F8867] border border-[#DCE5D5]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6F8867] animate-pulse"></span>
                          <span>Active</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Employee Pagination Footer */}
              <div className="px-6 py-4 border-t border-[#EFE8DE] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6259]">
                <div>
                  Showing <span className="font-bold text-[#3A342E]">{Math.min((activeEmpPage - 1) * empItemsPerPage + 1, filteredEmployees.length)}</span> to <span className="font-bold text-[#3A342E]">{Math.min(activeEmpPage * empItemsPerPage, filteredEmployees.length)}</span> of <span className="font-bold text-[#3A342E]">{filteredEmployees.length}</span> employees
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setActiveEmpPage(p => Math.max(1, p - 1))}
                    disabled={activeEmpPage === 1}
                    className="p-1.5 rounded-lg border border-[#EFE8DE] hover:bg-[#F4EFE3] disabled:opacity-40 text-[#3A342E]"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {Array.from({ length: totalEmpPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setActiveEmpPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                        activeEmpPage === pageNum
                          ? "bg-[#8FA688] text-white"
                          : "text-[#3A342E] hover:bg-[#F4EFE3]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => setActiveEmpPage(p => Math.min(totalEmpPages, p + 1))}
                    disabled={activeEmpPage === totalEmpPages}
                    className="p-1.5 rounded-lg border border-[#EFE8DE] hover:bg-[#F4EFE3] disabled:opacity-40 text-[#3A342E]"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 3: MONGODB AUDIT & REAL-TIME LOGS */}
      {activeTab === "logs" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#EFE8DE] card-shadow overflow-hidden">
            <div className="p-6 border-b border-[#EFE8DE] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F4EFE3]/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBF0E6] text-[#6F8867] flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-serif font-bold text-[#3A342E]">MongoDB Sign-In / Sign-Out Audit Trail</h2>
                  <p className="text-xs text-[#6B6259]">Real-time session events captured in collection <code className="font-mono bg-[#EBF0E6] text-[#6F8867] px-1 rounded">auth_logs</code></p>
                </div>
              </div>
              <button
                onClick={fetchLogs}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F4EFE3] border border-[#EFE8DE] text-[#3A342E] text-xs font-semibold transition card-shadow"
              >
                Refresh Logs
              </button>
            </div>

            {/* Sub-tab Switcher: Auth Logs vs AI Chat Conversations */}
            <div className="px-6 pt-3 border-b border-[#EFE8DE] flex items-center space-x-3 bg-[#FBF6F0]/50">
              <button
                onClick={() => setLogsSubTab("auth")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
                  logsSubTab === "auth"
                    ? "border-[#6F8867] text-[#6F8867]"
                    : "border-transparent text-[#6B6259] hover:text-[#3A342E]"
                }`}
              >
                Sign-In & Session Audit ({auditLogs.auth_logs?.length || 0})
              </button>
              <button
                onClick={() => setLogsSubTab("chat")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition ${
                  logsSubTab === "chat"
                    ? "border-[#6F8867] text-[#6F8867]"
                    : "border-transparent text-[#6B6259] hover:text-[#3A342E]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Assistant Conversations ({auditLogs.chat_logs?.length || 0})</span>
              </button>
            </div>

            {logsLoading ? (
              <div className="py-12 text-center text-[#6B6259] text-xs">
                <div className="w-6 h-6 rounded-full border-2 border-[#8FA688] border-t-transparent animate-spin mx-auto mb-2" />
                Fetching MongoDB audit events...
              </div>
            ) : logsSubTab === "auth" ? (
              /* AUTH LOGS TABLE */
              !auditLogs.auth_logs || auditLogs.auth_logs.length === 0 ? (
                <div className="p-8 text-center text-[#6B6259] text-xs space-y-2">
                  <p className="font-bold text-[#3A342E]">MongoDB auth logging initialized.</p>
                  <p className="text-[#6B6259]">Sign-in, sign-out, and registration events for this company will automatically display here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#EFE8DE] text-[#6B6259] font-bold uppercase tracking-wider text-[11px] bg-[#F4EFE3]/50">
                        <th className="py-3 px-6">Event</th>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-6 text-right">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE8DE] text-[#3A342E]">
                      {auditLogs.auth_logs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-[#FBF6F0]/80 transition">
                          <td className="py-3 px-6 whitespace-nowrap">
                            {log.event_type === "SIGN_IN" && (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EBF0E6] text-[#6F8867] border border-[#DCE5D5]">
                                <LogIn className="w-3 h-3 text-[#6F8867]" />
                                <span>Sign In</span>
                              </span>
                            )}
                            {log.event_type === "SIGN_OUT" && (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F4EFE3] text-[#6B6259] border border-[#EFE8DE]">
                                <LogOut className="w-3 h-3 text-[#6B6259]" />
                                <span>Sign Out</span>
                              </span>
                            )}
                            {log.event_type?.includes("REGISTER") && (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EBF0E6] text-[#3A342E] border border-[#DCE5D5]">
                                <UserPlus className="w-3 h-3 text-[#8FA688]" />
                                <span>Register</span>
                              </span>
                            )}
                            {log.event_type?.includes("PROVISION") && (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EBF0E6] text-[#6F8867] border border-[#DCE5D5]">
                                <UserPlus className="w-3 h-3 text-[#6F8867]" />
                                <span>HR Provisioned</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-[#3A342E]">{log.name}</td>
                          <td className="py-3 px-4 font-mono text-[#6B6259]">{log.email}</td>
                          <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F4EFE3] text-[#3A342E]">{log.role}</span></td>
                          <td className="py-3 px-4 text-[#6B6259] whitespace-nowrap">{formatTimeAgo(log.timestamp)}</td>
                          <td className="py-3 px-6 text-right font-mono text-[11px] text-[#A8A095]">{log.ip_address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              /* CHAT CONVERSATIONS LOGS TABLE */
              !auditLogs.chat_logs || auditLogs.chat_logs.length === 0 ? (
                <div className="p-8 text-center text-[#6B6259] text-xs space-y-2">
                  <p className="font-bold text-[#3A342E]">No AI Assistant queries logged yet.</p>
                  <p className="text-[#6B6259]">When employees in this company query the AI Assistant, real-time conversation questions and grounded answers will be streamed here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#EFE8DE] text-[#6B6259] font-bold uppercase tracking-wider text-[11px] bg-[#F4EFE3]/50">
                        <th className="py-3 px-6">User / Employee</th>
                        <th className="py-3 px-4">Question Asked</th>
                        <th className="py-3 px-4">Grounded AI Answer</th>
                        <th className="py-3 px-4">Cited Documents</th>
                        <th className="py-3 px-6 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE8DE] text-[#3A342E]">
                      {auditLogs.chat_logs.map((cLog, idx) => (
                        <tr key={idx} className="hover:bg-[#FBF6F0]/80 transition">
                          <td className="py-3 px-6 whitespace-nowrap">
                            <p className="font-bold text-[#3A342E]">{cLog.user_name || "Employee"}</p>
                            <p className="text-[10px] font-mono text-[#6B6259]">{cLog.user_email}</p>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <p className="font-medium text-[#3A342E] truncate">{cLog.question}</p>
                          </td>
                          <td className="py-3 px-4 max-w-sm">
                            <p className="text-[#6B6259] line-clamp-2">{cLog.answer}</p>
                          </td>
                          <td className="py-3 px-4">
                            {cLog.sources && cLog.sources.length > 0 ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#EBF0E6] text-[#6F8867] text-[10px] font-semibold border border-[#DCE5D5]">
                                <FileText className="w-3 h-3" />
                                <span>{cLog.sources.length} Docs Cited</span>
                              </span>
                            ) : (
                              <span className="text-[#A8A095] text-[11px]">Direct</span>
                            )}
                          </td>
                          <td className="py-3 px-6 text-right whitespace-nowrap text-[#6B6259]">
                            {formatTimeAgo(cLog.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* 4. MODAL FOR UPLOADING DOCUMENTS */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-[#3A342E]/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 popover-shadow border border-[#EFE8DE] space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE8DE]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBF0E6] text-[#6F8867] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#3A342E]">Upload Company Document</h3>
                  <p className="text-xs text-[#6B6259]">PDF, DOCX, TXT with automatic Qdrant indexing</p>
                </div>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-1.5 rounded-lg text-[#6B6259] hover:text-[#3A342E] hover:bg-[#F4EFE3] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error in modal */}
            {uploadError && (
              <div className="bg-[#FFF5F5] border border-[#FED7D7] text-[#C53030] px-4 py-3 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-[#C53030] shrink-0" />
                  <span>{uploadError}</span>
                </div>
                <button onClick={() => setUploadError(null)} className="font-bold ml-2">✕</button>
              </div>
            )}

            {/* Drag and Drop Zone */}
            <label className="border-2 border-dashed border-[#EFE8DE] hover:border-[#8FA688] bg-[#FBF6F0] hover:bg-[#F4EFE3]/50 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition text-center group card-shadow">
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#EFE8DE] group-hover:border-[#8FA688] flex items-center justify-center text-[#8FA688] mb-3 shadow-2xs transition group-hover:scale-105">
                <Upload className={`w-7 h-7 ${uploading ? "animate-bounce" : ""}`} />
              </div>
              <span className="text-sm font-bold text-[#3A342E]">
                {uploading ? "Processing text, extracting chunks & generating Qdrant vectors..." : "Click to select a file from your computer"}
              </span>
              <span className="text-xs text-[#6B6259] mt-1.5">
                Supported formats: <strong className="text-[#3A342E] font-semibold">PDF, DOCX, TXT, MD</strong> (up to 25MB)
              </span>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#6F8867] font-medium">
                  <span>Generating embeddings with MiniLM-L6-v2...</span>
                  <span>Working...</span>
                </div>
                <div className="w-full bg-[#EBF0E6] rounded-full h-2 overflow-hidden">
                  <div className="bg-[#8FA688] h-2 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#EFE8DE] text-[#6B6259] hover:bg-[#F4EFE3] text-xs font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT INSPECTION MODAL */}
      {viewDoc && (
        <div className="fixed inset-0 bg-[#3A342E]/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 popover-shadow border border-[#EFE8DE] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE8DE]">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EBF0E6] text-[#6F8867] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#3A342E]">Document Metadata</h3>
                  <p className="text-[11px] text-[#6B6259]">Vector isolation details</p>
                </div>
              </div>
              <button
                onClick={() => setViewDoc(null)}
                className="p-1.5 rounded-lg text-[#6B6259] hover:text-[#3A342E] hover:bg-[#F4EFE3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-[#3A342E] bg-[#FBF6F0] p-4 rounded-2xl border border-[#EFE8DE] font-mono">
              <div className="flex justify-between">
                <span className="text-[#A8A095]">File Name:</span>
                <span className="font-semibold text-[#3A342E] truncate max-w-[200px]">{viewDoc.filename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A8A095]">Tenant ID:</span>
                <span className="text-[#6F8867] font-bold">{viewDoc.company_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A8A095]">Vector Chunks:</span>
                <span className="font-semibold">{viewDoc.chunk_count} partitions in Qdrant</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A8A095]">Status:</span>
                <span className="text-[#6F8867] font-bold">{viewDoc.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A8A095]">Uploaded Date:</span>
                <span>{formatDate(viewDoc.created_at)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewDoc(null)}
                className="px-5 py-2.5 rounded-xl bg-[#8FA688] hover:bg-[#6F8867] text-white text-xs font-semibold shadow-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. HR PROVISION NEW EMPLOYEE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#3A342E]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-[#EFE8DE] popover-shadow max-w-md w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#EFE8DE] pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EBF0E6] text-[#6F8867] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#3A342E]">Provision New Employee</h3>
                  <p className="text-xs text-[#6B6259]">HR-Controlled Account Creation</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-[#6B6259] hover:text-[#3A342E] hover:bg-[#F4EFE3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner */}
            {createError && (
              <div className="p-3.5 rounded-xl bg-[#FFF5F5] border border-[#FED7D7] text-[#C53030] text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
                <button onClick={() => setCreateError(null)}>✕</button>
              </div>
            )}

            {/* SUCCESS CREDENTIALS VIEW */}
            {createdCredentials ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#EBF0E6] border border-[#DCE5D5] space-y-2 text-center">
                  <div className="w-8 h-8 rounded-full bg-[#6F8867] text-white flex items-center justify-center mx-auto">
                    <Check className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif font-bold text-[#3A342E] text-sm">Account Created Successfully!</h4>
                  <p className="text-xs text-[#6B6259]">
                    Provide these credentials to the employee so they can sign into the Employee Portal.
                  </p>
                </div>

                <div className="bg-[#FBF6F0] p-4 rounded-2xl border border-[#EFE8DE] space-y-2.5 text-xs font-mono">
                  <div>
                    <span className="text-[#A8A095] block text-[10px] uppercase font-sans font-bold">Employee Name</span>
                    <span className="font-semibold text-[#3A342E] font-sans">{createdCredentials.name}</span>
                  </div>
                  <div>
                    <span className="text-[#A8A095] block text-[10px] uppercase font-sans font-bold">Work Email</span>
                    <span className="font-bold text-[#6F8867]">{createdCredentials.email}</span>
                  </div>
                  <div>
                    <span className="text-[#A8A095] block text-[10px] uppercase font-sans font-bold">Temporary Password</span>
                    <span className="font-bold text-[#3A342E]">{createdCredentials.password}</span>
                  </div>
                  <div>
                    <span className="text-[#A8A095] block text-[10px] uppercase font-sans font-bold">Portal Access URL</span>
                    <span className="text-[#6B6259]">{typeof window !== "undefined" ? window.location.origin : "http://localhost:5173"}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
                    const text = `HR Multi Account Created!\n\nEmail: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.password}\nPortal Link: ${origin}\n\nPlease log in through the Employee Sign-In portal.`;
                    navigator.clipboard.writeText(text);
                    setCopiedCreds(true);
                    setTimeout(() => setCopiedCreds(false), 2500);
                  }}
                  className="w-full py-3 rounded-xl bg-[#6F8867] hover:bg-[#5C7255] text-white font-semibold text-xs transition flex items-center justify-center space-x-2"
                >
                  {copiedCreds ? <Check className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
                  <span>{copiedCreds ? "Copied to Clipboard!" : "Copy Login Info for Employee"}</span>
                </button>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setActiveTab("employees");
                      setActiveEmpPage(1);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#6F8867] hover:bg-[#5C7255] text-white font-semibold text-xs transition shadow-xs text-center cursor-pointer"
                  >
                    View in Employee Directory
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#EFE8DE] hover:bg-[#F4EFE3] text-[#3A342E] font-semibold text-xs transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <p className="text-[11px] text-[#6F8867] text-center font-medium">
                  ✓ Employee Directory was automatically refreshed
                </p>
              </div>
            ) : (
              /* CREATE EMPLOYEE FORM */
              <form onSubmit={handleCreateEmployeeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3A342E] mb-1">
                    Employee Full Name <span className="text-[#8FA688]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    placeholder="e.g. Maya Chen"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE8DE] bg-[#FFFFFF] text-[#3A342E] text-xs focus:outline-none focus:border-[#8FA688] focus:ring-1 focus:ring-[#8FA688]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3A342E] mb-1">
                    Work Email Address <span className="text-[#8FA688]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmpEmail}
                    onChange={(e) => setNewEmpEmail(e.target.value)}
                    placeholder="e.g. maya.chen@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE8DE] bg-[#FFFFFF] text-[#3A342E] text-xs focus:outline-none focus:border-[#8FA688] focus:ring-1 focus:ring-[#8FA688]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3A342E] mb-1">
                    Role / Job Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={newEmpTitle}
                    onChange={(e) => setNewEmpTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Developer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE8DE] bg-[#FFFFFF] text-[#3A342E] text-xs focus:outline-none focus:border-[#8FA688] focus:ring-1 focus:ring-[#8FA688]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3A342E] mb-1">
                    Initial Password
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmpPassword}
                    onChange={(e) => setNewEmpPassword(e.target.value)}
                    placeholder="Demo1234!"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE8DE] bg-[#FFFFFF] text-[#3A342E] text-xs font-mono focus:outline-none focus:border-[#8FA688] focus:ring-1 focus:ring-[#8FA688]"
                  />
                  <p className="text-[11px] text-[#A8A095] mt-1">Default is set to Demo1234!</p>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#EFE8DE] text-xs font-semibold text-[#6B6259] hover:bg-[#F4EFE3] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-5 py-2.5 rounded-xl bg-[#6F8867] hover:bg-[#5C7255] text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
                  >
                    {createLoading ? "Creating Account..." : "Create & Provision Account"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 6. EMPLOYEE AI CONVERSATION HISTORY MODAL */}
      {selectedEmployeeChat && (
        <div className="fixed inset-0 bg-[#3A342E]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-[#EFE8DE] popover-shadow max-w-2xl w-full p-6 sm:p-8 space-y-5 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EFE8DE] pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EBF0E6] text-[#6F8867] flex items-center justify-center font-bold text-sm border border-[#DCE5D5]">
                  {selectedEmployeeChat.name?.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase() || "EM"}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-serif font-bold text-[#3A342E]">
                      {selectedEmployeeChat.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F4EFE3] text-[#6B6259]">
                      {selectedEmployeeChat.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6259] font-mono">{selectedEmployeeChat.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployeeChat(null)}
                className="p-1.5 rounded-lg text-[#6B6259] hover:text-[#3A342E] hover:bg-[#F4EFE3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversation Sub-header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#8FA688]" />
                <span className="text-xs font-semibold text-[#3A342E]">
                  AI Assistant Conversations & Queries
                </span>
              </div>
              <span className="text-xs font-mono font-semibold text-[#6F8867] bg-[#EBF0E6] px-2.5 py-0.5 rounded-full border border-[#DCE5D5]">
                {empChatData?.conversations?.length || 0} Questions Logged
              </span>
            </div>

            {/* Conversation Content Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {empChatLoading ? (
                <div className="py-16 text-center text-[#6B6259] text-xs">
                  <div className="w-8 h-8 rounded-full border-2 border-[#8FA688] border-t-transparent animate-spin mx-auto mb-3" />
                  Loading past conversation history...
                </div>
              ) : empChatError ? (
                <div className="p-4 rounded-2xl bg-[#FFF5F5] border border-[#FED7D7] text-[#C53030] text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{empChatError}</span>
                </div>
              ) : !empChatData?.conversations || empChatData.conversations.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F4EFE3] text-[#8FA688] flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-bold text-[#3A342E] text-sm">
                    No Past AI Conversations Yet
                  </h4>
                  <p className="text-xs text-[#6B6259] max-w-sm mx-auto">
                    {selectedEmployeeChat.name} has not asked any policy questions to the AI HR Assistant yet. When they interact with the assistant, all questions, grounded answers, and verified source documents will be tracked here.
                  </p>
                </div>
              ) : (
                empChatData.conversations.map((conv, idx) => (
                  <div
                    key={conv.id || idx}
                    className="p-4 rounded-2xl border border-[#EFE8DE] bg-[#FBF6F0]/60 space-y-3 text-xs card-shadow"
                  >
                    {/* User Question */}
                    <div className="flex items-start space-x-2.5">
                      <div className="w-6 h-6 rounded-lg bg-[#3A342E] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        Q
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#3A342E] text-xs sm:text-sm">
                          {conv.question}
                        </p>
                        <span className="text-[10px] text-[#A8A095]">
                          {formatTimeAgo(conv.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* AI Answer */}
                    <div className="flex items-start space-x-2.5 pl-2 border-l-2 border-[#8FA688]">
                      <div className="w-6 h-6 rounded-lg bg-[#8FA688] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        AI
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-[#3A342E] leading-relaxed whitespace-pre-line">
                          {conv.answer}
                        </p>

                        {/* Citations if any */}
                        {conv.sources && conv.sources.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {conv.sources.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-[#DCE5D5] text-[10px] text-[#6F8867] font-medium"
                              >
                                <FileText className="w-3 h-3" />
                                <span className="truncate max-w-[200px]">
                                  {s.filename || s.doc_title || "Company Policy"}
                                </span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#EFE8DE]">
              <span className="text-[11px] text-[#A8A095]">
                Strictly partitioned by tenant company
              </span>
              <button
                onClick={() => setSelectedEmployeeChat(null)}
                className="px-5 py-2 rounded-xl bg-[#8FA688] hover:bg-[#6F8867] text-white text-xs font-semibold shadow-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

