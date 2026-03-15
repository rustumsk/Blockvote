import { useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, Database, Cpu, FileCode } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { electionsApi, resultsApi, type ElectionListItem, type Candidate } from '../../api/client';

const BlockchainLogsPage = () => {
  const [elections, setElections] = useState<ElectionListItem[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [logs, setLogs] = useState<
    { id: string; txHash: string; candidateId: string; timestamp: string }[]
  >([]);
  const [candidatesById, setCandidatesById] = useState<Record<string, Candidate>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadElections = async () => {
      const list = await electionsApi.getList();
      setElections(list);
      if (list.length > 0) {
        setSelectedElectionId(list[0].id);
      }
    };
    loadElections();
  }, []);

  useEffect(() => {
    const loadLogs = async () => {
      if (!selectedElectionId) return;
      setLoading(true);
      try {
        const [logsRes, electionDetail] = await Promise.all([
          resultsApi.getElectionLogs(selectedElectionId),
          electionsApi.getById(selectedElectionId),
        ]);
        setLogs(logsRes);
        const map: Record<string, Candidate> = {};
        electionDetail.candidates.forEach((c) => {
          map[c.id] = c;
        });
        setCandidatesById(map);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, [selectedElectionId]);

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) =>
        log.txHash.toLowerCase().includes(search.toLowerCase().trim())
      ),
    [logs, search]
  );

  const totalTransactions = logs.length;
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined;

  return (
    <div className="min-h-screen bg-bv-bg flex">
      <Sidebar variant="admin" />

      <main className="ml-12 flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-bv-ink">Blockchain Transaction Logs</h1>
          <p className="text-bv-ink-secondary text-sm mt-1">Immutable record of all votes cast on-chain</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-bv-surface border border-bv-border rounded-xl p-5 hover:border-bv-accent/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-bv-accent-muted flex items-center justify-center">
                <Database size={18} className="text-bv-accent" />
              </div>
              <span className="text-bv-ink-muted text-xs uppercase tracking-wide">Total Transactions</span>
            </div>
            <div className="text-2xl font-bold text-bv-ink">{totalTransactions}</div>
          </div>
          <div className="bg-bv-surface border border-bv-border rounded-xl p-5 hover:border-bv-accent/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-bv-accent-muted flex items-center justify-center">
                <Cpu size={18} className="text-bv-accent" />
              </div>
              <span className="text-bv-ink-muted text-xs uppercase tracking-wide">Last Block Synced</span>
            </div>
            <div className="text-2xl font-bold text-bv-ink font-mono">—</div>
          </div>
          <div className="bg-bv-surface border border-bv-border rounded-xl p-5 hover:border-bv-accent/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-bv-accent-muted flex items-center justify-center">
                <FileCode size={18} className="text-bv-accent" />
              </div>
              <span className="text-bv-ink-muted text-xs uppercase tracking-wide">Contract Address</span>
            </div>
            <div className="text-sm font-bold text-bv-accent font-mono">
              {contractAddress
                ? `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`
                : 'Not configured'}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <select
            className="bg-bv-surface border border-bv-border rounded-lg px-4 py-2.5 text-bv-ink text-sm focus:border-bv-accent focus:outline-none appearance-none cursor-pointer"
            value={selectedElectionId}
            onChange={(e) => setSelectedElectionId(e.target.value)}
          >
            {elections.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search by tx hash..."
              className="bg-bv-surface border border-bv-border rounded-lg px-4 py-2.5 text-bv-ink placeholder-bv-ink-muted focus:border-bv-accent focus:outline-none w-full text-sm font-mono"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-bv-surface border border-bv-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-bv-ink-muted text-sm">Loading logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-bv-ink-muted text-sm">No logs for this election yet.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-bv-border">
                  {['Tx Hash', 'Candidate', 'Timestamp', ''].map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-xs text-bv-ink-muted uppercase tracking-wide font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bv-border">
                {filteredLogs.map((log) => {
                  const candidate = candidatesById[log.candidateId];
                  const shortHash =
                    log.txHash.length > 14
                      ? `${log.txHash.slice(0, 10)}...${log.txHash.slice(-4)}`
                      : log.txHash;
                  return (
                    <tr key={log.id} className="hover:bg-bv-surface-hover/50 transition-colors group">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-bv-accent text-sm font-mono">{shortHash}</span>
                          <button
                            type="button"
                            className="opacity-0 group-hover:opacity-100 text-bv-ink-muted hover:text-bv-accent transition-all"
                            onClick={() => navigator.clipboard.writeText(log.txHash)}
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-bv-ink text-sm font-medium">
                        {candidate ? candidate.name : 'Unknown candidate'}
                      </td>
                      <td className="px-4 py-4 text-bv-ink-secondary text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-bv-ink-muted hover:text-bv-accent text-xs transition-colors"
                          onClick={() =>
                            window.open(`https://sepolia.etherscan.io/tx/${log.txHash}`, '_blank')
                          }
                        >
                          <ExternalLink size={13} />
                          Etherscan
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default BlockchainLogsPage;
