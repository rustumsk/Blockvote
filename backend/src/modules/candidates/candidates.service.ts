import prisma from '../../config/db'
import { getContract } from '../../config/contract'

export const candidatesService = {
  async getList(electionId: string) {
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      select: { id: true },
    })
    if (!election) throw new Error('Election not found')
    return prisma.candidate.findMany({
      where: { electionId },
      orderBy: { createdAt: 'asc' },
    })
  },

  async create(electionId: string, data: { name: string; description?: string | null }) {
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    })
    if (!election) throw new Error('Election not found')
    if (election.status !== 'UPCOMING') {
      throw new Error('Candidates can only be added to elections with status UPCOMING')
    }
    const candidate = await prisma.candidate.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        electionId,
      },
    })
    const contract = getContract()
    const contractElectionId = election.contractElectionId
    let contractCandidateId: number | null = null
    if (contract && contractElectionId != null) {
      try {
        const tx = await contract.addCandidate(
          contractElectionId,
          data.name.trim(),
          data.description?.trim() ?? ''
        )
        const receipt = await tx.wait()
        const allLogs = receipt?.logs ?? []
        const contractAddress = (contract.target as string).toLowerCase()
        const ourLogs = allLogs.filter(
          (log: { address?: string }) => String(log?.address ?? '').toLowerCase() === contractAddress
        )
        const iface = contract.interface
        const logsToTry = ourLogs.length > 0 ? ourLogs : allLogs
        for (const log of logsToTry) {
          try {
            const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data })
            if (parsed?.name === 'CandidateAdded' && Number(parsed.args.electionId) === contractElectionId) {
              const id = parsed.args.candidateId
              contractCandidateId = id != null ? Number(id) : null
              break
            }
          } catch {
            // skip
          }
        }
      } catch (e) {
        console.error('Contract addCandidate failed:', e)
      }
    }
    if (contractCandidateId != null) {
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { contractCandidateId },
      })
    }
    return prisma.candidate.findUnique({
      where: { id: candidate.id },
    })!
  },
}
