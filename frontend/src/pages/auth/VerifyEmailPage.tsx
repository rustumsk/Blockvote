import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/client';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token');
      return;
    }
    authApi
      .verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Verification failed');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#060b14] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-[#1a2a3a] bg-[#0f1929] p-8 text-center">
        {status === 'loading' && (
          <p className="text-[#8899aa]">Verifying your email...</p>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#00d4c8]/20 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00d4c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Email verified</h2>
            <p className="text-[#8899aa] text-sm mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-[#00d4c8] text-black font-semibold hover:bg-[#00b5aa] transition-colors"
            >
              Log in
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-2xl">✕</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Verification failed</h2>
            <p className="text-red-400 text-sm mb-6">{message}</p>
            <Link
              to="/login"
              className="text-[#00d4c8] hover:underline text-sm"
            >
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
