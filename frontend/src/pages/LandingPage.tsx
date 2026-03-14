import { Shield, Vote, Search, Lock, Eye, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-8 overflow-hidden pt-20">
        {/* Teal radial glow — left side */}
        <div
          className="absolute top-1/2 -left-64 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(0,212,200,0.45) 0%, rgba(0,212,200,0.18) 35%, rgba(0,212,200,0.05) 55%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <div className="relative text-center max-w-4xl mx-auto pt-20">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-[#00d4c8]/10 border border-[#00d4c8]/20 rounded-full px-4 py-1.5 text-[#00d4c8] text-sm font-medium mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4c8] animate-pulse" />
            Powered by Blockchain
          </div>

          {/* Headline */}
          <h1 className="text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Secure.{' '}
            <span className="text-[#00d4c8]">Transparent.</span>
            <br />
            Tamper-Proof Voting.
          </h1>

          {/* Subheadline */}
          <p className="text-[#8899aa] text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            A blockchain-based automated voting system built for honest and verifiable elections.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="lg">
              Connect Wallet
            </Button>
            <a href="#how-it-works">
              <Button variant="primary" size="lg">
                Explore
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12 mt-16 pt-10 border-t border-[#1a2a3a]">
            {[
              { value: '100%', label: 'Tamper-Proof' },
              { value: '256-bit', label: 'Encryption' },
              { value: '∞', label: 'Transparency' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-[#00d4c8]">{stat.value}</div>
                <div className="text-[#556677] text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section A — How It Works */}
      <section id="how-it-works" className="py-24 px-8 bg-[#0f1929]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#00d4c8] text-xs uppercase tracking-widest font-semibold mb-3">
              Process
            </p>
            <h2 className="text-4xl font-bold text-white">How It Works</h2>
          </div>

          {/* Steps */}
          <div className="relative flex items-start justify-between gap-6">
            {/* Dashed line connector */}
            <div className="absolute top-8 left-[16.5%] right-[16.5%] h-px border-t border-dashed border-[#1a2a3a]" />

            {[
              {
                number: '01',
                icon: Shield,
                title: 'Register & Get Approved',
                description: 'Register and wait for admin approval',
              },
              {
                number: '02',
                icon: Vote,
                title: 'Cast Your Vote',
                description: 'Cast one vote securely on the blockchain',
              },
              {
                number: '03',
                icon: Search,
                title: 'Verify Your Vote',
                description: 'Verify anytime using your transaction hash',
              },
            ].map((step) => (
              <div key={step.number} className="flex-1 flex flex-col items-center text-center relative">
                {/* Teal circle number */}
                <div className="w-16 h-16 rounded-full bg-[#00d4c8]/15 border-2 border-[#00d4c8]/40 flex items-center justify-center mb-6 relative z-10">
                  <span className="text-[#00d4c8] font-bold text-sm">{step.number}</span>
                </div>
                <div className="mb-4 text-[#00d4c8]">
                  <step.icon size={28} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-[#8899aa] text-sm max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section B — Why Blockvote? */}
      <section className="py-24 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#00d4c8] text-xs uppercase tracking-widest font-semibold mb-3">
              Features
            </p>
            <h2 className="text-4xl font-bold text-white">Why Blockvote?</h2>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: 'Secure',
                description: 'Cryptographic security with decentralized validation',
              },
              {
                icon: Eye,
                title: 'Transparent',
                description: 'Every vote publicly recorded on an immutable ledger',
              },
              {
                icon: CheckCircle,
                title: 'Verifiable',
                description: 'Track your vote anytime using your transaction receipt',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-[#0f1929] border border-[#1a2a3a] rounded-xl p-8 hover:border-[#00d4c8]/40 hover:shadow-[0_0_30px_rgba(0,212,200,0.08)] transition-all duration-300 text-center group"
              >
                <div className="w-14 h-14 rounded-xl bg-[#00d4c8]/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#00d4c8]/20 transition-colors">
                  <feature.icon size={26} className="text-[#00d4c8]" />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-[#8899aa] text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section C — CTA Banner */}
      <section
        className="py-24 px-8 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #0f1929 0%, rgba(0,212,200,0.05) 50%, #0f1929 100%)',
        }}
      >
        {/* Glow orbs */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,212,200,0.06) 0%, transparent 70%)' }}
        />

        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to participate in a fairer election?
          </h2>
          <p className="text-[#8899aa] text-lg mb-10">
            Join thousands of voters using Blockvote for transparent, secure elections.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="primary" size="lg">
              Connect Wallet
            </Button>
            <Link to="/register">
              <Button variant="outline" size="lg">
                Register Now
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
