import { CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/ui/Button';

const receipt = {
  election: 'Student Council President 2026',
  candidate: 'Sofia Ramirez',
  wallet: '0x1234...5678',
  txHash: '0xabcd1234ef567890fedc...ba987654',
  txHashShort: '0xabcd...4321',
  timestamp: 'March 5, 2026  10:30 AM',
  blockNumber: '#4829102',
};

const ReceiptPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex">
      <Sidebar variant="voter" />

      <main className="ml-12 flex-1 p-8 overflow-y-auto flex items-start justify-center">
        <div className="w-full max-w-lg mt-8">
          {/* Success icon */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4"
              style={{ boxShadow: '0 0 30px rgba(34, 197, 94, 0.2)' }}
            >
              <CheckCircle size={40} className="text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Vote Successfully Cast!</h1>
            <p className="text-[#8899aa] text-base">Your vote has been recorded on the blockchain</p>
          </div>

          {/* Receipt card */}
          <div
            className="bg-[#0f1929] border border-[#1a2a3a] rounded-2xl p-6 mb-6"
            style={{ boxShadow: '0 0 20px rgba(0, 212, 200, 0.05)' }}
          >
            <h2 className="text-sm font-semibold text-[#00d4c8] uppercase tracking-widest mb-5">
              Vote Receipt
            </h2>

            <div className="space-y-4">
              {[
                { label: 'Election', value: receipt.election },
                { label: 'Candidate', value: receipt.candidate },
                { label: 'Wallet', value: receipt.wallet },
                { label: 'Timestamp', value: receipt.timestamp },
                { label: 'Block Number', value: receipt.blockNumber },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-[#1a2a3a] last:border-0">
                  <span className="text-[#556677] text-xs uppercase tracking-wide">{item.label}</span>
                  <span className="text-white text-sm font-medium">{item.value}</span>
                </div>
              ))}

              {/* Tx Hash row with copy */}
              <div className="flex items-center justify-between py-3 border-b border-[#1a2a3a]">
                <span className="text-[#556677] text-xs uppercase tracking-wide">Transaction Hash</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#00d4c8] text-sm font-mono">{receipt.txHashShort}</span>
                  <button className="text-[#556677] hover:text-[#00d4c8] transition-colors">
                    <Copy size={14} />
                  </button>
                  <button className="text-[#556677] hover:text-[#00d4c8] transition-colors">
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-5">
            <Link to="/voter/verify" className="flex-1">
              <Button variant="primary" fullWidth>
                Verify My Vote
              </Button>
            </Link>
            <Link to="/voter/elections" className="flex-1">
              <Button variant="outline" fullWidth>
                Back to Elections
              </Button>
            </Link>
          </div>

          {/* Note */}
          <div className="flex items-start gap-2 p-3 bg-[#0f1929] border border-[#1a2a3a] rounded-lg">
            <div className="w-1 h-1 rounded-full bg-[#00d4c8] mt-2 flex-shrink-0" />
            <p className="text-[#8899aa] text-xs leading-relaxed">
              Save your transaction hash to verify your vote at any time. Anyone can verify any vote using its transaction hash.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReceiptPage;
