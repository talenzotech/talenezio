'use client';

import { useState } from 'react';
import { updateBooking, createBooking } from './actions';
import { CalendarDays, Link as LinkIcon, User, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';

type Booking = {
  id: string;
  user_id: string;
  service_code: string;
  domain: string | null;
  scheduled_for: string | null;
  meeting_url: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
};

export default function BookingsClient({ bookings }: { bookings: Booking[] }) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<Booking['status']>('pending');
  const [scheduledFor, setScheduledFor] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [filter, setFilter] = useState<'all' | 'interview-prep' | 'career-counseling'>('all');

  // Create state
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createData, setCreateData] = useState({
    email: '',
    service_code: 'interview-prep',
    domain: '',
    scheduled_for: '',
    meeting_url: ''
  });

  const openModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setStatus(booking.status);
    setScheduledFor(booking.scheduled_for ? new Date(booking.scheduled_for).toISOString().slice(0, 16) : '');
    setMeetingUrl(booking.meeting_url || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setIsUpdating(true);

    const data: any = { status };
    if (scheduledFor) {
      data.scheduled_for = new Date(scheduledFor).toISOString();
    } else {
      data.scheduled_for = null;
    }
    
    if (meetingUrl) {
      data.meeting_url = meetingUrl;
    } else {
      data.meeting_url = null;
    }

    const res = await updateBooking(selectedBooking.id, data);
    setIsUpdating(false);

    if (res.error) {
      alert(res.error);
    } else {
      setSelectedBooking(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>;
      case 'confirmed': return <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">Confirmed</span>;
      case 'completed': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">Completed</span>;
      case 'cancelled': return <span className="px-3 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded-full text-xs font-bold uppercase tracking-wider">Cancelled</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createData.email || !createData.scheduled_for) {
      alert("Email and Scheduled For time are required.");
      return;
    }
    
    setIsSubmittingCreate(true);
    const res = await createBooking(createData);
    setIsSubmittingCreate(false);

    if (res.error) {
      alert(res.error);
    } else {
      setIsCreating(false);
      setCreateData({ email: '', service_code: 'interview-prep', domain: '', scheduled_for: '', meeting_url: '' });
    }
  };

  const filteredBookings = bookings.filter(b => filter === 'all' || b.service_code === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex w-full flex-col bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl sm:w-fit sm:flex-row">
          <button
            onClick={() => setFilter('all')}
            className={`min-h-11 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'all' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            All Sessions
          </button>
          <button
            onClick={() => setFilter('interview-prep')}
            className={`min-h-11 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'interview-prep' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Interview Prep
          </button>
          <button
            onClick={() => setFilter('career-counseling')}
            className={`min-h-11 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'career-counseling' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Career Counseling
          </button>
        </div>

        <button 
          onClick={() => setIsCreating(true)}
          className="flex min-h-11 w-full items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Create Session
        </button>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800">
                <th className="p-4 text-sm font-semibold text-gray-900 dark:text-white">User</th>
                <th className="p-4 text-sm font-semibold text-gray-900 dark:text-white">Service</th>
                <th className="p-4 text-sm font-semibold text-gray-900 dark:text-white">Date / Time</th>
                <th className="p-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-900 dark:text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No bookings found.
                  </td>
                </tr>
              ) : filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 font-bold">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{booking.profiles?.full_name || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500" suppressHydrationWarning>{new Date(booking.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{booking.service_code.replace('-', ' ')}</p>
                    {booking.domain && <p className="text-xs text-gray-500">{booking.domain}</p>}
                  </td>
                  <td className="p-4">
                    {booking.scheduled_for ? (
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white" suppressHydrationWarning>{new Date(booking.scheduled_for).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5" suppressHydrationWarning>
                          <Clock className="w-3 h-3" />
                          {new Date(booking.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 italic">Not scheduled</span>
                    )}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openModal(booking)}
                      className="px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-gray-100 dark:border-zinc-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Manage Booking</h3>
            
            <div className="mb-6 bg-gray-50 dark:bg-zinc-800 p-4 rounded-xl">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {selectedBooking.profiles?.full_name || 'Unknown User'}
              </p>
              <p className="text-sm text-gray-500 capitalize">
                {selectedBooking.service_code.replace('-', ' ')} {selectedBooking.domain ? `(${selectedBooking.domain})` : ''}
              </p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Scheduled For</div>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Meeting URL</div>
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white placeholder-gray-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-gray-100 dark:border-zinc-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Schedule New Session</h3>

            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">User Email</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={createData.email}
                  onChange={(e) => setCreateData({...createData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Service Type</label>
                <select
                  value={createData.service_code}
                  onChange={(e) => setCreateData({...createData, service_code: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                >
                  <option value="interview-prep">Interview Prep</option>
                  <option value="career-counseling">Career Counseling</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Domain / Topic (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Engineering"
                  value={createData.domain}
                  onChange={(e) => setCreateData({...createData, domain: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Scheduled For</div>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={createData.scheduled_for}
                  onChange={(e) => setCreateData({...createData, scheduled_for: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Meeting URL</div>
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={createData.meeting_url}
                  onChange={(e) => setCreateData({...createData, meeting_url: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white placeholder-gray-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
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
