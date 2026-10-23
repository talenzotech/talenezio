'use client';

import { useState } from 'react';
import { reviewSubmission } from './actions';
import { Loader2, CheckCircle, XCircle, ExternalLink, User } from 'lucide-react';

export type Submission = {
  id: string;
  status: string;
  created_at: string;
  reviewer_note: string | null;
  feature_code: string;
  contact_email: string | null;
  whatsapp_phone: string | null;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
  unlock_evidence: { id: string; storage_path: string; evidence_type: string; url: string | null }[];
};

export default function SubmissionsClient({ initialSubmissions }: { initialSubmissions: Submission[] }) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!selectedSub) return;
    setIsSubmitting(true);
    
    const res = await reviewSubmission(selectedSub.id, status, note);
    if (res.success) {
      setSubmissions(prev => 
        prev.map(s => s.id === selectedSub.id ? { ...s, status, reviewer_note: note } : s)
      );
      setSelectedSub(null);
      setNote('');
    } else {
      alert(res.error || 'Failed to update submission');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Submissions Table */}
      <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
          <thead className="bg-gray-50 dark:bg-zinc-950">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
            {submissions.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {sub.profiles?.avatar_url ? (
                        <img className="h-10 w-10 rounded-full object-cover" src={sub.profiles.avatar_url} alt="" />
                      ) : (
                        <User className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {sub.profiles?.full_name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {sub.unlock_evidence.length} Screenshots
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(sub.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${sub.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                    ${sub.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                    ${sub.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                  `}>
                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedSub(sub);
                      setNote(sub.reviewer_note || '');
                    }}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setSelectedSub(null)}>
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-zinc-900 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full border border-gray-100 dark:border-zinc-800">
              <div className="px-6 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[85vh] overflow-y-auto">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white flex items-center justify-between">
                      Review Submission
                      <button onClick={() => setSelectedSub(null)} className="text-gray-400 hover:text-gray-500">
                        &times;
                      </button>
                    </h3>
                    
                    <div className="mt-6">
                      <div className="mb-5 grid gap-3 rounded-lg bg-gray-50 p-4 text-sm dark:bg-zinc-950 sm:grid-cols-2">
                        <p><span className="font-semibold">Feature:</span> {selectedSub.feature_code.replaceAll('_', ' ')}</p>
                        <p><span className="font-semibold">Email:</span> {selectedSub.contact_email || 'Not provided'}</p>
                        <p><span className="font-semibold">WhatsApp:</span> {selectedSub.whatsapp_phone || 'Not provided'}</p>
                      </div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Evidence Screenshots ({selectedSub.unlock_evidence.length})</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {selectedSub.unlock_evidence.map((ev, i) => (
                          <a 
                            key={ev.id} 
                            href={ev.url || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block relative aspect-video bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden group border border-gray-200 dark:border-zinc-700"
                          >
                            {ev.url ? (
                              <img src={ev.url} alt={`Evidence ${i+1}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No URL</div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <ExternalLink className="w-6 h-6 text-white" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>

                    {selectedSub.status === 'pending' && (
                      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Reviewer Note (optional)
                        </label>
                        <textarea
                          rows={3}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-md p-3"
                          placeholder="e.g. Please provide a clearer screenshot of the LinkedIn post..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />
                        
                        <div className="mt-6 flex justify-end gap-3">
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleReview('rejected')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                          >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                            Reject
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleReview('approved')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 shadow-sm shadow-green-500/20"
                          >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                            Approve Unlock
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
