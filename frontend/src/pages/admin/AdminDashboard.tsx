import { Vote, Users, CheckCircle, Clock } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import StatsCard from '../../components/shared/StatsCard';
import ElectionCard from '../../components/shared/ElectionCard';
import Button from '../../components/ui/Button';

const pendingVoters = [
  { name: 'James Okafor', email: 'james@university.edu', wallet: '0x9fa2...b1c3', registered: 'Mar 4, 2026' },
  { name: 'Lily Zhang', email: 'lily.zhang@uni.edu', wallet: '0x4de1...9a72', registered: 'Mar 4, 2026' },
  { name: 'Carlos Mendez', email: 'c.mendez@student.edu', wallet: '0x78bc...0012', registered: 'Mar 3, 2026' },
  { name: 'Priya Sharma', email: 'priya.s@college.edu', wallet: '0x23af...dd81', registered: 'Mar 3, 2026' },
];

const activeElections = [
  {
    id: '1',
    title: 'Student Council President 2026',
    description: 'Vote for your preferred candidate for the student council presidency.',
    status: 'active' as const,
    startDate: 'Mar 1, 2026',
    endDate: 'Mar 10, 2026',
    candidateCount: 4,
  },
  {
    id: '2',
    title: 'Faculty Representative Election',
    description: 'Elect your faculty representatives for the academic board.',
    status: 'active' as const,
    startDate: 'Mar 3, 2026',
    endDate: 'Mar 15, 2026',
    candidateCount: 6,
  },
];

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex">
      <Sidebar variant="admin" />

      <main className="ml-12 flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-[#8899aa] text-sm mt-1">Overview of elections, voters, and platform activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatsCard icon={<Vote size={20} />} value={5} label="Total Elections" />
          <StatsCard icon={<CheckCircle size={20} />} value={2} label="Active Elections" trend="up" trendUp />
          <StatsCard icon={<Users size={20} />} value={128} label="Total Voters" />
          <StatsCard icon={<Clock size={20} />} value={7} label="Pending Approvals" />
        </div>

        {/* Pending Voter Approvals */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Pending Voter Approvals</h2>
            <span className="bg-yellow-500/20 text-yellow-400 text-xs font-medium px-2.5 py-1 rounded-full">
              {pendingVoters.length} pending
            </span>
          </div>
          <div className="bg-[#0f1929] border border-[#1a2a3a] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a2a3a]">
                  {['Name', 'Email', 'Wallet', 'Registered', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs text-[#556677] uppercase tracking-wide font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2a3a]">
                {pendingVoters.map((voter, idx) => (
                  <tr key={idx} className="bg-yellow-500/[0.02] hover:bg-yellow-500/[0.04] transition-colors">
                    <td className="px-5 py-4 text-white text-sm font-medium">{voter.name}</td>
                    <td className="px-5 py-4 text-[#8899aa] text-sm">{voter.email}</td>
                    <td className="px-5 py-4 text-[#8899aa] text-sm font-mono">{voter.wallet}</td>
                    <td className="px-5 py-4 text-[#8899aa] text-sm">{voter.registered}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="primary" size="sm">Approve</Button>
                        <Button variant="danger" size="sm">Reject</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Active Elections */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4">Active Elections</h2>
          <div className="grid grid-cols-2 gap-4">
            {activeElections.map((election) => (
              <ElectionCard key={election.id} {...election} role="admin" />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
