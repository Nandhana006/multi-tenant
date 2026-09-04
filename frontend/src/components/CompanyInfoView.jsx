import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  Database, 
  FileText, 
  Users, 
  CheckCircle2, 
  Sparkles,
  Check,
  Calendar,
  HeartHandshake,
  Laptop,
  GraduationCap,
  Mail,
  MapPin,
  Clock,
  Phone,
  Briefcase,
  Compass,
  Award,
  Globe
} from "lucide-react";

export default function CompanyInfoView({ onNavigateToDocuments, onNavigateToChat }) {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");

  const companyDatabase = {
    comp_apex: {
      name: "Apex Corp",
      tagline: "Institutional Investment & Global Wealth Management",
      legalName: "Apex Financial Holdings Inc.",
      industry: "Financial Services & Investment Banking",
      size: "350+ Full-Time Employees",
      hq: "One World Trade Center, New York, NY 10007, USA",
      branches: ["London (Canary Wharf)", "Singapore (Marina Bay)", "Zurich (Paradeplatz)"],
      established: "2018",
      website: "https://apex.enterprise-hr.internal",
      mission: "To deliver transparent, institutional-grade financial intelligence while empowering our global workforce with world-class benefits and growth opportunities.",
      values: ["Integrity First", "Fiduciary Excellence", "Autonomous Innovation", "Radical Transparency"],
      hrTeam: [
        { name: "Priya Sharma", role: "Head of People & Culture", email: "hr.a@demo.com", office: "New York HQ · Floor 42", hours: "9:00 AM – 5:00 PM EST" },
        { name: "Marcus Vance", role: "Talent & Benefits Partner", email: "benefits@apex.demo", office: "New York HQ · Floor 42", hours: "10:00 AM – 6:00 PM EST" },
        { name: "Sarah Jenkins", role: "Employee Relations Specialist", email: "relations@apex.demo", office: "London Branch", hours: "9:00 AM – 5:00 PM GMT" }
      ],
      leavePolicy: {
        annualPTO: "20 Paid Days / Year (accrues at 1.67 days/month)",
        rollover: "Up to 5 unused PTO days can roll over to Q1 of the next calendar year",
        sickLeave: "10 Paid Sick & Wellness Days annually (no doctor's note for under 2 consecutive days)",
        parentalLeave: "16 Weeks fully paid maternity leave, 12 weeks fully paid secondary caregiver leave",
        bereavement: "5 Days for immediate family, 3 days for extended family",
        publicHolidays: "11 US Federal Holidays + 2 Floating Cultural Holidays of employee choice"
      },
      healthAndBenefits: {
        medicalPlan: "80% Apex Care Comprehensive Plan (UnitedHealthcare Network) with $250 individual deductible",
        dentalVision: "100% preventive dental cleanings twice a year; $350 annual eyewear / contact lens allowance",
        mentalHealth: "Free subscription to Calm & Headspace, plus 12 free 1-on-1 therapy sessions via Spring Health",
        lifeInsurance: "2x Annual Base Salary coverage provided at zero cost to the employee",
        retirement: "401(k) with 100% employer match up to 5% of base salary, immediate 100% vesting"
      },
      workplaceAndPerks: {
        model: "Hybrid Workplace Model (minimum 3 days in office, 2 flexible remote days)",
        officeStipend: "$1,000 one-time ergonomic home office equipment reimbursement upon joining",
        internetMobile: "$80 monthly reimbursement for high-speed home internet and business mobile plan",
        learningBudget: "$2,000 annual professional development grant for certifications, CFA/MBA courses, or conferences",
        commuterPerks: "Pre-tax transit pass deduction + $150 monthly public transit subsidy"
      }
    },
    comp_nexus: {
      name: "Nexus Tech",
      tagline: "Next-Generation Autonomous Cloud & AI Architecture",
      legalName: "Nexus Technologies Global Inc.",
      industry: "Enterprise AI & Cloud Infrastructure",
      size: "180+ Distributed Engineers & Researchers",
      hq: "500 Howard Street, San Francisco, CA 94105, USA",
      branches: ["Seattle, WA", "Berlin, Germany", "Bengaluru, India (Remote Hub)"],
      established: "2021",
      website: "https://nexus.enterprise-hr.internal",
      mission: "To build autonomous AI infrastructure that scales human ingenuity across the globe with an open, remote-first engineering culture.",
      values: ["Move with Intention", "Customer Obsessed", "Continuous Learning", "Asynchronous Default"],
      hrTeam: [
        { name: "Nandhana Menon", role: "VP of People Operations", email: "hr.b@demo.com", office: "San Francisco / Remote", hours: "9:00 AM – 6:00 PM PST" },
        { name: "Alex Rivera", role: "Global Total Rewards Lead", email: "rewards@nexus.demo", office: "Berlin / Remote", hours: "9:00 AM – 5:00 PM CET" },
        { name: "Meera Tiwari", role: "Culture & Community Partner", email: "culture@nexus.demo", office: "San Francisco", hours: "9:00 AM – 5:00 PM PST" }
      ],
      leavePolicy: {
        annualPTO: "30 Paid Days / Year with Flexible Scheduling (no penalty for rollover)",
        rollover: "Zero expiry — rollover up to 10 days or convert into cash bonus at year-end",
        sickLeave: "Unlimited Wellness & Mental Health days (trust-based system)",
        parentalLeave: "20 Weeks fully paid parental leave for all new parents regardless of gender or birth/adoption",
        bereavement: "7 Days compassionate paid leave for family needs",
        publicHolidays: "Local country public holidays according to your contractual country of residence"
      },
      healthAndBenefits: {
        medicalPlan: "100% Nexus Health Elite Comprehensive Coverage (Zero employee premium contribution)",
        dentalVision: "Comprehensive dental including orthodontics; $500 annual vision care stipend",
        mentalHealth: "Unlimited confidential counseling through Modern Health + annual wellness retreat sponsorship",
        lifeInsurance: "3x Annual Base Salary life insurance and full accidental disability protection",
        retirement: "401(k) / Pension Match up to 6% of base salary with immediate vesting"
      },
      workplaceAndPerks: {
        model: "100% Remote-First Culture with asynchronous communication and quarterly global offsites",
        officeStipend: "$1,500 initial home workspace budget + $500 annual refresh grant",
        internetMobile: "$120 monthly stipend for high-speed fiber internet and cell phone bill",
        learningBudget: "$3,000 annual budget for AI research papers, courses, books, and conference travel",
        coworking: "Full WeWork All-Access membership or local co-working pass fully subsidized"
      }
    },
    comp_global: {
      name: "Global Logistics",
      tagline: "Multi-Modal Freight & Global Cold Chain Distribution",
      legalName: "Global Logistics & Maritime Solutions LLC",
      industry: "Supply Chain, Freight & Maritime Shipping",
      size: "750+ Fleet Drivers & Logistics Coordinators",
      hq: "200 South Michigan Avenue, Chicago, IL 60604, USA",
      branches: ["Long Beach (Port of LA)", "Rotterdam (Netherlands)", "Hamburg (Germany)"],
      established: "2015",
      website: "https://global.enterprise-hr.internal",
      mission: "To deliver essential freight and temperature-controlled medical supplies globally with unmatched safety, reliability, and care for our operators.",
      values: ["Safety Without Compromise", "Operational Precision", "Frontline First", "Reliable Service"],
      hrTeam: [
        { name: "Ananya Iyer", role: "Director of Workforce Operations", email: "hr.c@demo.com", office: "Chicago Operations Hub", hours: "8:00 AM – 5:00 PM CST" },
        { name: "David Miller", role: "Safety & Compliance Officer", email: "safety@global.demo", office: "Chicago Operations Hub", hours: "7:00 AM – 4:00 PM CST" }
      ],
      leavePolicy: {
        annualPTO: "22 Paid Days / Year structured by shift rosters",
        rollover: "Up to 5 unused PTO days can be rolled over or paid out annually",
        sickLeave: "12 Paid Sick Days annually with automated shift coverage",
        parentalLeave: "14 Weeks fully paid maternity leave, 8 weeks paid paternity leave",
        bereavement: "5 Days paid compassionate leave",
        publicHolidays: "10 US Federal Holidays + Shift Overtime premium rates (1.5x)"
      },
      healthAndBenefits: {
        medicalPlan: "Global Standard Health Plus (BlueCross BlueShield Network) with comprehensive coverage",
        dentalVision: "Standard preventive dental + annual vision exam and prescription eyewear allowance",
        mentalHealth: "24/7 Dispatch & Frontline Employee Assistance Helpline",
        lifeInsurance: "2x Annual Base Salary life insurance + specialized hazardous freight coverage",
        retirement: "401(k) retirement plan with 4% matching contribution"
      },
      workplaceAndPerks: {
        model: "On-Site Shift & Logistics Hub (Dispatch & Regional Operations)",
        officeStipend: "Safety boot & gear allowance ($300/year) + high-visibility winter outerwear provided",
        internetMobile: "$60 monthly communication allowance for shift coordinators",
        learningBudget: "$1,200 annual commercial license & hazardous materials safety certification sponsorship",
        commuterPerks: "Free on-site parking at all regional distribution terminals"
      }
    }
  };

  const details = companyDatabase[user?.company_id] || {
    name: user?.company_name || "Enterprise Company",
    tagline: "Dedicated Organization Workspace",
    legalName: `${user?.company_name || "Enterprise"} Inc.`,
    industry: "Enterprise Technology & Services",
    size: "Registered Corporate Tenant",
    hq: "Corporate Headquarters",
    branches: ["Regional Offices"],
    established: "2024",
    website: "https://internal.enterprise-hr.internal",
    mission: `To empower ${user?.company_name || "our company"} team with verified knowledge, high-performing tools, and secure AI collaboration.`,
    values: ["Customer Excellence", "Integrity", "Innovation", "Continuous Growth"],
    hrTeam: [
      { name: "Human Resources Lead", role: "People Operations Manager", email: "hr@company.com", office: "HQ Office", hours: "9:00 AM – 5:00 PM" }
    ],
    leavePolicy: {
      annualPTO: "20 Paid Days / Year (Standard Company Allocation)",
      rollover: "Standard 5 days rollover to Q1 of subsequent calendar year",
      sickLeave: "10 Paid Sick & Wellness Days annually",
      parentalLeave: "12 Weeks fully paid parental leave",
      bereavement: "5 Days compassionate leave",
      publicHolidays: "Standard National Calendar Holidays"
    },
    healthAndBenefits: {
      medicalPlan: "Corporate Comprehensive Medical Coverage Plan",
      dentalVision: "Preventive Dental & Annual Vision Benefit",
      mentalHealth: "Employee Assistance Program & Confidential Counseling",
      lifeInsurance: "2x Base Salary life insurance coverage",
      retirement: "Company Sponsored Retirement / 401(k) Plan with Match"
    },
    workplaceAndPerks: {
      model: "Standard Workplace Policy as established by Company HR",
      officeStipend: "$1,000 Ergonomic workspace allowance",
      internetMobile: "$75 Monthly connectivity reimbursement",
      learningBudget: "$1,500 Annual professional learning stipend",
      coworking: "Access to flex workspace passes"
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white rounded-3xl border border-[#EFE8DE] card-shadow p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EFE8DE] gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EBF0E6] text-[#6F8867] flex items-center justify-center shadow-xs">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A342E]">{details.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#EBF0E6] text-[#6F8867] border border-[#DCE5D5]">
                  {user?.company_id || "comp_apex"}
                </span>
              </div>
              <p className="text-xs text-[#6B6259] mt-0.5">{details.tagline}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#EBF0E6] text-[#6F8867] border border-[#DCE5D5] text-xs font-semibold">
              <Check className="w-4 h-4 text-[#6F8867]" />
              <span>Isolated Tenant Partition</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs for Company Knowledge Hub */}
        <div className="flex flex-wrap gap-2 pt-2 text-xs font-semibold">
          {[
            { id: "overview", label: "Corporate Overview", icon: Compass },
            { id: "hr_team", label: "HR & People Team", icon: Users },
            { id: "leave", label: "Leave & Holidays", icon: Calendar },
            { id: "health", label: "Healthcare & Benefits", icon: HeartHandshake },
            { id: "workplace", label: "Workplace & Perks", icon: Laptop },
            { id: "security", label: "Security & Vector DB", icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
                  isActive
                    ? "bg-[#8FA688] text-white shadow-xs"
                    : "bg-[#FBF6F0] text-[#6B6259] hover:text-[#3A342E] hover:bg-[#F4EFE3]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TAB CONTENT PANELS */}

      {/* TAB 1: CORPORATE OVERVIEW */}
      {activeSection === "overview" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-3xl border border-[#EFE8DE] card-shadow p-6 sm:p-8 space-y-4">
              <span className="text-[10px] font-bold text-[#A8A095] uppercase tracking-wider">Mission & Purpose</span>
              <h3 className="text-lg font-serif font-bold text-[#3A342E]">Company Mission Statement</h3>
              <p className="text-sm text-[#6B6259] leading-relaxed font-serif">
                "{details.mission}"
              </p>

              <div className="pt-4 border-t border-[#EFE8DE] space-y-3">
                <span className="text-[10px] font-bold text-[#A8A095] uppercase tracking-wider">Core Organizational Values</span>
                <div className="grid grid-cols-2 gap-3">
                  {details.values.map((v, i) => (
                    <div key={i} className="p-3 bg-[#FBF6F0] rounded-xl border border-[#EFE8DE] flex items-center space-x-2">
                      <Award className="w-4 h-4 text-[#8FA688]" />
                      <span className="text-xs font-bold text-[#3A342E]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Facts Sidebar */}
            <div className="bg-white rounded-3xl border border-[#EFE8DE] card-shadow p-6 space-y-4">
              <span className="text-[10px] font-bold text-[#A8A095] uppercase tracking-wider">Corporate Directory</span>
              
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#A8A095]">Legal Entity:</span>
                  <p className="font-semibold text-[#3A342E] mt-0.5">{details.legalName}</p>
                </div>
                <div>
                  <span className="text-[#A8A095]">Industry Sector:</span>
                  <p className="font-semibold text-[#3A342E] mt-0.5">{details.industry}</p>
                </div>
                <div>
                  <span className="text-[#A8A095]">Headcount:</span>
                  <p className="font-semibold text-[#3A342E] mt-0.5">{details.size}</p>
                </div>
                <div>
                  <span className="text-[#A8A095]">Established:</span>
                  <p className="font-semibold text-[#3A342E] mt-0.5">{details.established}</p>
                </div>
                <div>
                  <span className="text-[#A8A095]">Primary HQ:</span>
                  <p className="font-semibold text-[#3A342E] mt-0.5">{details.hq}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HR & PEOPLE TEAM */}
      {activeSection === "hr_team" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#EFE8DE] card-shadow p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#3A342E]">People Operations & HR Leadership</h3>
              <p className="text-xs text-[#6B6259] mt-0.5">
                Reach out to your dedicated People Partners for questions regarding payroll, benefits, and policy clarifications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {details.hrTeam.map((member, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[#FBF6F0] border border-[#EFE8DE] space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#EFE8DE] flex items-center justify-center text-[#8FA688] font-bold text-sm shadow-2xs">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-bold text-[#3A342E]">{member.name}</h4>
                      <p className="text-xs text-[#6F8867] font-semibold">{member.role}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-[#EFE8DE] text-xs text-[#6B6259]">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-[#8FA688]" />
                      <span className="font-mono text-[#3A342E]">{member.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-[#8FA688]" />
                      <span>{member.office}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-[#8FA688]" />
                      <span>{member.hours}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LEAVE & HOLIDAYS */}
      {activeSection === "leave" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#EFE8DE] card-shadow p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE8DE]">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#3A342E]">Comprehensive Leave & Time-Off Policy</h3>
                <p className="text-xs text-[#6B6259] mt-0.5">
                  Official time-off standards, sick days, rollover terms, and holiday schedules.
                </p>
              </div>
              <button
                onClick={() => onNavigateToChat("How do I apply for annual leave and what are the rollover rules?")}
                className="px-4 py-2 rounded-xl bg-[#8FA688] hover:bg-[#6F8867] text-white text-xs font-semibold flex items-center space-x-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI About Leave</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-[#FBF6F0] border border-[#EFE8DE] space-y-2">
                <div className="flex items-center space-x-2 text-[#6F8867] font-bold">
                  <Calendar className="w-4 h-4" />
                  <span>Annual Paid Time Off (PTO)</span>
                </div>
                <p className="text-sm font-semibold text-[#3A342E]">{details.leavePolicy.annualPTO}</p>
                <p className="text-[#6B6259] text-[11px] leading-relaxed">{details.leavePolicy.rollover}</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FBF6F0] border border-[#EFE8DE] space-y-2">
                <div className="flex items-center space-x-2 text-[#6F8867] font-bold">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Sick & Wellness Leave</span>
                </div>
                <p className="text-sm font-semibold text-[#3A342E]">{details.leavePolicy.sickLeave}</p>
                <p className="text-[#6B6259] text-[11px] leading-relaxed">Covers physical illness, medical appointments, and mental wellbeing.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FBF6F0] border border-[#EFE8DE] space-y-2">
                <div className="flex items-center space-x-2 text-[#6F8867] font-bold">
                  <Users className="w-4 h-4" />
                  <span>Parental & Family Leave</span>
                </div>
                <p className="text-sm font-semibold text-[#3A342E]">{details.leavePolicy.parentalLeave}</p>
                <p className="text-[#6B6259] text-[11px] leading-relaxed">Applicable to biological birth, adoption, and legal guardianship.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FBF6F0] border border-[#EFE8DE] space-y-2">
                <div className="flex items-center space-x-2 text-[#6F8867] font-bold">
                  <Globe className="w-4 h-4" />
                  <span>Public & Floating Holidays</span>
                </div>
                <p className="text-sm font-semibold text-[#3A342E]">{details.leavePolicy.publicHolidays}</p>
                <p className="text-[#6B6259] text-[11px] leading-relaxed">Plus {details.leavePolicy.bereavement} for compassionate bereavement leave.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HEALTHCARE & BENEFITS */}
      {activeSection === "health" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#EFE8DE] card-shadow p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE8DE]">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#3A342E]">Healthcare, Insurance & Wellness Benefits</h3>
                <p className="text-xs text-[#6B6259] mt-0.5">
                  Comprehensive coverage for medical, dental, vision, life insurance, and retirement.
                </p>
              </div>
              <button
                onClick={() => onNavigateToChat("What are our medical and health insurance coverage limits?")}
                className="px-4 py-2 rounded-xl bg-[#8FA688] hover:bg-[#6F8867] text-white text-xs font-semibold flex items-center space-x-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI About Benefits</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-[#FBF6F0] border border-[#EFE8DE] space-y-1.5">
                <span className="text-[10px] font-bold text-[#A8A095] uppercase">Medical Plan</span>
                <p className="text-sm font-semibold text-[#3A342E]">{details.healthAndBenefits.medicalPlan}</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FBF6F0] border border-[#EFE8DE] space-y-1.5">
                <span className="text-[10px] font-bold text-[#A8A095] uppercase">Dental & Vision</span>
                <p className="text-sm font-semibold text-[#3A342E]">{details.healthAndBenefits.dentalVision}</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FBF6F0] border border-[#EFE8DE] space-y-1.5">
                <span className="text-[10px] font-bold text-[#A8A095] uppercase">Mental Health & EAP</span>
                <p className="text-sm font-semibold text-[#3A342E]">{details.healthAndBenefits.mentalHealth}</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FBF6F0] border border-[#EFE8DE] space-y-1.5">
                <span className="text-[10px] font-bold text-[#A8A095] uppercase">401(k) / Retirement Matching</span>
                <p className="text-sm font-semibold text-[#6F8867]">{details.healthAndBenefits.retirement}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: WORKPLACE & PERKS */}
      {activeSection === "workplace" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#EFE8DE] card-shadow p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#3A342E]">Workplace Culture & Employee Perks</h3>
              <p className="text-xs text-[#6B6259] mt-0.5">
                Work arrangements, equipment stipends, connectivity reimbursements, and growth grants.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-[#FBF6F0] border border-[#EFE8DE] space-y-2">
                <span className="text-[10px] font-bold text-[#A8A095] uppercase">Workplace Model</span>
                <p className="text-sm font-semibold text-[#3A342E]">{details.workplaceAndPerks.model}</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FBF6F0] border border-[#EFE8DE] space-y-2">
                <span className="text-[10px] font-bold text-[#A8A095] uppercase">Home Office Stipend</span>
                <p className="text-sm font-semibold text-[#3A342E]">{details.workplaceAndPerks.officeStipend}</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FBF6F0] border border-[#EFE8DE] space-y-2">
                <span className="text-[10px] font-bold text-[#A8A095] uppercase">Internet & Mobile Subsidy</span>
                <p className="text-sm font-semibold text-[#3A342E]">{details.workplaceAndPerks.internetMobile}</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FBF6F0] border border-[#EFE8DE] space-y-2">
                <span className="text-[10px] font-bold text-[#A8A095] uppercase">Learning & Development</span>
                <p className="text-sm font-semibold text-[#6F8867]">{details.workplaceAndPerks.learningBudget}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SECURITY & VECTOR DB */}
      {activeSection === "security" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#EFE8DE] card-shadow p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#3A342E] flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#8FA688]" />
              <span>Multi-Tenant Vector Isolation Guarantee</span>
            </h3>
            <p className="text-xs text-[#6B6259] leading-relaxed">
              All document vectors and embeddings for <strong>{details.name}</strong> are strictly segregated within Qdrant Vector Cloud using an enforced <code className="bg-[#EBF0E6] text-[#6F8867] px-2 py-0.5 rounded-md font-mono text-[11px] border border-[#DCE5D5]">company_id: "{user?.company_id}"</code> payload filter. Neither other tenants nor external employees can query or retrieve this organization's sensitive knowledge base.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-4 bg-[#FBF6F0] rounded-2xl border border-[#EFE8DE]">
                <span className="text-[10px] font-bold text-[#A8A095] uppercase">Vector Engine</span>
                <p className="font-semibold text-[#3A342E] mt-0.5">Qdrant Cloud 384-Dim</p>
              </div>
              <div className="p-4 bg-[#FBF6F0] rounded-2xl border border-[#EFE8DE]">
                <span className="text-[10px] font-bold text-[#A8A095] uppercase">Encryption</span>
                <p className="font-semibold text-[#3A342E] mt-0.5">AES-256 at Rest · TLS 1.3</p>
              </div>
              <div className="p-4 bg-[#FBF6F0] rounded-2xl border border-[#EFE8DE]">
                <span className="text-[10px] font-bold text-[#A8A095] uppercase">Auth Model</span>
                <p className="font-semibold text-[#6F8867] mt-0.5">Signed JWT Session Token</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. BOTTOM ACTIONS */}
      <div className="p-6 bg-white rounded-3xl border border-[#EFE8DE] card-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-serif font-bold text-[#3A342E]">Have specific questions about {details.name}?</h4>
          <p className="text-xs text-[#6B6259]">Ask the AI Assistant directly to cite official company policy documents.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateToChat}
            className="px-4 py-2.5 rounded-xl bg-[#8FA688] hover:bg-[#6F8867] text-white text-xs font-semibold shadow-xs transition"
          >
            Ask AI Assistant
          </button>
          {user?.role !== "EMPLOYEE" && (
            <button
              onClick={onNavigateToDocuments}
              className="px-4 py-2.5 rounded-xl bg-[#F4EFE3] hover:bg-[#EFE8DE] border border-[#EFE8DE] text-[#3A342E] text-xs font-semibold transition"
            >
              Manage Policy Documents
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
