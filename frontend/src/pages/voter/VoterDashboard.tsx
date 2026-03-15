import { useEffect, useState } from 'react';
import { Vote, Receipt, Calendar, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import StatsCard from '../../components/shared/StatsCard';
import ElectionCard from '../../components/shared/ElectionCard';
import { electionsApi, votesApi, type ElectionListItem } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const VoterDashboard = () => {
  const { user } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [elections, setElections] = useState<ElectionListItem[]>([]);
  const [myVotes, setMyVotes] = useState<
    {
      id: string
      txHash: string
      createdAt: string
      election: { id: string; title: string }
      candidate: { id: string; name: string }
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        const [allElections, votes] = await Promise.all([
          electionsApi.getList(),
          votesApi.myVotes().catch(() => []),
        ]);
        setElections(allElections);
        setMyVotes(votes);
        setIsPending(user?.status === 'PENDING');
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const active = elections.filter((e) => e.status === 'ACTIVE');
  const upcoming = elections.filter((e) => e.status === 'UPCOMING');
  const votedElectionIds = new Set(myVotes.map((v) => v.election.id));
  const recentActivity = myVotes.slice(0, 5);

  return (
    <div className="min-h-screen bg-bv-bg flex">
      <Sidebar variant="voter" />

      {/* Main content */}
      <main className="ml-12 flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-bv-ink">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-bv-ink-secondary text-sm mt-1">Here's what's happening with your votes.</p>
          </div>
          <div className="flex items-center gap-2 bg-bv-surface border border-bv-border rounded-lg px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-bv-accent" />
            <span className="text-bv-ink-secondary text-sm font-mono">
              {user?.walletAddress
                ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                : 'No wallet linked'}
            </span>
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
          <StatsCard icon={<Vote size={20} />} value={active.length} label="Active Elections" />
          <StatsCard icon={<CheckCircle size={20} />} value={votedElectionIds.size} label="Elections Voted" />
          <StatsCard icon={<Calendar size={20} />} value={upcoming.length} label="Upcoming Elections" />
          <StatsCard icon={<Receipt size={20} />} value={myVotes.length} label="My Vote Receipts" />
        </div>

        {/* Active Elections */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-bv-ink">Active Elections</h2>
            <a href="/voter/elections" className="text-bv-accent text-sm hover:underline">
              View all
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 text-bv-ink-muted text-sm">Loading elections...</div>
            ) : active.length === 0 ? (
              <div className="col-span-2 text-bv-ink-muted text-sm">No active elections right now.</div>
            ) : (
              active.slice(0, 4).map((election) => (
                <ElectionCard
                  key={election.id}
                  id={election.id}
                  title={election.title}
                  description={election.description}
                  status="active"
                  startDate={election.startDate}
                  endDate={election.endDate}
                  candidateCount={election.candidateCount}
                  hasVoted={votedElectionIds.has(election.id)}
                  role="voter"
                />
              ))
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-lg font-bold text-bv-ink mb-4">Recent Activity</h2>
          <div className="bg-bv-surface border border-bv-border rounded-2xl overflow-hidden">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-bv-ink-muted">No recent activity</div>
            ) : (
              <div className="divide-y divide-bv-border">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle size={16} className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-bv-ink text-sm font-medium">{activity.election.title}</p>
                        <p className="text-bv-ink-secondary text-xs mt-0.5">
                          Voted for {activity.candidate.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-bv-accent text-xs font-mono">
                        <span>
                          {activity.txHash.length > 14
                            ? `${activity.txHash.slice(0, 10)}...${activity.txHash.slice(-4)}`
                            : activity.txHash}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            window.open(`https://sepolia.etherscan.io/tx/${activity.txHash}`, '_blank')
                          }
                          className="text-bv-ink-muted hover:text-bv-accent transition-colors"
                        >
                          <ExternalLink size={12} />
                        </button>
                      </div>
                      <p className="text-bv-ink-muted text-xs mt-0.5">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
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
