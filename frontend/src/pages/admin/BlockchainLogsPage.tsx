import { Copy, ExternalLink, Database, Cpu, FileCode } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';

const logs = [
  { txHash: '0xabcd...4321', election: 'Student Council 2026', candidate: 'Sofia Ramirez', wallet: '0x1234...5678', timestamp: 'Mar 5, 2026 10:30 AM', block: 4829102 },
  { txHash: '0xefgh...8765', election: 'Faculty Rep Election', candidate: 'Dr. Sarah Mitchell', wallet: '0x9abc...def0', timestamp: 'Mar 4, 2026  3:15 PM', block: 4829087 },
  { txHash: '0xijkl...bcde', election: 'Student Council 2026', candidate: 'Marcus Chen', wallet: '0x5678...1234', timestamp: 'Mar 4, 2026  2:45 PM', block: 4829081 },
  { txHash: '0xmnop...fghi', election: 'Faculty Rep Election', candidate: 'Prof. Alan Torres', wallet: '0xdefa...b012', timestamp: 'Mar 4, 2026  1:00 PM', block: 4829064 },
  { txHash: '0xqrst...jklm', election: 'Faculty Rep Election', candidate: 'Dr. Sarah Mitchell', wallet: '0x4321...8765', timestamp: 'Mar 3, 2026 11:20 AM', block: 4828990 },
  { txHash: '0xuvwx...nopq', election: 'Student Council 2026', candidate: 'Ethan Brooks', wallet: '0x8765...4321', timestamp: 'Mar 3, 2026  9:50 AM', block: 4828975 },
];

const BlockchainLogsPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex">
      <Sidebar variant="admin" />

      <main className="ml-12 flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Blockchain Transaction Logs</h1>
          <p className="text-[#8899aa] text-sm mt-1">Immutable record of all votes cast on-chain</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#0f1929] border border-[#1a2a3a] rounded-xl p-5 hover:border-[#00d4c8]/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#00d4c8]/10 flex items-center justify-center">
                <Database size={18} className="text-[#00d4c8]" />
              </div>
              <span className="text-[#556677] text-xs uppercase tracking-wide">Total Transactions</span>
            </div>
            <div className="text-2xl font-bold text-white">344</div>
          </div>
          <div className="bg-[#0f1929] border border-[#1a2a3a] rounded-xl p-5 hover:border-[#00d4c8]/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#00d4c8]/10 flex items-center justify-center">
                <Cpu size={18} className="text-[#00d4c8]" />
              </div>
              <span className="text-[#556677] text-xs uppercase tracking-wide">Last Block Synced</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">#4829102</div>
          </div>
          <div className="bg-[#0f1929] border border-[#1a2a3a] rounded-xl p-5 hover:border-[#00d4c8]/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#00d4c8]/10 flex items-center justify-center">
                <FileCode size={18} className="text-[#00d4c8]" />
              </div>
              <span className="text-[#556677] text-xs uppercase tracking-wide">Contract Address</span>
            </div>
            <div className="text-sm font-bold text-[#00d4c8] font-mono">0xDeaD...BeEF</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <select className="bg-[#0f1929] border border-[#1a2a3a] rounded-lg px-4 py-2.5 text-white text-sm focus:border-[#00d4c8] focus:outline-none appearance-none cursor-pointer">
            <option value="">All Elections</option>
            <option>Student Council President 2026</option>
            <option>Faculty Representative Election</option>
          </select>
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search by tx hash..."
              className="bg-[#0f1929] border border-[#1a2a3a] rounded-lg px-4 py-2.5 text-white placeholder-[#556677] focus:border-[#00d4c8] focus:outline-none w-full text-sm font-mono"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0f1929] border border-[#1a2a3a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a2a3a]">
                {['Tx Hash', 'Election', 'Candidate', 'Voter Wallet', 'Timestamp', 'Block', ''].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs text-[#556677] uppercase tracking-wide font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2a3a]">
              {logs.map((log, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#00d4c8] text-sm font-mono">{log.txHash}</span>
                      <button className="opacity-0 group-hover:opacity-100 text-[#556677] hover:text-[#00d4c8] transition-all">
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[#8899aa] text-sm max-w-[160px] truncate">{log.election}</td>
                  <td className="px-4 py-4 text-white text-sm font-medium">{log.candidate}</td>
                  <td className="px-4 py-4 text-[#8899aa] text-sm font-mono">{log.wallet}</td>
                  <td className="px-4 py-4 text-[#8899aa] text-xs">{log.timestamp}</td>
                  <td className="px-4 py-4 text-[#556677] text-xs font-mono">#{log.block}</td>
                  <td className="px-4 py-4">
                    <button className="flex items-center gap-1 text-[#556677] hover:text-[#00d4c8] text-xs transition-colors">
                      <ExternalLink size={13} />
                      Etherscan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default BlockchainLogsPage;
