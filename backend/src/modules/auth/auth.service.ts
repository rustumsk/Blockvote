import bcrypt from 'bcryptjs'
import prisma from '../../config/db'
import { generateToken } from '../../utils/generateToken'
import { sendVerificationEmail } from '../../utils/sendEmail'

const SALT_ROUNDS = 10

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

export const authService = {
  async register(data: { name: string; email: string; password: string; phone?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) throw new Error('Email already registered')

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

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: profileSelect,
    })
    if (!user) throw new Error('User not found')
    return user
  },

  async updateWallet(userId: string, walletAddress: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { walletAddress },
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
