import { useEffect } from 'react';
import { Shield, Vote, Search, Lock, Eye, CheckCircle, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !token || !user) return;
    navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/voter/dashboard', { replace: true });
  }, [loading, token, user, navigate]);

  if (loading && token) {
    return (
      <div className="min-h-screen bg-bv-bg text-bv-ink flex items-center justify-center px-8">
        <div className="w-full max-w-md rounded-2xl border border-bv-border bg-bv-surface p-8 text-center">
          <div className="mx-auto h-10 w-10 rounded-xl bg-bv-accent-muted flex items-center justify-center">
            <Vote size={18} className="text-bv-accent" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Restoring your session</h1>
          <p className="mt-2 text-sm text-bv-ink-secondary">
            You already have a valid token saved, so Blockvote is taking you back in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bv-bg text-bv-ink">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-8 pt-16">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(0,212,200,0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        <div className="relative text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-bv-accent-muted rounded-full px-3.5 py-1 text-bv-accent text-xs font-medium mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-bv-accent animate-pulse" />
            Powered by Blockchain
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] mb-5 tracking-tight">
            Secure. Transparent.
            <br />
            <span className="text-bv-accent">Tamper-Proof</span> Voting.
          </h1>

          <p className="text-bv-ink-secondary text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            A blockchain-based voting system built for honest and verifiable elections. Every vote is recorded on-chain.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link to="/register">
              <Button variant="primary" size="lg">
                Get Started
                <ArrowRight size={16} />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg">
                How it works
              </Button>
            </a>
          </div>

          <div className="flex items-center justify-center gap-10 mt-16 pt-8 border-t border-bv-border">
            {[
              { value: '100%', label: 'Tamper-Proof' },
              { value: '256-bit', label: 'Encryption' },
              { value: 'On-Chain', label: 'Transparency' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-bold text-bv-accent">{stat.value}</div>
                <div className="text-bv-ink-muted text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-bv-accent text-xs uppercase tracking-widest font-semibold mb-2">
              Process
            </p>
            <h2 className="text-3xl font-bold text-bv-ink">How It Works</h2>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {[
              {
                number: '01',
                icon: Shield,
                title: 'Register & Approve',
                description: 'Create an account and get verified by an admin before you can participate.',
              },
              {
                number: '02',
                icon: Vote,
                title: 'Cast Your Vote',
                description: 'Select your candidate and sign the transaction with MetaMask.',
              },
              {
                number: '03',
                icon: Search,
                title: 'Verify Anytime',
                description: 'Use your transaction hash to verify your vote on the blockchain.',
              },
            ].map((step) => (
              <div key={step.number} className="text-center group">
                <div className="w-12 h-12 rounded-2xl bg-bv-accent-muted flex items-center justify-center mx-auto mb-5 group-hover:bg-bv-accent/20 transition-colors">
                  <step.icon size={22} className="text-bv-accent" />
                </div>
                <div className="text-bv-ink-muted text-[11px] font-mono mb-2">{step.number}</div>
                <h3 className="text-bv-ink font-semibold text-base mb-2">{step.title}</h3>
                <p className="text-bv-ink-secondary text-[13px] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-8 border-t border-bv-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-bv-accent text-xs uppercase tracking-widest font-semibold mb-2">
              Features
            </p>
            <h2 className="text-3xl font-bold text-bv-ink">Why Blockvote?</h2>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {[
              {
                icon: Lock,
                title: 'Secure',
                description: 'Cryptographic security with decentralized validation on Ethereum.',
              },
              {
                icon: Eye,
                title: 'Transparent',
                description: 'Every vote publicly recorded on an immutable ledger.',
              },
              {
                icon: CheckCircle,
                title: 'Verifiable',
                description: 'Track your vote anytime using your transaction receipt.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-bv-surface border border-bv-border rounded-2xl p-7 hover:border-bv-accent/20 transition-all duration-200 text-center group"
              >
                <div className="w-11 h-11 rounded-xl bg-bv-accent-muted flex items-center justify-center mx-auto mb-4 group-hover:bg-bv-accent/20 transition-colors">
                  <feature.icon size={22} className="text-bv-accent" />
                </div>
                <h3 className="text-bv-ink font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-bv-ink-secondary text-[13px] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8 border-t border-bv-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-bv-ink mb-3">
            Ready for a fairer election?
          </h2>
          <p className="text-bv-ink-secondary text-base mb-8">
            Join voters using Blockvote for transparent, secure elections.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/register">
              <Button variant="primary" size="lg">
                Register Now
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/elections">
              <Button variant="outline" size="lg">
                View Elections
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
