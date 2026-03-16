import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Users, AlertTriangle, BarChart2, Radio, Trophy } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BrowserProvider, Contract } from 'ethers';
import Sidebar from '../../components/layout/Sidebar';
import CandidateCard from '../../components/shared/CandidateCard';
import ResultsChart from '../../components/shared/ResultsChart';
import Button from '../../components/ui/Button';
import { electionsApi, type ElectionDetail, type ElectionResults, votesApi, resultsApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { notifyError, notifyInfo, notifySuccess } from '../../lib/toast';
import { subscribeToElectionResults } from '../../lib/resultsSocket';

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
  const [pageError, setPageError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidateId, setVotedCandidateId] = useState<string | null>(null);
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setPageError(null);
    electionsApi
      .getById(id)
      .then(setElection)
      .catch((e) => setPageError((e as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !election) return;

    let cancelled = false;

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
    const unsubscribe = subscribeToElectionResults(id, (data) => {
      if (!cancelled) {
        setResults(data);
        setResultsError(null);
        setResultsLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [id, election]);

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

  // Countdown timer
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdownLabel = (() => {
    if (!election) return null;
    if (election.status === 'UPCOMING') {
      const start = new Date(election.startDate).getTime();
      const diff = start - now;
      if (diff <= 0) return 'Voting opens soon';
      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (24 * 3600));
      const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s until voting opens`;
      if (hours > 0) return `${hours}h ${minutes}m ${seconds}s until voting opens`;
      if (minutes > 0) return `${minutes}m ${seconds}s until voting opens`;
      return `${seconds}s until voting opens`;
    }

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

  const isActive = election?.status === 'ACTIVE';
  const isUpcoming = election?.status === 'UPCOMING';
  const isPublished = results?.published ?? election?.resultsPublished ?? false;
  const publishedAt = results?.publishedAt ?? election?.resultsPublishedAt ?? null;
  const statusMessage = isUpcoming
    ? 'This election is published early so you can review candidates before voting opens.'
    : election?.status === 'CLOSED'
      ? 'This election is already closed. You can still review candidates and results.'
      : null;

  const handleCastVote = async () => {
    if (!id || !selectedId || !election) return;
    if (election.status !== 'ACTIVE') {
      notifyError('Voting is only available once the election becomes active.');
      return;
    }
    if (hasVoted) {
      notifyError('You have already voted in this election.');
      return;
    }
    if (!user?.walletAddress) {
      notifyError('You must link a wallet in your profile before voting.');
      return;
    }
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined;
    if (!contractAddress) {
      notifyError('Contract address is not configured on the frontend.');
      return;
    }
    const candidate = election.candidates.find((c) => c.id === selectedId);
    if (!candidate || election.contractElectionId == null || candidate.contractCandidateId == null) {
      notifyError('Election or candidate is not synced to the contract.');
      return;
    }
    if (!(window as any).ethereum) {
      notifyError('MetaMask (or another Web3 wallet) is required to vote.');
      return;
    }
    setSubmitting(true);
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const abi = [
        'function castVote(uint256 _electionId, uint256 _candidateId) external',
        'function hasVoted(address _voter, uint256 _electionId) external view returns (bool)',
      ];
      const contract = new Contract(contractAddress, abi, signer);
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== user.walletAddress.toLowerCase()) {
        notifyError('Your active MetaMask account does not match the wallet linked to this account.');
        return;
      }

      const alreadyVotedOnChain = await contract.hasVoted(signerAddress, election.contractElectionId);
      if (alreadyVotedOnChain) {
        setHasVoted(true);
        notifyError('This wallet has already voted in the selected election.');
        return;
      }

      notifyInfo('Confirm the vote in your wallet.');
      const tx = await contract.castVote(election.contractElectionId, candidate.contractCandidateId);
      await tx.wait();
      try {
        await votesApi.recordVote({ electionId: id, candidateId: selectedId, txHash: tx.hash });
      } catch (e) {
        notifyError(`The vote was confirmed on-chain, but saving the receipt failed: ${(e as Error).message}`);
      }

      setHasVoted(true);
      setVotedCandidateId(candidate.id);
      notifySuccess('Vote cast successfully.');

      navigate(`/voter/receipt?tx=${encodeURIComponent(tx.hash)}`, {
        state: {
          election: election.title,
          candidate: candidate.name,
          wallet: signerAddress,
          txHash: tx.hash,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (e) {
      notifyError((e as Error).message);
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
        {!loading && pageError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {pageError}
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
        <section className="mb-8 rounded-[28px] border border-bv-border bg-bv-bg-deep px-6 py-8">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-bv-accent">
              Election Candidates
            </p>
            <h2 className="mt-3 text-4xl font-bold text-bv-ink">
              Vote for {election.title}
            </h2>
            <p className="mt-3 text-sm text-bv-ink-secondary">
              Review each profile, open their details, then lock in your vote before the timer ends.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {election.candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                {...candidate}
                size="compact"
                selected={selectedId === candidate.id}
                onSelect={setSelectedId}
                disabled={hasVoted || !isActive}
                profileHref={`/elections/${id}/candidates/${candidate.id}`}
                voteLabel={isUpcoming ? 'Voting Opens Soon' : election.status === 'CLOSED' ? 'Voting Closed' : 'I Vote For This'}
              />
            ))}
          </div>
          {hasVoted && votedCandidateId && (
            <p className="mt-5 text-center text-bv-accent text-xs">
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
          {statusMessage && (
            <div className="mb-5 rounded-xl border border-bv-accent/20 bg-bv-accent/5 px-4 py-3 text-sm text-bv-ink-secondary">
              {statusMessage}
            </div>
          )}
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
              disabled={!selectedId || submitting || hasVoted || !isActive}
              className={!selectedId || hasVoted || !isActive ? 'opacity-40' : ''}
              onClick={handleCastVote}
            >
              {submitting
                ? 'Casting vote...'
                : isUpcoming
                  ? 'Voting Opens Soon'
                  : election.status === 'CLOSED'
                    ? 'Voting Closed'
                    : 'Cast Vote'}
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

        <section className="mt-8">
          <h2 className="text-lg font-bold text-bv-ink mb-3 flex items-center gap-2">
            <BarChart2 size={18} className="text-bv-accent" />
            Live Results
          </h2>
          <div className="bg-bv-surface border border-bv-border rounded-2xl p-6">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-bv-accent/20 bg-bv-accent/5 px-3 py-1 text-xs font-medium text-bv-accent">
              <Radio size={12} />
              Live tally stays visible throughout the election
            </div>
            <ResultsChart
              candidates={results?.candidates ?? []}
              winner={results?.winner ?? null}
              totalVotes={results?.totalVotes ?? 0}
              loading={resultsLoading}
              error={resultsError}
            />
          </div>
        </section>

        <section className="mt-8">
          <div className="bg-bv-surface border border-bv-border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-bv-ink flex items-center gap-2">
              <Trophy size={18} className="text-bv-accent" />
              Official Published Result
            </h2>
            {isPublished ? (
              <>
                <p className="mt-4 text-2xl font-bold text-bv-ink">
                  {results?.winner?.name ?? 'No winner declared'}
                </p>
                <p className="mt-2 text-sm text-bv-ink-secondary">
                  Published {publishedAt ? new Date(publishedAt).toLocaleString() : 'recently'} after the election closed.
                </p>
              </>
            ) : election.status === 'CLOSED' ? (
              <>
                <p className="mt-4 text-sm font-medium text-bv-ink">Official result is still pending publication.</p>
                <p className="mt-2 text-sm text-bv-ink-secondary">
                  The election has ended, but the admin has not published the final official result yet. You can still review the live tally above.
                </p>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm font-medium text-bv-ink">Official results appear after closure.</p>
                <p className="mt-2 text-sm text-bv-ink-secondary">
                  While voting is open, the live tally above continues updating in real time.
                </p>
              </>
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
