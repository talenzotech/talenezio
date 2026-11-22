'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  FileText,
  Download,
  ExternalLink,
  Mail,
  Phone,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Sparkles,
  Copy,
  Check,
  CreditCard,
  User,
} from 'lucide-react';
import { updateEnquiry } from '../enquiries/actions';

export interface ApplicationItem {
  id: string;
  userId: string | null;
  serviceCode: string;
  interest: string;
  status: 'new' | 'contacted' | 'closed' | string;
  adminNote: string | null;
  createdAt: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  collegeOrCompany: string;
  city?: string;
  age?: number | string;
  batch?: string;
  domain?: string;
  qualification?: string;
  experience?: string;
  fee?: string;
  amount?: number;
  paymentStatus?: 'paid' | 'pending' | 'failed' | 'cancelled' | 'free' | string;
  paymentId?: string;
  providerOrderId?: string;
  resumeFileName?: string;
  resumeFileSize?: number;
  resumeStoragePath?: string;
  resumeSignedUrl: string | null;
  rawMessage?: string;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function relativeTime(dateStr: string): string {
  try {
    const elapsed = Math.max(0, Date.now() - new Date(dateStr).getTime());
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function ApplicationsClient({
  applications,
}: {
  applications: ApplicationItem[];
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'internships' | 'courses' | 'interview-prep'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'closed'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending' | 'free' | 'incomplete'>('all');
  const [hasResumeOnly, setHasResumeOnly] = useState(false);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  const handleCopyPhone = (id: string, phone: string) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  const counts = useMemo(() => {
    return {
      all: applications.length,
      internships: applications.filter((a) => a.serviceCode === 'internships').length,
      courses: applications.filter((a) => a.serviceCode === 'courses').length,
      interviewPrep: applications.filter((a) => a.serviceCode === 'interview-prep').length,
      withResume: applications.filter((a) => Boolean(a.resumeSignedUrl || a.resumeFileName)).length,
      paid: applications.filter((a) => a.paymentStatus === 'paid').length,
      pendingPayment: applications.filter((a) => a.paymentStatus === 'pending' || a.paymentStatus === 'pending_payment').length,
      free: applications.filter((a) => a.paymentStatus === 'free' || a.serviceCode === 'internships').length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((item) => {
      // Tab filter
      if (activeTab === 'internships' && item.serviceCode !== 'internships') return false;
      if (activeTab === 'courses' && item.serviceCode !== 'courses') return false;
      if (activeTab === 'interview-prep' && item.serviceCode !== 'interview-prep') return false;

      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Payment filter
      if (paymentFilter === 'paid' && item.paymentStatus !== 'paid') return false;
      if (paymentFilter === 'pending' && item.paymentStatus !== 'pending' && item.paymentStatus !== 'pending_payment') return false;
      if (paymentFilter === 'free' && item.paymentStatus !== 'free' && item.serviceCode !== 'internships') return false;
      if (paymentFilter === 'incomplete' && item.paymentStatus !== 'failed' && item.paymentStatus !== 'cancelled') return false;

      // Has resume filter
      if (hasResumeOnly && !item.resumeSignedUrl && !item.resumeFileName) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = item.applicantName.toLowerCase().includes(query);
        const matchesEmail = item.applicantEmail.toLowerCase().includes(query);
        const matchesPhone = item.applicantPhone.toLowerCase().includes(query);
        const matchesInterest = item.interest.toLowerCase().includes(query);
        const matchesCollege = item.collegeOrCompany.toLowerCase().includes(query);
        const matchesDomain = (item.domain || '').toLowerCase().includes(query);
        const matchesBatch = (item.batch || '').toLowerCase().includes(query);
        if (
          !matchesName &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesInterest &&
          !matchesCollege &&
          !matchesDomain &&
          !matchesBatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [applications, activeTab, statusFilter, paymentFilter, hasResumeOnly, searchTerm]);

  const getServiceBadge = (code: string) => {
    switch (code) {
      case 'internships':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
            <Briefcase className="w-3 h-3" /> Internship
          </span>
        );
      case 'courses':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
            <GraduationCap className="w-3 h-3" /> Training Course
          </span>
        );
      case 'interview-prep':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            <Sparkles className="w-3 h-3" /> Interview Prep
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            {code}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            <Clock className="w-3 h-3" /> New
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
            <CheckCircle2 className="w-3 h-3" /> Contacted
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <XCircle className="w-3 h-3" /> Closed
          </span>
        );
      default:
        return <span className="text-xs text-gray-500 capitalize">{status}</span>;
    }
  };

  const getPaymentBadge = (status?: string, amount?: number, fee?: string) => {
    if (status === 'paid') {
      const displayAmount = amount ? `₹${amount.toLocaleString('en-IN')}` : fee;
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {displayAmount ? `${displayAmount} Paid` : 'Paid'}
        </span>
      );
    }
    if (status === 'free') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Sparkles className="w-3 h-3 text-slate-500" />
          Free Application
        </span>
      );
    }
    if (status === 'failed' || status === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          Payment Incomplete
        </span>
      );
    }
    if (status === 'pending' || status === 'pending_payment') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Clock className="w-3 h-3 text-amber-600" />
          Payment Pending {fee ? `(${fee})` : ''}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Applications & Resumes
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Centralized workspace to view submitted applications, download resumes, track payments, and manage follow-ups.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
              <FileText className="w-4 h-4" />
              {counts.withResume} Resumes on File
            </span>
            {counts.paid > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {counts.paid} Paid
              </span>
            )}
          </div>
        </div>

        {/* Tab Pills - Always Displayed */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            All Applications ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('internships')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'internships'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            Internships ({counts.internships})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'courses'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            Training Courses ({counts.courses})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('interview-prep')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'interview-prep'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            Interview Prep ({counts.interviewPrep})
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="relative sm:col-span-5 lg:col-span-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, phone, role, batch, or college..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <div className="sm:col-span-3 lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 text-xs font-medium rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Follow-up Statuses</option>
              <option value="new">Status: New</option>
              <option value="contacted">Status: Contacted</option>
              <option value="closed">Status: Closed</option>
            </select>
          </div>

          <div className="sm:col-span-4 lg:col-span-3">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 text-xs font-medium rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Payment States</option>
              <option value="paid">Payment: Paid Only ({counts.paid})</option>
              <option value="pending">Payment: Pending ({counts.pendingPayment})</option>
              <option value="free">Payment: Free Only ({counts.free})</option>
              <option value="incomplete">Payment: Incomplete/Cancelled</option>
            </select>
          </div>

          <div className="sm:col-span-12 lg:col-span-2 flex items-center">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={hasResumeOnly}
                onChange={(e) => setHasResumeOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Has Resume Only
            </label>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6 shadow-sm transition-all hover:border-gray-300 dark:hover:border-gray-700"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                {/* Left Section: Candidate info & Metadata */}
                <div className="space-y-3 flex-1">
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {getServiceBadge(item.serviceCode)}
                    {getStatusBadge(item.status)}
                    {getPaymentBadge(item.paymentStatus, item.amount, item.fee)}
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' '}({relativeTime(item.createdAt)})
                    </span>
                  </div>

                  {/* Title & Applicant Name */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.interest}
                    </h3>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-0.5">
                      Applicant:{' '}
                      <span className="text-blue-600 dark:text-blue-400 font-bold">
                        {item.applicantName || 'Anonymous Applicant'}
                      </span>
                    </p>
                  </div>

                  {/* Contact details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 pt-1">
                    {item.applicantEmail && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <a
                          href={`mailto:${item.applicantEmail}`}
                          className="hover:underline hover:text-blue-600 truncate font-medium"
                        >
                          {item.applicantEmail}
                        </a>
                      </div>
                    )}
                    {item.applicantPhone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <a
                          href={`tel:${item.applicantPhone}`}
                          className="hover:underline hover:text-blue-600 font-medium"
                        >
                          {item.applicantPhone}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(item.id, item.applicantPhone)}
                          title="Copy phone number"
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded cursor-pointer"
                        >
                          {copiedPhoneId === item.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                    {item.collegeOrCompany && (
                      <div className="flex items-center gap-1.5 sm:col-span-2">
                        <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>
                          <strong className="text-gray-700 dark:text-gray-300">College / Org:</strong>{' '}
                          {item.collegeOrCompany}
                        </span>
                        {item.city && <span>· {item.city}</span>}
                        {item.age && <span>· Age: {item.age}</span>}
                      </div>
                    )}
                    {(item.batch || item.domain) && (
                      <div className="sm:col-span-2 text-gray-500">
                        {item.batch && (
                          <span>
                            <strong>Batch / Cohort:</strong> {item.batch}{' '}
                          </span>
                        )}
                        {item.domain && (
                          <span>
                            · <strong>Domain:</strong> {item.domain}{' '}
                          </span>
                        )}
                        {item.fee && <span>· <strong>Program Fee:</strong> {item.fee}</span>}
                      </div>
                    )}
                    {(item.qualification || item.experience) && (
                      <div className="sm:col-span-2 text-gray-500 text-[11px]">
                        {item.qualification && <span><strong>Qualification:</strong> {item.qualification} </span>}
                        {item.experience && <span>· <strong>Experience:</strong> {item.experience}</span>}
                      </div>
                    )}
                    {item.paymentId && (
                      <div className="sm:col-span-2 text-[11px] text-gray-400">
                        <CreditCard className="w-3 h-3 inline mr-1 text-emerald-500" />
                        Payment Reference: {item.paymentId}
                        {item.providerOrderId ? ` (Order: ${item.providerOrderId})` : ''}
                      </div>
                    )}
                  </div>

                  {/* Resume Section */}
                  <div className="pt-2">
                    {item.resumeSignedUrl ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={item.resumeSignedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.01]"
                        >
                          <FileText className="w-4 h-4" />
                          Download / View Resume
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                        </a>
                        <span className="text-xs text-gray-500 font-medium">
                          {item.resumeFileName || 'resume.pdf'}
                          {item.resumeFileSize ? ` (${formatBytes(item.resumeFileSize)})` : ''}
                        </span>
                      </div>
                    ) : item.resumeFileName ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-medium border border-amber-200 dark:border-amber-800">
                        <FileText className="w-3.5 h-3.5" />
                        Resume File: {item.resumeFileName} (path: {item.resumeStoragePath || 'unspecified'})
                      </div>
                    ) : (
                      <span className="inline-block text-xs text-gray-400 italic">
                        No resume submitted with this enquiry.
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Section: Admin note and status update */}
                <form
                  action={updateEnquiry}
                  className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 lg:w-64 pt-3 lg:pt-0 lg:border-l lg:border-gray-100 lg:dark:border-gray-800 lg:pl-5"
                >
                  <input type="hidden" name="id" value={item.id} />

                  <div className="w-full">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Follow-up Status
                    </label>
                    <select
                      name="status"
                      defaultValue={item.status}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div className="w-full">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Admin Note
                    </label>
                    <input
                      name="note"
                      defaultValue={item.adminNote || ''}
                      placeholder="Add follow-up notes..."
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 p-12 text-center">
            <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-base font-bold text-gray-700 dark:text-gray-300">
              No matching applications found
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting your search query, status filter, payment filter, or active tab.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
