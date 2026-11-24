'use client';

import { useState } from 'react';
import { updateCareerAcceleratorItem, createBooking } from './actions';
import {
  CalendarDays,
  Link as LinkIcon,
  User,
  Clock,
  Plus,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Search,
  Sparkles,
  Briefcase,
  Phone,
  Mail,
} from 'lucide-react';

function LinkedInIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export type CareerAcceleratorItem = {
  id: string;
  source: 'booking' | 'enquiry' | 'payment';
  serviceCode: 'career-guidance' | 'career-counseling' | 'linkedin-optimization' | 'interview-prep';
  serviceTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  status: string;
  scheduledFor: string | null;
  meetingUrl: string | null;
  adminNote: string | null;
  createdAt: string;

  domain?: string | null;
  batch?: string | null;
  linkedinUrl?: string | null;
  careerDetails?: string | null;
  areaOfInterest?: string | null;
  resumeFileName?: string | null;
  resumeFileSize?: number | null;
  resumeStoragePath?: string | null;
  resumeSignedUrl?: string | null;

  paymentStatus?: string | null;
  amountPaise?: number | null;
  paymentId?: string | null;
  providerOrderId?: string | null;
};

interface BookingsClientProps {
  items?: CareerAcceleratorItem[];
  bookings?: any[]; // For backward compatibility
}

export default function BookingsClient({ items = [], bookings = [] }: BookingsClientProps) {
  // Normalize items: if items is provided use it; otherwise fallback from legacy bookings
  const allItems: CareerAcceleratorItem[] = items.length > 0
    ? items
    : bookings.map((b) => ({
        id: b.id,
        source: 'booking' as const,
        serviceCode: (b.service_code || 'career-guidance') as CareerAcceleratorItem['serviceCode'],
        serviceTitle: b.service_code === 'interview-prep' ? 'Interview Preparation' : 'Career Guidance',
        applicantName: b.profiles?.full_name || 'Registered User',
        applicantEmail: '',
        applicantPhone: '',
        status: b.status || 'pending',
        scheduledFor: b.scheduled_for || null,
        meetingUrl: b.meeting_url || null,
        adminNote: null,
        createdAt: b.created_at,
        domain: b.domain || null,
      }));

  const [selectedItem, setSelectedItem] = useState<CareerAcceleratorItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<string>('pending');
  const [scheduledFor, setScheduledFor] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // Filtering states
  const [activeTab, setActiveTab] = useState<'all' | 'career-guidance' | 'linkedin-optimization' | 'interview-prep'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Copy-to-clipboard state
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // Create state
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createData, setCreateData] = useState({
    email: '',
    service_code: 'career-counseling',
    domain: '',
    scheduled_for: '',
    meeting_url: '',
  });

  const openModal = (item: CareerAcceleratorItem) => {
    setSelectedItem(item);
    setStatus(item.status || 'pending');
    setScheduledFor(item.scheduledFor ? new Date(item.scheduledFor).toISOString().slice(0, 16) : '');
    setMeetingUrl(item.meetingUrl || '');
    setAdminNote(item.adminNote || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsUpdating(true);

    const res = await updateCareerAcceleratorItem(selectedItem.id, selectedItem.source, {
      status,
      scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : null,
      meeting_url: meetingUrl || null,
      admin_note: adminNote || null,
    });
    setIsUpdating(false);

    if (res.error) {
      alert(res.error);
    } else {
      setSelectedItem(null);
    }
  };

  const handleCopyPhone = (phone: string, id: string) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    setTimeout(() => {
      setCopiedPhoneId(null);
    }, 2000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createData.email || !createData.scheduled_for) {
      alert('Email and Scheduled For time are required.');
      return;
    }

    setIsSubmittingCreate(false);
    const res = await createBooking(createData);
    setIsSubmittingCreate(false);

    if (res.error) {
      alert(res.error);
    } else {
      setIsCreating(false);
      setCreateData({ email: '', service_code: 'career-counseling', domain: '', scheduled_for: '', meeting_url: '' });
    }
  };

  const getStatusBadge = (itemStatus: string) => {
    const s = (itemStatus || 'pending').toLowerCase();
    switch (s) {
      case 'pending':
      case 'new':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>;
      case 'confirmed':
      case 'contacted':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">Confirmed</span>;
      case 'completed':
      case 'closed':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded-full text-xs font-bold uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 rounded-full text-xs font-bold uppercase tracking-wider">{itemStatus}</span>;
    }
  };

  const getServiceBadge = (code: string) => {
    if (code === 'interview-prep') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-lg text-xs font-semibold">
          <Briefcase className="w-3.5 h-3.5" />
          Interview Prep
        </span>
      );
    }
    if (code === 'linkedin-optimization') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 rounded-lg text-xs font-semibold">
          <LinkedInIcon className="w-3.5 h-3.5" />
          LinkedIn Optimization
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 rounded-lg text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5" />
        Career Guidance
      </span>
    );
  };

  const getPaymentBadge = (payStatus?: string | null, amountPaise?: number | null) => {
    const formattedAmount = amountPaise ? `₹${Math.round(amountPaise / 100)}` : '';
    if (payStatus === 'paid') {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          Paid {formattedAmount}
        </span>
      );
    }
    if (payStatus === 'failed') {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Failed
        </span>
      );
    }
    if (payStatus === 'pending') {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          Pending {formattedAmount}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
        Free
      </span>
    );
  };

  // Tab counts
  const countAll = allItems.length;
  const countGuidance = allItems.filter((i) => i.serviceCode === 'career-guidance' || i.serviceCode === 'career-counseling').length;
  const countLinkedIn = allItems.filter((i) => i.serviceCode === 'linkedin-optimization').length;
  const countInterview = allItems.filter((i) => i.serviceCode === 'interview-prep').length;

  // Filtered items
  const filteredItems = allItems.filter((item) => {
    // 1. Service tab filter
    if (activeTab === 'career-guidance' && item.serviceCode !== 'career-guidance' && item.serviceCode !== 'career-counseling') {
      return false;
    }
    if (activeTab === 'linkedin-optimization' && item.serviceCode !== 'linkedin-optimization') {
      return false;
    }
    if (activeTab === 'interview-prep' && item.serviceCode !== 'interview-prep') {
      return false;
    }

    // 2. Status filter
    if (statusFilter !== 'all') {
      const s = (item.status || '').toLowerCase();
      if (statusFilter === 'pending' && s !== 'pending' && s !== 'new') return false;
      if (statusFilter === 'confirmed' && s !== 'confirmed' && s !== 'contacted') return false;
      if (statusFilter === 'completed' && s !== 'completed' && s !== 'closed') return false;
      if (statusFilter === 'cancelled' && s !== 'cancelled') return false;
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.applicantName.toLowerCase().includes(q);
      const matchEmail = item.applicantEmail.toLowerCase().includes(q);
      const matchPhone = item.applicantPhone.toLowerCase().includes(q);
      const matchDomain = (item.domain || '').toLowerCase().includes(q);
      const matchBatch = (item.batch || '').toLowerCase().includes(q);
      const matchNote = (item.adminNote || '').toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchDomain || matchBatch || matchNote;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-zinc-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            All Career Accelerators ({countAll})
          </button>
          <button
            onClick={() => setActiveTab('career-guidance')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'career-guidance'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            Career Guidance ({countGuidance})
          </button>
          <button
            onClick={() => setActiveTab('linkedin-optimization')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'linkedin-optimization'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            LinkedIn Optimization ({countLinkedIn})
          </button>
          <button
            onClick={() => setActiveTab('interview-prep')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'interview-prep'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            Interview Preparation ({countInterview})
          </button>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 text-sm"
        >
          <Plus className="w-4 h-4" />
          Schedule Session
        </button>
      </div>

      {/* Search and Secondary Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, domain, or batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800">
                <th className="p-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Applicant / Contact</th>
                <th className="p-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Service & Domain</th>
                <th className="p-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Application Details</th>
                <th className="p-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Schedule & Meeting</th>
                <th className="p-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status & Payment</th>
                <th className="p-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500 dark:text-gray-400">
                    No Career Accelerators applications found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={`${item.source}-${item.id}`} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                    {/* 1. Applicant / Contact */}
                    <td className="p-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 font-bold shrink-0 mt-0.5">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.applicantName}</p>
                          {item.applicantEmail && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <a href={`mailto:${item.applicantEmail}`} className="hover:underline">{item.applicantEmail}</a>
                            </p>
                          )}
                          {item.applicantPhone && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-mono">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{item.applicantPhone}</span>
                              <button
                                onClick={() => handleCopyPhone(item.applicantPhone, item.id)}
                                title="Copy contact number"
                                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded"
                              >
                                {copiedPhoneId === item.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          )}
                          <p className="text-[11px] text-gray-400 pt-0.5" suppressHydrationWarning>
                            Applied: {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 2. Service & Domain */}
                    <td className="p-4 align-top">
                      <div className="space-y-1.5">
                        <div>{getServiceBadge(item.serviceCode)}</div>
                        {item.domain && (
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {item.domain}
                          </p>
                        )}
                        {item.batch && (
                          <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-[11px] font-medium rounded">
                            Batch: {item.batch}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. Application Details (Resume, LinkedIn, Booking Date, Career Details) */}
                    <td className="p-4 align-top">
                      <div className="space-y-1.5 max-w-xs">
                        {item.resumeSignedUrl ? (
                          <a
                            href={item.resumeSignedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            {item.resumeFileName || 'Download Resume'}
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        ) : item.resumeFileName ? (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <FileText className="w-3 h-3" />
                            {item.resumeFileName}
                          </span>
                        ) : null}

                        {item.linkedinUrl && (
                          <div>
                            <a
                              href={item.linkedinUrl.startsWith('http') ? item.linkedinUrl : `https://${item.linkedinUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium"
                            >
                              <LinkedInIcon className="w-3.5 h-3.5" />
                              View LinkedIn Profile
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {item.careerDetails && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2" title={item.careerDetails}>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Career: </span>
                            {item.careerDetails}
                          </p>
                        )}

                        {item.adminNote && (
                          <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded border border-amber-200 dark:border-amber-900/60 line-clamp-2">
                            <span className="font-semibold">Note: </span>{item.adminNote}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* 4. Schedule & Meeting */}
                    <td className="p-4 align-top">
                      <div className="space-y-1">
                        {item.scheduledFor ? (
                          <div>
                            <p className="text-xs font-semibold text-gray-900 dark:text-white" suppressHydrationWarning>
                              {new Date(item.scheduledFor).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5" suppressHydrationWarning>
                              <Clock className="w-3 h-3" />
                              {new Date(item.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Not scheduled</span>
                        )}

                        {item.meetingUrl ? (
                          <div className="pt-1">
                            <a
                              href={item.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                            >
                              <LinkIcon className="w-3 h-3" />
                              Join Meeting
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </td>

                    {/* 5. Status & Payment */}
                    <td className="p-4 align-top">
                      <div className="space-y-2">
                        <div>{getStatusBadge(item.status)}</div>
                        <div>{getPaymentBadge(item.paymentStatus, item.amountPaise)}</div>
                      </div>
                    </td>

                    {/* 6. Actions */}
                    <td className="p-4 align-top text-right">
                      <button
                        onClick={() => openModal(item)}
                        className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Item Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-gray-100 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Manage Application / Session
            </h3>

            {/* Applicant Summary */}
            <div className="mb-6 bg-gray-50 dark:bg-zinc-800/70 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedItem.applicantName}</p>
                <div>{getServiceBadge(selectedItem.serviceCode)}</div>
              </div>
              {selectedItem.applicantEmail && (
                <p className="text-xs text-gray-600 dark:text-gray-300">Email: {selectedItem.applicantEmail}</p>
              )}
              {selectedItem.applicantPhone && (
                <p className="text-xs text-gray-600 dark:text-gray-300">Phone: {selectedItem.applicantPhone}</p>
              )}
              {selectedItem.domain && (
                <p className="text-xs text-gray-500">Domain: {selectedItem.domain}</p>
              )}
              {selectedItem.batch && (
                <p className="text-xs text-gray-500">Batch: {selectedItem.batch}</p>
              )}
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Session / Application Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" /> Scheduled Session Date & Time
                  </div>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  <div className="flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5" /> Meeting URL (Google Meet / Zoom)
                  </div>
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white placeholder-gray-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Admin Internal Note
                </label>
                <textarea
                  rows={3}
                  placeholder="Add notes about candidate conversation, domain assessment, or follow-up status..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white placeholder-gray-400 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-gray-100 dark:border-zinc-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Schedule New Session</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">User Email</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={createData.email}
                  onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Service Type</label>
                <select
                  value={createData.service_code}
                  onChange={(e) => setCreateData({ ...createData, service_code: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white text-sm"
                >
                  <option value="career-counseling">Career Guidance</option>
                  <option value="interview-prep">Interview Prep</option>
                  <option value="linkedin-optimization">LinkedIn Optimization</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Domain / Topic (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Engineering, Product Management"
                  value={createData.domain}
                  onChange={(e) => setCreateData({ ...createData, domain: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  <div className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> Scheduled For</div>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={createData.scheduled_for}
                  onChange={(e) => setCreateData({ ...createData, scheduled_for: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  <div className="flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> Meeting URL</div>
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={createData.meeting_url}
                  onChange={(e) => setCreateData({ ...createData, meeting_url: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white placeholder-gray-400 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                >
                  {isSubmittingCreate ? 'Scheduling...' : 'Schedule Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
