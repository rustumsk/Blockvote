import { Vote, Receipt, Calendar, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import StatsCard from '../../components/shared/StatsCard';
import ElectionCard from '../../components/shared/ElectionCard';

const isPending = false; // Toggle to true to show pending banner

const activeElections = [
  {
    id: '1',
    title: 'Student Council President 2026',
    description: 'Vote for your preferred candidate for the student council presidency this academic year.',
    status: 'active' as const,
    startDate: 'Mar 1, 2026',
    endDate: 'Mar 10, 2026',
    candidateCount: 4,
    hasVoted: false,
  },
  {
    id: '2',
    title: 'Faculty Representative Election',
    description: 'Elect your faculty representatives for the academic board of governors.',
    status: 'active' as const,
    startDate: 'Mar 3, 2026',
    endDate: 'Mar 15, 2026',
    candidateCount: 6,
    hasVoted: true,
  },
];

const recentActivity = [
  {
    election: 'Faculty Representative Election',
    candidate: 'Dr. Sarah Mitchell',
    txHash: '0xabcd1234...ef567890',
    timestamp: 'Mar 3, 2026 9:15 AM',
  },
];

const VoterDashboard = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex">
      <Sidebar variant="voter" />

      {/* Main content */}
      <main className="ml-12 flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, Alex</h1>
            <p className="text-[#8899aa] text-sm mt-1">Here's what's happening with your votes.</p>
          </div>
          <div className="flex items-center gap-2 bg-[#0f1929] border border-[#1a2a3a] rounded-lg px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-[#00d4c8]" />
            <span className="text-[#8899aa] text-sm font-mono">0x1234...5678</span>
          </div>
        </div>

        {/* Pending banner */}
        {isPending && (
          <div className="mb-6 flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-5 py-4">
            <AlertTriangle size={20} className="text-yellow-400 flex-shrink-0" />
            <p className="text-yellow-300 text-sm">
              <strong>Account Pending:</strong> Your account is pending admin approval. You cannot vote until approved.
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatsCard icon={<Vote size={20} />} value={2} label="Active Elections" />
          <StatsCard icon={<CheckCircle size={20} />} value={1} label="Elections Voted" />
          <StatsCard icon={<Calendar size={20} />} value={3} label="Upcoming Elections" />
          <StatsCard icon={<Receipt size={20} />} value={1} label="My Vote Receipts" />
        </div>

        {/* Active Elections */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Active Elections</h2>
            <a href="/voter/elections" className="text-[#00d4c8] text-sm hover:underline">
              View all
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {activeElections.map((election) => (
              <ElectionCard key={election.id} {...election} role="voter" />
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
          <div className="bg-[#0f1929] border border-[#1a2a3a] rounded-xl overflow-hidden">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-[#556677]">No recent activity</div>
            ) : (
              <div className="divide-y divide-[#1a2a3a]">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle size={16} className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{activity.election}</p>
                        <p className="text-[#8899aa] text-xs mt-0.5">Voted for {activity.candidate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-[#00d4c8] text-xs font-mono">
                        <span>{activity.txHash}</span>
                        <ExternalLink size={12} />
                      </div>
                      <p className="text-[#556677] text-xs mt-0.5">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default VoterDashboard;
