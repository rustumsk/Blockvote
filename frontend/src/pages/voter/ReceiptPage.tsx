import { useEffect, useState } from 'react';
import { CheckCircle, Copy, ExternalLink, Download } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/ui/Button';
import { votesApi } from '../../api/client';

const ReceiptPage = () => {
  const [searchParams] = useSearchParams()
  const txFromQuery = searchParams.get('tx') ?? undefined

  const [receipts, setReceipts] = useState<
    {
      id: string
      txHash: string
      createdAt: string
      election: { id: string; title: string }
      candidate: { id: string; name: string }
    }[]
  >([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = () => {
    window.print()
  }

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await votesApi.myVotes()
        setReceipts(res)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  return (
    <div className="min-h-screen bg-bv-bg flex">
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
            <h1 className="text-3xl font-bold text-bv-ink mb-2">Vote Successfully Cast!</h1>
            <p className="text-bv-ink-secondary text-base">Your vote has been recorded on the blockchain</p>
          </div>

          {/* Receipt card */}
          <div
            className="bg-bv-surface border border-bv-border rounded-2xl p-6 mb-6"
            style={{ boxShadow: '0 0 20px rgba(0, 212, 200, 0.05)' }}
          >
            <h2 className="text-sm font-semibold text-bv-accent uppercase tracking-widest mb-5">
              My Vote Receipts
            </h2>

            {loading && (
              <p className="text-bv-ink-muted text-sm">Loading your receipts...</p>
            )}
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            {!loading && !error && receipts.length === 0 && (
              <p className="text-bv-ink-muted text-sm">You have not cast any votes yet.</p>
            )}
            {!loading && !error && receipts.length > 0 && (
              <div className="space-y-4">
                {receipts.map((r) => {
                  const shortHash =
                    r.txHash.length > 14
                      ? `${r.txHash.slice(0, 10)}...${r.txHash.slice(-4)}`
                      : r.txHash
                  return (
                    <div
                      key={r.id}
                      className="py-3 border-b border-bv-border last:border-0"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <p className="text-bv-ink text-sm font-medium">
                            {r.election.title}
                          </p>
                          <p className="text-bv-ink-secondary text-xs">
                            Voted for {r.candidate.name}
                          </p>
                        </div>
                        <span className="text-bv-ink-muted text-xs">
                          {new Date(r.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-bv-accent text-xs font-mono">
                            {shortHash}
                          </span>
                          <button
                            type="button"
                            className="text-bv-ink-muted hover:text-bv-accent transition-colors"
                            onClick={() => navigator.clipboard.writeText(r.txHash)}
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="flex items-center gap-1 text-bv-ink-muted hover:text-bv-accent text-xs transition-colors"
                          onClick={() =>
                            window.open(
                              `https://sepolia.etherscan.io/tx/${r.txHash}`,
                              '_blank'
                            )
                          }
                        >
                          <ExternalLink size={13} />
                          Etherscan
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          {error && (
            <p className="mb-3 text-red-400 text-sm text-center">{error}</p>
          )}
          {loading && (
            <p className="mb-3 text-bv-ink-muted text-sm text-center">Verifying transaction...</p>
          )}
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
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={handleDownload}
            >
              <Download size={16} />
              <span className="ml-1">Download PDF</span>
            </Button>
          </div>

          {/* Note */}
          <div className="flex items-start gap-2 p-3 bg-bv-surface border border-bv-border rounded-lg">
            <div className="w-1 h-1 rounded-full bg-bv-accent mt-2 flex-shrink-0" />
            <p className="text-bv-ink-secondary text-xs leading-relaxed">
              Save your transaction hash to verify your vote at any time. Anyone can verify any vote using its transaction hash.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReceiptPage;
