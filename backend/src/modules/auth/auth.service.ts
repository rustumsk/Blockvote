import bcrypt from 'bcryptjs'
import { ethers } from 'ethers'
import prisma from '../../config/db'
import { getContract } from '../../config/contract'
import { generateToken } from '../../utils/generateToken'
import { sendVerificationEmail } from '../../utils/sendEmail'

const SALT_ROUNDS = 10
const WALLET_LOGIN_NONCE_TTL_MS = 5 * 60 * 1000
const walletLoginNonces = new Map<string, { nonce: string; expiresAt: number }>()

const profileSelect = {
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

function normalizeWalletAddress(walletAddress: string) {
  return ethers.getAddress(walletAddress.trim())
}

function walletMatches(left?: string | null, right?: string | null) {
  if (!left || !right) return false
  return left.toLowerCase() === right.toLowerCase()
}

function buildWalletLoginMessage(walletAddress: string, nonce: string) {
  return [
    'Sign this message to log in to Blockvote.',
    '',
    `Wallet: ${walletAddress}`,
    `Nonce: ${nonce}`,
  ].join('\n')
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

export const authService = {
  async register(data: { name: string; email: string; password: string; phone?: string; walletAddress: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) throw new Error('Email already registered')

    const normalizedWalletAddress = normalizeWalletAddress(data.walletAddress)
    const existingWalletOwner = await prisma.user.findUnique({
      where: { walletAddress: normalizedWalletAddress },
      select: { id: true },
    })
    if (existingWalletOwner) throw new Error('Wallet already registered')

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS)
    const verifyToken = crypto.randomUUID()

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone ?? null,
        role: 'VOTER',
        status: 'PENDING',
        walletAddress: normalizedWalletAddress,
        isVerified: false,
        verifyToken,
      },
    })

    await sendVerificationEmail(data.email, verifyToken)
    return { message: 'Verification email sent' }
  },

  async verifyEmail(token: string) {
    const result = await prisma.user.updateMany({
      where: {
        verifyToken: token,
        isVerified: false
      },
      data: {
        isVerified: true,
        verifyToken: null
      }
    })

    if (result.count === 0) {
      return { message: "Token already used or invalid" }
    }

    return { message: "Email verified successfully" }
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('Invalid email or password')

    const match = await bcrypt.compare(password, user.password)
    if (!match) throw new Error('Invalid email or password')

    if (!user.isVerified) throw new Error('Please verify your email before logging in')

    const token = generateToken(user.id, user.role)
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        walletAddress: user.walletAddress,
      },
    }
  },

  async createWalletLoginNonce(walletAddress: string) {
    const normalizedWalletAddress = normalizeWalletAddress(walletAddress)
    const user = await prisma.user.findUnique({
      where: { walletAddress: normalizedWalletAddress },
      select: { id: true, isVerified: true },
    })

    if (!user) throw new Error('No account is linked to this wallet')
    if (!user.isVerified) throw new Error('Please verify your email before logging in')

    const nonce = crypto.randomUUID()
    walletLoginNonces.set(normalizedWalletAddress.toLowerCase(), {
      nonce,
      expiresAt: Date.now() + WALLET_LOGIN_NONCE_TTL_MS,
    })

    return {
      walletAddress: normalizedWalletAddress,
      message: buildWalletLoginMessage(normalizedWalletAddress, nonce),
    }
  },

  async loginWithWallet(walletAddress: string, signature: string) {
    const normalizedWalletAddress = normalizeWalletAddress(walletAddress)
    const user = await prisma.user.findUnique({ where: { walletAddress: normalizedWalletAddress } })
    if (!user) throw new Error('No account is linked to this wallet')
    if (!user.isVerified) throw new Error('Please verify your email before logging in')

    const nonceRecord = walletLoginNonces.get(normalizedWalletAddress.toLowerCase())
    if (!nonceRecord || nonceRecord.expiresAt < Date.now()) {
      walletLoginNonces.delete(normalizedWalletAddress.toLowerCase())
      throw new Error('Wallet login request expired. Please try again')
    }

    const expectedMessage = buildWalletLoginMessage(normalizedWalletAddress, nonceRecord.nonce)
    const recoveredAddress = ethers.verifyMessage(expectedMessage, signature)
    if (!walletMatches(recoveredAddress, normalizedWalletAddress)) {
      throw new Error('Wallet signature could not be verified')
    }

    walletLoginNonces.delete(normalizedWalletAddress.toLowerCase())

    const token = generateToken(user.id, user.role)
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        walletAddress: user.walletAddress,
      },
    }
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: profileSelect,
    })
    if (!user) throw new Error('User not found')
    return user
  },

  async updateWallet(userId: string, walletAddress: string) {
    const normalizedWalletAddress = normalizeWalletAddress(walletAddress)
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        status: true,
        walletAddress: true,
      },
    })
    if (!currentUser) throw new Error('User not found')

    const existingWalletOwner = await prisma.user.findFirst({
      where: {
        walletAddress: normalizedWalletAddress,
        NOT: { id: userId },
      },
      select: { id: true },
    })
    if (existingWalletOwner) {
      throw new Error('This wallet is already linked to another account')
    }

    if (walletMatches(currentUser.walletAddress, normalizedWalletAddress)) {
      return authService.me(userId)
    }

    const data: { walletAddress: string; status?: 'PENDING' } = {
      walletAddress: normalizedWalletAddress,
    }

    if (currentUser.status === 'APPROVED') {
      const contract = getContract()
      if (!contract) throw new Error('Voting contract is not configured')

      if (currentUser.walletAddress) {
        const approvedOnChain = await isWalletApprovedOnChain(currentUser.walletAddress)
        if (approvedOnChain) {
          const revokeTx = await contract.getFunction('revokeVoter')(currentUser.walletAddress)
          await revokeTx.wait()
        }
      }

      data.status = 'PENDING'
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: profileSelect,
    })
    return user
  },

  async updateProfile(userId: string, data: { name?: string; phone?: string | null }) {
    const update: { name?: string; phone?: string | null } = {}
    if (data.name !== undefined && data.name.trim()) update.name = data.name.trim()
    if (data.phone !== undefined) update.phone = data.phone === '' ? null : data.phone
    if (Object.keys(update).length === 0) return authService.me(userId)
    const user = await prisma.user.update({
      where: { id: userId },
      data: update,
      select: profileSelect,
    })
    return user
  },

  async deleteAccount(userId: string) {
    await prisma.$transaction([
      prisma.vote.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ])
    return { message: 'Account deleted successfully' }
  },
}
