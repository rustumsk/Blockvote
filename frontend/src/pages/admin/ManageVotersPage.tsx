import { useState } from 'react';
import { Search, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';
type VoterStatus = 'pending' | 'approved' | 'rejected';

interface Voter {
  name: string;
  email: string;
  wallet: string;
  status: VoterStatus;
  registered: string;
}

const voters: Voter[] = [
  { name: 'James Okafor', email: 'james@university.edu', wallet: '0x9fa2...b1c3', status: 'pending', registered: 'Mar 4, 2026' },
  { name: 'Lily Zhang', email: 'lily.zhang@uni.edu', wallet: '0x4de1...9a72', status: 'pending', registered: 'Mar 4, 2026' },
  { name: 'Carlos Mendez', email: 'c.mendez@student.edu', wallet: '0x78bc...0012', status: 'pending', registered: 'Mar 3, 2026' },
  { name: 'Alex Johnson', email: 'alex.j@student.edu', wallet: '0x1234...5678', status: 'approved', registered: 'Feb 28, 2026' },
  { name: 'Maria Garcia', email: 'maria.g@uni.edu', wallet: '0xabc9...d3e4', status: 'approved', registered: 'Feb 25, 2026' },
  { name: 'Tom Wei', email: 'tom.w@college.edu', wallet: '0x5f6e...2288', status: 'approved', registered: 'Feb 20, 2026' },
  { name: 'Nina Patel', email: 'nina.p@uni.edu', wallet: '0xdef1...7799', status: 'approved', registered: 'Feb 18, 2026' },
  { name: 'Bob Smith', email: 'bob.s@student.edu', wallet: '0x3312...ccf1', status: 'rejected', registered: 'Mar 1, 2026' },
];

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const ManageVotersPage = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  const filtered = voters.filter((v) => {
    const matchesTab = activeTab === 'all' || v.status === activeTab;
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex">
      <Sidebar variant="admin" />

      <main className="ml-12 flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Manage Voters</h1>
            <p className="text-[#8899aa] text-sm mt-1">Review and manage voter registrations</p>
          </div>
          {/* Search */}
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#556677]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search voters..."
              className="bg-[#0f1929] border border-[#1a2a3a] rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-[#556677] focus:border-[#00d4c8] focus:outline-none w-full text-sm"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-6 bg-[#0f1929] border border-[#1a2a3a] rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === tab.key ? 'bg-[#00d4c8] text-black' : 'text-[#8899aa] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#0f1929] border border-[#1a2a3a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a2a3a]">
                {['Name', 'Email', 'Wallet Address', 'Status', 'Registered Date', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs text-[#556677] uppercase tracking-wide font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2a3a]">
              {filtered.map((voter, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    voter.status === 'pending'
                      ? 'bg-yellow-500/[0.03] hover:bg-yellow-500/[0.06]'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <td className="px-5 py-4 text-white text-sm font-medium">{voter.name}</td>
                  <td className="px-5 py-4 text-[#8899aa] text-sm">{voter.email}</td>
                  <td className="px-5 py-4 text-[#8899aa] text-sm font-mono">{voter.wallet}</td>
                  <td className="px-5 py-4">
                    <Badge variant={voter.status} />
                  </td>
                  <td className="px-5 py-4 text-[#8899aa] text-sm">{voter.registered}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {voter.status !== 'approved' && (
                        <button className="flex items-center gap-1 px-2.5 py-1.5 bg-green-500/20 text-green-400 text-xs rounded-lg hover:bg-green-500/30 transition-colors">
                          <CheckCircle size={12} /> Approve
                        </button>
                      )}
                      {voter.status !== 'rejected' && (
                        <button className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/30 transition-colors">
                          <XCircle size={12} /> Reject
                        </button>
                      )}
                      {voter.status === 'approved' && (
                        <button className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-500/20 text-gray-400 text-xs rounded-lg hover:bg-gray-500/30 transition-colors">
                          <MinusCircle size={12} /> Revoke
                        </button>
                      )}
                    </div>
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

export default ManageVotersPage;
