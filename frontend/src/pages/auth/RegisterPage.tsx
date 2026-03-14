import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Eye, EyeOff, Mail, Lock, User, Phone, Shield, Vote, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreed) {
      setError('Please agree to the Terms & Conditions');
      return;
    }
    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#060b14] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-[#1a2a3a] bg-[#0f1929] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#00d4c8]/20 flex items-center justify-center mx-auto mb-4">
            <Box size={32} className="text-[#00d4c8]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-[#8899aa] text-sm">
            We sent a verification link to <strong className="text-white">{email}</strong>. Click it to verify your account, then log in.
          </p>
          <p className="text-[#556677] text-xs mt-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060b14] flex items-center justify-center p-6">
      <div
        className="w-full max-w-4xl flex rounded-2xl overflow-hidden border border-[#1a2a3a]"
        style={{ boxShadow: '0 0 60px rgba(0,0,0,0.6)' }}
      >
        <div
          className="relative w-[42%] flex-shrink-0 flex flex-col justify-between p-8 overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #0a1628 0%, #0d2035 40%, #0a1a2e 100%)',
          }}
        >
          <div
            className="absolute -top-16 -left-16 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0,212,200,0.25) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-56 h-56 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0,212,200,0.1) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />

          <div className="relative flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <Box size={20} className="text-[#0a0f1a]" />
            </div>
            <span className="text-white font-bold text-lg tracking-wide">BLOCKVOTE</span>
          </div>

          <div className="relative flex-1 flex flex-col items-center justify-center py-10 gap-8">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(0,212,200,0.08)',
                border: '1px solid rgba(0,212,200,0.2)',
                boxShadow: '0 0 40px rgba(0,212,200,0.1)',
              }}
            >
              <Box size={44} className="text-[#00d4c8]" />
            </div>

            <div className="space-y-3 w-full max-w-[220px]">
              {[
                { icon: Shield, text: 'Register & Get Approved' },
                { icon: Vote, text: 'Cast Your Vote Securely' },
                { icon: Search, text: 'Verify Anytime On-Chain' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#00d4c8]/15 flex items-center justify-center flex-shrink-0">
                    <Icon size={13} className="text-[#00d4c8]" />
                  </div>
                  <span className="text-[#8899aa] text-xs">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <p className="text-white font-semibold text-base leading-snug">
              Secure. Transparent.
              <br />
              Tamper-Proof Voting.
            </p>
            <p className="text-[#556677] text-xs mt-1">Powered by blockchain technology</p>
          </div>
        </div>

        <div className="flex-1 bg-[#0f1929] flex flex-col justify-center px-10 py-10">
          <h1 className="text-3xl font-bold text-white mb-1">Create an account</h1>
          <p className="text-[#8899aa] text-sm mb-7">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00d4c8] hover:underline font-medium">
              Log in
            </Link>
          </p>

          <form className="space-y-3" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            <Input
              type="text"
              placeholder="Full name"
              icon={<User size={15} />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />

            <Input
              type="email"
              placeholder="Email address"
              icon={<Mail size={15} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <Input
              type="tel"
              placeholder="Phone number (optional)"
              icon={<Phone size={15} />}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />

            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              icon={<Lock size={15} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#556677] hover:text-[#8899aa] transition-colors"
                >
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
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="text-[#556677] hover:text-[#8899aa] transition-colors"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            <label className="flex items-center gap-3 cursor-pointer pt-1">
              <div
                role="button"
                tabIndex={0}
                className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-colors ${
                  agreed ? 'bg-[#00d4c8] border-[#00d4c8]' : 'border-[#1a2a3a] bg-[#0a0f1a]'
                }`}
                onClick={() => setAgreed(!agreed)}
                onKeyDown={(e) => e.key === 'Enter' && setAgreed((a) => !a)}
              >
                {agreed && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="#0a0f1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-[#8899aa] text-xs">
                I agree to the{' '}
                <a href="#" className="text-[#00d4c8] hover:underline" onClick={(e) => e.preventDefault()}>
                  Terms & Conditions
                </a>
              </span>
            </label>

            <Button type="submit" variant="primary" fullWidth size="lg" className="!mt-4" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 text-xs text-center leading-relaxed">
              Your account will be reviewed and approved by an admin before you can vote.
            </p>
          </div>

          <p className="text-center mt-5">
            <Link to="/" className="text-[#556677] text-xs hover:text-[#8899aa] transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
