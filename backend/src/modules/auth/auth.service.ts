import bcrypt from 'bcryptjs'
import prisma from '../../config/db'
import { generateToken } from '../../utils/generateToken'
import { sendVerificationEmail } from '../../utils/sendEmail'

const SALT_ROUNDS = 10

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
    const user = await prisma.user.findFirst({ where: { verifyToken: token } })
    if (!user) throw new Error('Invalid or expired verification token')

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verifyToken: null },
    })
    return { message: 'Email verified successfully' }
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
      select: {
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
      },
    })
    if (!user) throw new Error('User not found')
    return user
  },

  async updateWallet(userId: string, walletAddress: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { walletAddress },
      select: {
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
      },
    })
    return user
  },
}
