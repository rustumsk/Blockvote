import prisma from '../../config/db'
import { getContract } from '../../config/contract'

export const resultsService = {
  async getElectionResults(electionId: string) {
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    })
    if (!election) throw new Error('Election not found')
    if (election.contractElectionId == null) {
      throw new Error('Election is not synced to the contract')
    }

    const contract = getContract()
    if (!contract) throw new Error('Voting contract is not configured')

    const [candidateIds, names, voteCounts] = (await contract.getResults(
      election.contractElectionId
    )) as [bigint[], string[], bigint[]]

    const candidates = candidateIds.map((id, idx) => ({
      contractCandidateId: Number(id),
      name: names[idx],
      voteCount: Number(voteCounts[idx]),
    }))

    let winner: { contractCandidateId: number; name: string; voteCount: number } | null = null
    if (election.status === 'CLOSED') {
      const [winnerId, winnerName, winnerVotes] = (await contract.getWinner(
        election.contractElectionId
      )) as [bigint, string, bigint]
      winner = {
        contractCandidateId: Number(winnerId),
        name: winnerName,
        voteCount: Number(winnerVotes),
      }
    }

    const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0)

    return {
      candidates,
      winner,
      totalVotes,
    }
  },

  async getElectionLogs(electionId: string) {
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    })
    if (!election) throw new Error('Election not found')

    const votes = await prisma.vote.findMany({
      where: { electionId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        txHash: true,
        createdAt: true,
        candidateId: true,
      },
    })

    return votes
  },
}

