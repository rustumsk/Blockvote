import prisma from '../../config/db'
import { getContract } from '../../config/contract'

const userListSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  walletAddress: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
}

type UserListWhere = {
  role?: 'ADMIN' | 'VOTER'
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  OR?: Array<{
    name?: { contains: string; mode: 'insensitive' }
    email?: { contains: string; mode: 'insensitive' }
  }>
}

async function isWalletApprovedOnChain(walletAddress: string) {
  const contract = getContract()
  if (!contract) throw new Error('Voting contract is not configured')

  try {
    const isApproved = await contract.getFunction('isVoterApproved')(walletAddress)
    return Boolean(isApproved)
  } catch {
    const voter = await contract.getFunction('voters')(walletAddress)
    if (Array.isArray(voter)) {
      return Boolean(voter[0])
    }
    if (typeof voter === 'object' && voter != null && 'isApproved' in voter) {
      return Boolean((voter as { isApproved?: boolean }).isApproved)
    }
    return false
  }
}

export const usersService = {
  async getUsers(query: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, query.page ?? 1)
    const limit = Math.min(100, Math.max(1, query.limit ?? 50))
    const skip = (page - 1) * limit

    const where: UserListWhere = { role: 'VOTER' }
    if (query.status && ['PENDING', 'APPROVED', 'REJECTED'].includes(query.status)) {
      where.status = query.status as 'PENDING' | 'APPROVED' | 'REJECTED'
    }
    if (query.search?.trim()) {
      const term = query.search.trim()
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userListSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])
    return { users, total, page, limit }
  },

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userListSelect,
    })
    if (!user) throw new Error('User not found')
    return user
  },

  async deleteUser(adminId: string, userId: string) {
    if (adminId === userId) throw new Error('You cannot delete your own account')
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')
    await prisma.$transaction([
      prisma.vote.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ])
    return { message: 'User deleted successfully' }
  },

  async approveUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')
    if (user.role !== 'VOTER') throw new Error('Only voter accounts can be approved')
    if (!user.walletAddress) throw new Error('Voter must link a wallet before approval')

    const contract = getContract()
    if (!contract) throw new Error('Voting contract is not configured')

    const approvedOnChain = await isWalletApprovedOnChain(user.walletAddress)
    if (!approvedOnChain) {
      const tx = await contract.getFunction('approveVoter')(user.walletAddress)
      await tx.wait()
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'APPROVED' },
    })
    return { message: 'Voter approved' }
  },

  async rejectUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')
    if (user.role !== 'VOTER') throw new Error('Only voter accounts can be rejected')

    if (user.status === 'APPROVED' && user.walletAddress) {
      const contract = getContract()
      if (!contract) throw new Error('Voting contract is not configured')

      const approvedOnChain = await isWalletApprovedOnChain(user.walletAddress)
      if (approvedOnChain) {
        const tx = await contract.getFunction('revokeVoter')(user.walletAddress)
        await tx.wait()
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'REJECTED' },
    })
    return { message: 'Voter rejected' }
  },

  async revokeUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')
    if (user.role !== 'VOTER') throw new Error('Only voter accounts can be revoked')

    if (user.walletAddress) {
      const contract = getContract()
      if (!contract) throw new Error('Voting contract is not configured')

      const approvedOnChain = await isWalletApprovedOnChain(user.walletAddress)
      if (approvedOnChain) {
        const tx = await contract.getFunction('revokeVoter')(user.walletAddress)
        await tx.wait()
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'PENDING' },
    })
    return { message: 'Voter revoked' }
  },
}
