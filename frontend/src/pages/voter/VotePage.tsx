import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Users, AlertTriangle, BarChart2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BrowserProvider, Contract } from 'ethers';
import Sidebar from '../../components/layout/Sidebar';
import CandidateCard from '../../components/shared/CandidateCard';
import Button from '../../components/ui/Button';
import { electionsApi, type ElectionDetail, votesApi, resultsApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const MetaMaskIcon = () => (
  <svg width="18" height="18" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M36.2 3L21.9 13.4l2.7-6.3L36.2 3z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.8 3l14.2 10.5-2.6-6.4L3.8 3z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M30.9 28.4l-3.8 5.8 8.1 2.2 2.3-7.9-6.6-.1zM2.6 28.5l2.3 7.9 8.1-2.2-3.8-5.8-6.6.1z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.5 17.8l-2.3 3.4 8.1.4-.3-8.7-5.5 4.9zM27.5 17.8l-5.6-5-2.3 8.7 8.1-.4-2.2-3.3z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const VotePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [election, setElection] = useState<ElectionDetail | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidateId, setVotedCandidateId] = useState<string | null>(null);
  const [results, setResults] = useState<{
    candidates: { contractCandidateId: number; name: string; voteCount: number }[];
    winner: { contractCandidateId: number; name: string; voteCount: number } | null;
    totalVotes: number;
  } | null>(null);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    electionsApi
      .getById(id)
      .then(setElection)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  // Check if this voter already voted in this election
  useEffect(() => {
    const checkVoted = async () => {
      if (!id) return;
      try {
        const my = await votesApi.myVotes();
        const vote = my.find((v) => v.election.id === id);
        if (vote) {
          setHasVoted(true);
          setVotedCandidateId(vote.candidate.id);
          setSelectedId(vote.candidate.id);
        }
      } catch {
        // ignore; dashboard already surfaces errors
      }
    };
    checkVoted();
  }, [id]);

  // Live results from contract
  useEffect(() => {
    if (!id || !election) return;

    let cancelled = false;
    let interval: number | undefined;

    const fetchResults = async () => {
      try {
        setResultsLoading(true);
        setResultsError(null);
        const data = await resultsApi.getElectionResults(id);
        if (!cancelled) setResults(data);
      } catch (e) {
        if (!cancelled) setResultsError((e as Error).message);
      } finally {
        if (!cancelled) setResultsLoading(false);
      }
    };

    fetchResults();

    if (election.status === 'ACTIVE') {
      interval = window.setInterval(fetchResults, 5000);
    }

    return () => {
      cancelled = true;
      if (interval) window.clearInterval(interval);
    };
  }, [id, election]);

  // Countdown timer
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdownLabel = (() => {
    if (!election) return null;
    const end = new Date(election.endDate).getTime();
    const diff = end - now;
    if (diff <= 0) return 'Voting window has ended';
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s remaining`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s remaining`;
    if (minutes > 0) return `${minutes}m ${seconds}s remaining`;
    return `${seconds}s remaining`;
  })();

  const handleCastVote = async () => {
    if (!id || !selectedId || !election) return;
    if (hasVoted) {
      setError('You have already voted in this election.');
      return;
    }
    if (!user?.walletAddress) {
      setError('You must link a wallet in your profile before voting.');
      return;
    }
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined;
    if (!contractAddress) {
      setError('Contract address is not configured on the frontend.');
      return;
    }
    const candidate = election.candidates.find((c) => c.id === selectedId);
    if (!candidate || election.contractElectionId == null || candidate.contractCandidateId == null) {
      setError('Election or candidate is not synced to the contract.');
      return;
    }
    if (!(window as any).ethereum) {
      setError('MetaMask (or another Web3 wallet) is required to vote.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const abi = [
        'function castVote(uint256 _electionId, uint256 _candidateId) external',
      ];
      const contract = new Contract(contractAddress, abi, signer);
      const tx = await contract.castVote(election.contractElectionId, candidate.contractCandidateId);
      const receipt = await tx.wait();

      await votesApi.recordVote({ electionId: id, candidateId: selectedId, txHash: tx.hash });

      navigate(`/voter/receipt?tx=${encodeURIComponent(tx.hash)}`, {
        state: {
          election: election.title,
          candidate: candidate.name,
          wallet: user.walletAddress,
          txHash: tx.hash,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bv-bg flex">
      <Sidebar variant="voter" />

      <main className="ml-12 flex-1 p-8 overflow-y-auto">
        {loading && (
          <p className="text-bv-ink-muted">Loading election...</p>
        )}
        {!loading && error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        {!loading && election && (
        <>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/voter/elections"
            className="flex items-center gap-1.5 text-bv-ink-secondary hover:text-bv-ink transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <div className="h-4 w-px bg-bv-border" />
          <div>
            <h1 className="text-2xl font-bold text-bv-ink">{election.title}</h1>
            {countdownLabel && (
              <p className="text-bv-ink-secondary text-xs mt-1">
                {countdownLabel}
              </p>
            )}
          </div>
        </div>

        {/* Election Info */}
        <div className="bg-bv-surface border border-bv-border rounded-2xl p-6 mb-8">
          <p className="text-bv-ink-secondary text-sm mb-4 leading-relaxed">
            {election.description}
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-bv-ink-secondary text-sm">
              <Clock size={15} className="text-bv-accent" />
              <span>Closes at <strong className="text-bv-ink">{new Date(election.endDate).toLocaleString()}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-bv-ink-secondary text-sm">
              <Users size={15} className="text-bv-accent" />
              <span><strong className="text-bv-ink">{election.candidates.length}</strong> Candidates</span>
            </div>
          </div>
        </div>

        {/* Select Candidate */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-bv-ink mb-4">Select a Candidate</h2>
          <div className="grid grid-cols-2 gap-4">
            {election.candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                {...candidate}
                selected={selectedId === candidate.id}
                onSelect={setSelectedId}
              />
            ))}
          </div>
          {hasVoted && votedCandidateId && (
            <p className="mt-3 text-bv-accent text-xs">
              You already voted in this election for{' '}
              <strong>
                {election.candidates.find((c) => c.id === votedCandidateId)?.name ??
                  'this candidate'}
              </strong>
              .
            </p>
          )}
        </section>

        {/* Cast Vote */}
        <div className="bg-bv-surface border border-bv-border rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-5">
            <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-bv-ink-secondary text-sm leading-relaxed">
              <strong className="text-yellow-400">This action is irreversible.</strong> Your vote will be permanently recorded on the blockchain and cannot be changed or deleted.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              size="lg"
              disabled={!selectedId || submitting || hasVoted}
              className={!selectedId || hasVoted ? 'opacity-40' : ''}
              onClick={handleCastVote}
            >
              {submitting ? 'Casting vote...' : 'Cast Vote'}
            </Button>

            <div className="flex items-center gap-2 text-bv-ink-secondary text-sm">
              <MetaMaskIcon />
              <span>Your vote will be recorded on the blockchain.</span>
            </div>
          </div>

          {selectedId && (
            <p className="mt-3 text-bv-accent text-sm">
              Selected: <strong>{election.candidates.find((c) => c.id === selectedId)?.name}</strong>
            </p>
          )}
        </div>

        {/* Live Results */}
        <section className="mt-8">
          <h2 className="text-lg font-bold text-bv-ink mb-3 flex items-center gap-2">
            <BarChart2 size={18} className="text-bv-accent" />
            Live Results
          </h2>
          <div className="bg-bv-surface border border-bv-border rounded-2xl p-6">
            {resultsLoading && !results && (
              <p className="text-bv-ink-muted text-sm">Loading live results...</p>
            )}
            {resultsError && (
              <p className="text-red-400 text-sm">{resultsError}</p>
            )}
            {!resultsLoading && results && results.candidates.length === 0 && (
              <p className="text-bv-ink-muted text-sm">
                No votes have been recorded for this election yet.
              </p>
            )}
            {!resultsLoading && results && results.candidates.length > 0 && (
              <div className="space-y-4">
                {results.candidates.map((c) => {
                  const percent =
                    results.totalVotes > 0
                      ? Math.round((c.voteCount / results.totalVotes) * 100)
                      : 0;
                  return (
                    <div key={c.contractCandidateId}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-bv-ink text-sm font-medium">{c.name}</span>
                        <span className="text-bv-ink-secondary text-xs">
                          {c.voteCount} votes ({percent}%)
                        </span>
                      </div>
                      <div className="h-2 bg-bv-bg rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-bv-accent transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        </>
        )}
      </main>
    </div>
  );
};

export default VotePage;
