import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

export const requireApprovedVoter = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'VOTER') {
    return res.status(403).json({ message: 'Voter access required' })
  }
  next()
}
