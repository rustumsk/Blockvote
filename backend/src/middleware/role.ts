import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import prisma from '../config/db'

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

export const requireApprovedVoter = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'VOTER') {
    return res.status(403).json({ message: 'Voter access required' })
  }
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { status: true },
  })
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  if (user.status !== 'APPROVED') {
    return res.status(403).json({ message: 'Approved voter access required' })
  }
  next()
}
