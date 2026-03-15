import { useEffect, useState } from 'react';
import { Vote, Users, CheckCircle, Clock } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import StatsCard from '../../components/shared/StatsCard';
import ElectionCard from '../../components/shared/ElectionCard';
import Button from '../../components/ui/Button';
import { electionsApi, usersApi, type ElectionListItem, type User } from '../../api/client';

const AdminDashboard = () => {
  const [elections, setElections] = useState<ElectionListItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [allElections, usersRes] = await Promise.all([
          electionsApi.getList(),
          usersApi.getUsers(),
        ]);
        setElections(allElections);
        setUsers(usersRes.users);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalElections = elections.length;
  const activeElections = elections.filter((e) => e.status === 'ACTIVE');
  const totalVoters = users.length;
  const pendingUsers = users.filter((u) => u.status === 'PENDING');
  return (
    <div className="min-h-screen bg-bv-bg flex">
      <Sidebar variant="admin" />

      <main className="ml-12 flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-bv-ink">Admin Dashboard</h1>
          <p className="text-bv-ink-secondary text-sm mt-1">Overview of elections, voters, and platform activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatsCard icon={<Vote size={20} />} value={totalElections} label="Total Elections" />
          <StatsCard
            icon={<CheckCircle size={20} />}
            value={activeElections.length}
            label="Active Elections"
          />
          <StatsCard icon={<Users size={20} />} value={totalVoters} label="Total Voters" />
          <StatsCard icon={<Clock size={20} />} value={pendingUsers.length} label="Pending Approvals" />
        </div>

        {/* Pending Voter Approvals */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-bv-ink">Pending Voter Approvals</h2>
            <span className="bg-yellow-500/20 text-yellow-400 text-xs font-medium px-2.5 py-1 rounded-full">
              {pendingUsers.length} pending
            </span>
          </div>
          <div className="bg-bv-surface border border-bv-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-bv-border">
                  {['Name', 'Email', 'Wallet', 'Registered', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs text-bv-ink-muted uppercase tracking-wide font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bv-border">
                {pendingUsers.slice(0, 5).map((voter) => (
                  <tr key={voter.id} className="bg-yellow-500/[0.02] hover:bg-yellow-500/[0.04] transition-colors">
                    <td className="px-5 py-4 text-bv-ink text-sm font-medium">{voter.name}</td>
                    <td className="px-5 py-4 text-bv-ink-secondary text-sm">{voter.email}</td>
                    <td className="px-5 py-4 text-bv-ink-secondary text-sm font-mono">
                      {voter.walletAddress
                        ? `${voter.walletAddress.slice(0, 6)}...${voter.walletAddress.slice(-4)}`
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-bv-ink-secondary text-sm">
                      {voter.createdAt
                        ? new Date(voter.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => window.location.assign('/admin/voters')}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => window.location.assign('/admin/voters')}
                        >
                          Reject
                        </Button>
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
          <h2 className="text-lg font-bold text-bv-ink mb-4">Active Elections</h2>
          <div className="grid grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 text-bv-ink-muted text-sm">Loading elections...</div>
            ) : activeElections.length === 0 ? (
              <div className="col-span-2 text-bv-ink-muted text-sm">No active elections right now.</div>
            ) : (
              activeElections.slice(0, 4).map((election) => (
                <ElectionCard
                  key={election.id}
                  id={election.id}
                  title={election.title}
                  description={election.description}
                  status="active"
                  startDate={election.startDate}
                  endDate={election.endDate}
                  candidateCount={election.candidateCount}
                  role="admin"
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
