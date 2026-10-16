'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { submitUnlockEvidence, getSubmissionStatus } from './actions';
import { Upload, X, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const REQUIRED_SCREENSHOTS = 11;

export default function UnlockProgramPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'approved' | 'rejected'>('idle');
  const [reviewerNote, setReviewerNote] = useState<string | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function checkStatus() {
      const data = await getSubmissionStatus();
      if (data) {
        setStatus(data.status as any);
        setReviewerNote(data.reviewer_note);
      }
      setIsLoadingStatus(false);
    }
    checkStatus();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
      
      setFiles(prev => {
        const combined = [...prev, ...validFiles];
        return combined.slice(0, REQUIRED_SCREENSHOTS); // Limit to max 11
      });
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length !== REQUIRED_SCREENSHOTS) {
      setError(`Please upload exactly ${REQUIRED_SCREENSHOTS} screenshots.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in.");
        setIsSubmitting(false);
        return;
      }

      // Upload to Supabase Storage
      const uploadedPaths: string[] = [];
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('unlock_evidence')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error("Failed to upload images. Please try again.");
        }
        
        uploadedPaths.push(filePath);
      }

      // Submit paths to database
      const result = await submitUnlockEvidence(uploadedPaths);
      
      if (result.error) {
        throw new Error(result.error);
      }

      setStatus('pending');
      setFiles([]);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Free Unlock Program
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Share Talenzo and get full access for free.
          </p>
        </div>

        {status === 'approved' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">Congratulations!</h2>
            <p className="text-green-600 dark:text-green-300">Your submission has been approved. You now have full free access to Talenzo.</p>
            <Link href="/dashboard" className="inline-block mt-4 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition">
              Go to Dashboard
            </Link>
          </div>
        )}

        {status === 'pending' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 text-center space-y-4">
            <Clock className="w-16 h-16 text-yellow-500 mx-auto" />
            <h2 className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">Review Pending</h2>
            <p className="text-yellow-600 dark:text-yellow-300">We've received your screenshots and are reviewing them. We'll email you soon!</p>
          </div>
        )}

        {(status === 'idle' || status === 'rejected') && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
            
            {status === 'rejected' && (
              <div className="bg-red-50 dark:bg-red-900/20 p-6 border-b border-red-100 dark:border-red-900 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-400">Submission Rejected</h3>
                  <p className="text-red-600 dark:text-red-300 mt-1 text-sm">
                    {reviewerNote || "Unfortunately, your previous submission was not approved. Please ensure all 11 screenshots are clear and meet the requirements."}
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 sm:p-8 space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm">1</span>
                    Share & Earn
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm list-disc list-inside">
                    <li>Take a free test</li>
                    <li>Share your certificate on LinkedIn and tag Talenzo</li>
                    <li>Share the app with 10 friends</li>
                    <li>Share the app in 3 student WhatsApp groups</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm">2</span>
                    Upload Proof
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Upload exactly <strong>{REQUIRED_SCREENSHOTS} screenshots</strong> proving you've completed all the steps above.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-zinc-800 pt-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div 
                    className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-2xl p-6 sm:p-12 text-center hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Click to upload screenshots
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 5MB ({files.length}/{REQUIRED_SCREENSHOTS} uploaded)
                    </p>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple 
                      accept="image/*"
                      className="hidden" 
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {files.map((file, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100 dark:bg-zinc-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`Upload ${idx + 1}`} 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || files.length !== REQUIRED_SCREENSHOTS}
                    className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                    ) : (
                      `Submit ${REQUIRED_SCREENSHOTS} Screenshots`
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
