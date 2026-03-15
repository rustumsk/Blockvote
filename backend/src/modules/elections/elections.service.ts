import prisma from '../../config/db'
import { getContract } from '../../config/contract'

function syncStatusByTime(election: { startDate: Date; endDate: Date; status: string }): 'UPCOMING' | 'ACTIVE' | 'CLOSED' {
  const now = new Date()
  const start = new Date(election.startDate)
  const end = new Date(election.endDate)
  if (now < start) return 'UPCOMING'
  if (now > end) return 'CLOSED'
  return 'ACTIVE'
}

async function syncElectionStatusInDb(id: string) {
  const election = await prisma.election.findUnique({ where: { id } })
  if (!election) return
  const derived = syncStatusByTime(election)
  if (derived !== election.status) {
    await prisma.election.update({
      where: { id },
      data: { status: derived },
    })
  }
}

export const electionsService = {
  async getList(query: { status?: string }) {
    const where: { status?: 'UPCOMING' | 'ACTIVE' | 'CLOSED' | 'PAUSED' } = {}
    if (query.status && ['UPCOMING', 'ACTIVE', 'CLOSED', 'PAUSED'].includes(query.status)) {
      where.status = query.status as 'UPCOMING' | 'ACTIVE' | 'CLOSED' | 'PAUSED'
    }
    const elections = await prisma.election.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: { _count: { select: { candidates: true } } },
    })
    const synced = []
    for (const e of elections) {
      const derived = syncStatusByTime(e)
      if (derived !== e.status) {
        await prisma.election.update({
          where: { id: e.id },
          data: { status: derived },
        })
        synced.push({ ...e, status: derived, _count: e._count })
      } else {
        synced.push(e)
      }
    }
    return synced.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      startDate: e.startDate,
      endDate: e.endDate,
      status: e.status,
      contractElectionId: e.contractElectionId,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      candidateCount: (e as { _count?: { candidates: number } })._count?.candidates ?? 0,
    }))
  },

  async getById(id: string) {
    const election = await prisma.election.findUnique({
      where: { id },
      include: { candidates: true },
    })
    if (!election) throw new Error('Election not found')
    await syncElectionStatusInDb(id)
    const updated = await prisma.election.findUnique({
      where: { id },
      include: { candidates: true },
    })
    return updated!
  },

  async create(data: { title: string; description: string; startDate: Date; endDate: Date }) {
    const startTs = Math.floor(new Date(data.startDate).getTime() / 1000)
    const endTs = Math.floor(new Date(data.endDate).getTime() / 1000)
    const election = await prisma.election.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'UPCOMING',
      },
    })
    const contract = getContract()
    let contractElectionId: number | null = null
    if (!contract) {
      console.warn('Contract not configured (CONTRACT_ADDRESS, RPC_URL, PRIVATE_KEY). Election saved to DB only; contractElectionId will be null.')
    } else {
      try {
        const tx = await contract.createElection(data.title, data.description, startTs, endTs)
        const receipt = await tx.wait()
        const allLogs = receipt?.logs ?? []
        const contractAddress = (contract.target as string).toLowerCase()
        const ourLogs = allLogs.filter((log: { address?: string }) => String(log?.address ?? '').toLowerCase() === contractAddress)
        const iface = contract.interface
        const logsToTry = ourLogs.length > 0 ? ourLogs : allLogs
        for (const log of logsToTry) {
          try {
            const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data })
            if (parsed?.name === 'ElectionCreated') {
              const id = parsed.args.electionId
              contractElectionId = id != null ? Number(id) : null
              if (contractElectionId != null) break
            }
          } catch {
            // skip logs that don't match our ABI
          }
        }
        if (contractElectionId == null && allLogs.length > 0) {
          console.warn('createElection tx succeeded but ElectionCreated event not found. Our logs:', ourLogs.length, 'total logs:', allLogs.length)
        }
      } catch (e) {
        console.error('Contract createElection failed:', e)
      }
    }
    if (contractElectionId != null) {
      await prisma.election.update({
        where: { id: election.id },
        data: { contractElectionId },
      })
    }
    const created = await prisma.election.findUnique({
      where: { id: election.id },
      include: { _count: { select: { candidates: true } } },
    })
    if (!created) throw new Error('Election not found after create')
    const { _count, ...e } = created
    return { ...e, candidateCount: _count.candidates }
  },
}
