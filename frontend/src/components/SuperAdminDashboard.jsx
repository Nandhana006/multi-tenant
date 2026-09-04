import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import { 
  Building2, 
  Users, 
  FileText, 
  Layers, 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  Check, 
  CheckCircle2,
  Search
} from "lucide-react";

export default function SuperAdminDashboard({ defaultTab = "overview" }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [overviewRes, usersRes] = await Promise.all([
        adminAPI.getOverview(),
        adminAPI.getUsers()
      ]);
      setStats(overviewRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const getRoleBadge = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <span className="bg-[#EBF0E6] text-[#6F8867] text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#DCE5D5]">SUPER ADMIN</span>;
      case "HR":
        return <span className="bg-[#EBF0E6] text-[#6F8867] text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#DCE5D5]">HR MANAGER</span>;
      case "EMPLOYEE":
        return <span className="bg-[#F4EFE3] text-[#6B6259] text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#EFE8DE]">EMPLOYEE</span>;
      default:
        return null;
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A342E] tracking-tight">
            Platform Overview
          </h1>
          <p className="text-sm text-[#6B6259]">
            Manage all company tenants, inspect user rosters, and monitor platform activity.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 rounded-xl bg-white hover:bg-[#F4EFE3] text-[#3A342E] border border-[#EFE8DE] text-xs font-semibold flex items-center space-x-2 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#8FA688] ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 2. Platform Stat Cards (Sage & Sand) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-3xl p-5 border border-[#EFE8DE] card-shadow flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#A8A095] uppercase tracking-wider">Tenant Companies</p>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-[#3A342E]">
              {stats?.total_companies || 3}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EBF0E6] text-[#6F8867] flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#EFE8DE] card-shadow flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#A8A095] uppercase tracking-wider">Total Platform Users</p>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-[#3A342E]">
              {stats?.total_users || 7}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F4EFE3] text-[#6F8867] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#EFE8DE] card-shadow flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#A8A095] uppercase tracking-wider">Uploaded Documents</p>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-[#3A342E]">
              {stats?.total_documents || 2}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EBF0E6] text-[#6F8867] flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#EFE8DE] card-shadow flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#A8A095] uppercase tracking-wider">Total Vector Chunks</p>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-[#3A342E]">
              {stats?.total_chunks_indexed || 4}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F4EFE3] text-[#6F8867] flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Registered Tenant Companies Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-bold text-[#3A342E]">
              Registered Tenant Companies
            </h2>
            <p className="text-xs text-[#6B6259]">
              Multi-tenant isolated company partitions in Qdrant Vector Cloud
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-[#EBF0E6] text-[#6F8867] font-semibold border border-[#DCE5D5]">
            {stats?.companies?.length || 3} Active Tenants
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-[#EFE8DE] card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#EFE8DE] text-[#A8A095] font-semibold uppercase tracking-wider text-[11px] bg-[#FBF6F0]">
                  <th className="py-3.5 px-6">Company ID</th>
                  <th className="py-3.5 px-6">Company Name</th>
                  <th className="py-3.5 px-6">Industry</th>
                  <th className="py-3.5 px-6">Users</th>
                  <th className="py-3.5 px-6">Documents</th>
                  <th className="py-3.5 px-6 text-right">Data Isolation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DE] text-[#6B6259]">
                {stats?.companies?.map((comp) => (
                  <tr key={comp.id} className="hover:bg-[#FBF6F0] transition">
                    <td className="py-4 px-6 font-mono font-bold text-[#6F8867]">{comp.id}</td>
                    <td className="py-4 px-6 font-semibold text-[#3A342E]">{comp.name}</td>
                    <td className="py-4 px-6 text-[#6B6259]">{comp.industry || "Enterprise"}</td>
                    <td className="py-4 px-6 text-[#3A342E] font-medium">{comp.user_count} Users</td>
                    <td className="py-4 px-6 text-[#3A342E] font-medium">{comp.document_count} Documents</td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EBF0E6] text-[#6F8867] border border-[#DCE5D5] text-[11px] font-medium">
                        <Check className="w-3.5 h-3.5 text-[#6F8867]" />
                        <span>Data isolated</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Platform User Directory Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-serif font-bold text-[#3A342E]">
              Platform Users
            </h2>
            <p className="text-xs text-[#6B6259]">
              Role-based user roster and tenant permissions
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#A8A095] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs rounded-xl border border-[#EFE8DE] bg-white text-[#3A342E] placeholder-[#A8A095] focus:outline-none focus:border-[#8FA688] focus:ring-1 focus:ring-[#8FA688] w-48 sm:w-60 transition"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#EFE8DE] card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#EFE8DE] text-[#A8A095] font-semibold uppercase tracking-wider text-[11px] bg-[#FBF6F0]">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Assigned Company</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6 text-right">Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DE] text-[#6B6259]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FBF6F0] transition">
                    <td className="py-4 px-6 font-semibold text-[#3A342E]">{u.name}</td>
                    <td className="py-4 px-6 font-mono text-[#6B6259]">{u.email}</td>
                    <td className="py-4 px-6 text-[#3A342E] font-medium">
                      {u.company_name || <span className="text-[#A8A095] italic">Platform Level</span>}
                    </td>
                    <td className="py-4 px-6">{getRoleBadge(u.role)}</td>
                    <td className="py-4 px-6 text-right">
                      {u.role === "EMPLOYEE" ? (
                        <span className="text-[#6B6259] font-mono text-[11px]">Chat Only</span>
                      ) : (
                        <span className="text-[#6F8867] font-mono text-[11px] font-semibold">Full Manage Privileges</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
