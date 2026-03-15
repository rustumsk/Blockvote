import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Eye, EyeOff, Mail, Lock, Shield, Vote, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ConnectWalletButton from '../../components/wallet/ConnectWalletButton';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      if (user.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else navigate('/voter/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bv-bg-deep flex items-center justify-center p-6">
      <div
        className="w-full max-w-4xl flex rounded-2xl overflow-hidden border border-bv-border shadow-2xl shadow-black/30"
      >
        <div
          className="relative w-[45%] flex-shrink-0 flex flex-col justify-between p-8 overflow-hidden bg-bv-bg"
        >
          <div
            className="absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none opacity-40"
            style={{
              background: 'radial-gradient(circle, rgba(0,212,200,0.2) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />

          <div className="relative flex items-center gap-2.5">
            <div className="w-8 h-8 bg-bv-accent rounded-lg flex items-center justify-center">
              <Box size={16} className="text-bv-bg" />
            </div>
            <span className="text-bv-ink font-bold text-base tracking-wide">BLOCKVOTE</span>
          </div>

          <div className="relative flex-1 flex flex-col items-center justify-center py-10 gap-7">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-bv-accent-muted border border-bv-accent/15">
              <Box size={36} className="text-bv-accent" />
            </div>

            <div className="space-y-3 w-full max-w-[200px]">
              {[
                { icon: Shield, text: 'Register & Get Approved' },
                { icon: Vote, text: 'Cast Your Vote Securely' },
                { icon: Search, text: 'Verify Anytime On-Chain' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-bv-accent-muted flex items-center justify-center flex-shrink-0">
                    <Icon size={13} className="text-bv-accent" />
                  </div>
                  <span className="text-bv-ink-secondary text-xs">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <p className="text-bv-ink font-semibold text-sm leading-snug">
              Secure. Transparent.
              <br />
              Tamper-Proof Voting.
            </p>
            <p className="text-bv-ink-muted text-[11px] mt-1">Powered by blockchain technology</p>
          </div>
        </div>

        <div className="flex-1 bg-bv-surface flex flex-col justify-center px-10 py-10">
          <h1 className="text-2xl font-bold text-bv-ink mb-1">Welcome back</h1>
          <p className="text-bv-ink-secondary text-sm mb-8">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-bv-accent hover:underline font-medium">
              Register
            </Link>
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/15 text-red-400 text-sm">
                {error}
              </div>
            )}
            <Input
              type="email"
              placeholder="Email address"
              icon={<Mail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              icon={<Lock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-bv-ink-muted hover:text-bv-ink-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <Button type="submit" variant="primary" fullWidth size="lg" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-bv-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-bv-surface text-bv-ink-muted text-xs">or sign in with</span>
            </div>
          </div>

          <ConnectWalletButton variant="outline" fullWidth size="lg" showIcon={true} />

          <p className="text-center mt-6">
            <Link to="/" className="text-bv-ink-muted text-xs hover:text-bv-ink-secondary transition-colors">
              &larr; Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
