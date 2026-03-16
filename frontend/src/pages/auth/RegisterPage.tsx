import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Eye, EyeOff, Mail, Lock, User, Phone, Shield, Vote, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { notifyError, notifySuccess } from '../../lib/toast';
import { clearPendingWallet, getPendingWallet, requestWalletAddress, setPendingWallet } from '../../utils/wallet';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(() => getPendingWallet());
  const [connectingWallet, setConnectingWallet] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setWalletAddress(getPendingWallet());
  }, []);

  const shortWallet = useMemo(() => {
    if (!walletAddress) return '';
    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  const handleConnectWallet = async () => {
    setConnectingWallet(true);
    try {
      const address = await requestWalletAddress();
      setPendingWallet(address);
      setWalletAddress(address);
      notifySuccess('Wallet connected. You can continue registration now.');
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setConnectingWallet(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { notifyError('Name is required'); return; }
    if (!email.trim()) { notifyError('Email is required'); return; }
    if (!password) { notifyError('Password is required'); return; }
    if (password !== confirmPassword) { notifyError('Passwords do not match'); return; }
    if (!walletAddress) { notifyError('Connect your wallet before registering'); return; }
    if (!agreed) { notifyError('Please agree to the Terms & Conditions'); return; }
    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        walletAddress,
      });
      clearPendingWallet();
      setSuccess(true);
      notifySuccess('Registration successful. Check your email to verify your account.');
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bv-bg-deep flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-bv-border bg-bv-surface p-8 text-center shadow-2xl shadow-black/30">
          <div className="w-14 h-14 rounded-2xl bg-bv-accent-muted flex items-center justify-center mx-auto mb-4">
            <Box size={28} className="text-bv-accent" />
          </div>
          <h2 className="text-lg font-bold text-bv-ink mb-2">Check your email</h2>
          <p className="text-bv-ink-secondary text-sm">
            We sent a verification link to <strong className="text-bv-ink">{email}</strong>. Click it to verify your account, then log in.
          </p>
          <p className="text-bv-ink-muted text-xs mt-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-bv-bg-deep flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-3xl border border-bv-border bg-bv-surface p-8 text-center shadow-2xl shadow-black/30">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-bv-accent/20 bg-bv-accent-muted">
            <Box size={30} className="text-bv-accent" />
          </div>
          <h1 className="text-2xl font-bold text-bv-ink">Connect your wallet first</h1>
          <p className="mt-3 text-sm leading-relaxed text-bv-ink-secondary">
            Blockvote now requires a wallet before account creation so your voter profile and MetaMask identity stay aligned from the start.
          </p>
          <div className="mt-6 rounded-2xl border border-bv-border bg-bv-bg px-4 py-4 text-left">
            <p className="text-sm font-semibold text-bv-ink">Why this is required</p>
            <p className="mt-2 text-xs leading-relaxed text-bv-ink-secondary">
              Your wallet is used for approval checks, vote casting, and wallet sign-in. Connect it now, then finish the registration form.
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            className="!mt-6"
            onClick={handleConnectWallet}
            disabled={connectingWallet}
          >
            {connectingWallet ? 'Connecting wallet...' : 'Connect Wallet To Register'}
          </Button>
          <p className="mt-5 text-center">
            <Link to="/login" className="text-bv-accent text-sm hover:underline">
              Already registered? Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bv-bg-deep flex items-center justify-center p-6">
      <div
        className="w-full max-w-4xl flex rounded-2xl overflow-hidden border border-bv-border shadow-2xl shadow-black/30"
      >
        <div
          className="relative w-[42%] flex-shrink-0 flex flex-col justify-between p-8 overflow-hidden bg-bv-bg"
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
          <h1 className="text-2xl font-bold text-bv-ink mb-1">Create an account</h1>
          <p className="text-bv-ink-secondary text-sm mb-6">
            Already have an account?{' '}
            <Link to="/login" className="text-bv-accent hover:underline font-medium">
              Log in
            </Link>
          </p>

          <div className="mb-5 rounded-2xl border border-bv-accent/20 bg-bv-accent-muted/40 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-bv-accent">Linked wallet</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="font-mono text-sm text-bv-ink">{shortWallet}</span>
              <button
                type="button"
                className="text-xs font-medium text-bv-accent hover:underline"
                onClick={handleConnectWallet}
                disabled={connectingWallet}
              >
                {connectingWallet ? 'Updating...' : 'Change wallet'}
              </button>
            </div>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input type="text" placeholder="Full name" icon={<User size={15} />} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            <Input type="email" placeholder="Email address" icon={<Mail size={15} />} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <Input type="tel" placeholder="Phone number (optional)" icon={<Phone size={15} />} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              icon={<Lock size={15} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              rightElement={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-bv-ink-muted hover:text-bv-ink-secondary transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            <Input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm your password"
              icon={<Lock size={15} />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              rightElement={
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-bv-ink-muted hover:text-bv-ink-secondary transition-colors">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            <label className="flex items-center gap-3 cursor-pointer pt-1">
              <div
                role="button"
                tabIndex={0}
                className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-colors ${
                  agreed ? 'bg-bv-accent border-bv-accent' : 'border-bv-border bg-bv-bg'
                }`}
                onClick={() => setAgreed(!agreed)}
                onKeyDown={(e) => e.key === 'Enter' && setAgreed((a) => !a)}
              >
                {agreed && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="#0e0f14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-bv-ink-secondary text-xs">
                I agree to the{' '}
                <a href="#" className="text-bv-accent hover:underline" onClick={(e) => e.preventDefault()}>
                  Terms & Conditions
                </a>
              </span>
            </label>

            <Button type="submit" variant="primary" fullWidth size="lg" className="!mt-4" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-amber-500/8 border border-amber-500/15 rounded-xl">
            <p className="text-amber-400 text-xs text-center leading-relaxed">
              Your account will be reviewed and approved by an admin before you can vote.
            </p>
          </div>

          <p className="text-center mt-5">
            <Link to="/" className="text-bv-ink-muted text-xs hover:text-bv-ink-secondary transition-colors">
              &larr; Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
