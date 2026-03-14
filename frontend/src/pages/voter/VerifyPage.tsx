import { CheckCircle, Shield } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const verifyResult = {
  election: 'Student Council President 2026',
  candidate: 'Sofia Ramirez',
  wallet: '0x1234...5678',
  timestamp: 'March 5, 2026  10:30 AM',
  blockConfirmations: 142,
};

const VerifyPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex">
      <Sidebar variant="voter" />

      <main className="ml-12 flex-1 p-8 overflow-y-auto flex items-start justify-center">
        <div className="w-full max-w-lg mt-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#00d4c8]/10 border border-[#00d4c8]/20 mb-4">
              <Shield size={26} className="text-[#00d4c8]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Verify Your Vote</h1>
            <p className="text-[#8899aa] text-sm">
              Enter your transaction hash to confirm your vote was recorded
            </p>
          </div>

          {/* Input + Button */}
          <div className="bg-[#0f1929] border border-[#1a2a3a] rounded-2xl p-6 mb-6">
            <Input
              label="Transaction Hash"
              type="text"
              placeholder="Enter transaction hash (0x...)"
              className="text-sm font-mono mb-4"
              defaultValue="0xabcd1234ef567890fedc"
            />
            <Button variant="primary" fullWidth size="lg">
              Verify
            </Button>
          </div>

          {/* Verified result */}
          <div
            className="bg-[#0f1929] border border-green-500/30 rounded-2xl p-6 mb-6"
            style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.05)' }}
          >
            {/* Verified badge */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1">
                <CheckCircle size={14} className="text-green-400" />
                <span className="text-green-400 text-xs font-semibold">VERIFIED ON BLOCKCHAIN</span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Election', value: verifyResult.election },
                { label: 'Candidate Voted', value: verifyResult.candidate },
                { label: 'Voter Wallet', value: verifyResult.wallet },
                { label: 'Timestamp', value: verifyResult.timestamp },
                { label: 'Block Confirmations', value: `${verifyResult.blockConfirmations} confirmations` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-[#1a2a3a] last:border-0">
                  <span className="text-[#556677] text-xs uppercase tracking-wide">{item.label}</span>
                  <span className="text-white text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="p-4 bg-[#0f1929] border border-[#1a2a3a] rounded-xl">
            <p className="text-[#8899aa] text-sm leading-relaxed text-center">
              Anyone can verify any vote using its transaction hash. This ensures full transparency and immutability of the voting process.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyPage;
