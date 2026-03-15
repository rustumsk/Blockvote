import { Response } from 'express'
import { AuthRequest } from '../../middleware/auth'
import { electionsService } from './elections.service'

export const electionsController = {
  async getList(req: AuthRequest, res: Response) {
    try {
      const status = req.query.status as string | undefined
      const list = await electionsService.getList({ status })
      res.json(list)
    } catch (e) {
      res.status(500).json({ message: (e as Error).message })
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const election = await electionsService.getById(req.params.id)
      res.json(election)
    } catch (e) {
      if ((e as Error).message === 'Election not found') {
        return res.status(404).json({ message: 'Election not found' })
      }
      res.status(500).json({ message: (e as Error).message })
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const { title, description, startDate, endDate } = req.body
      if (!title || !description || !startDate || !endDate) {
        return res.status(400).json({ message: 'Missing required fields: title, description, startDate, endDate' })
      }
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' })
      }
      if (end <= start) {
        return res.status(400).json({ message: 'endDate must be after startDate' })
      }
      const now = Date.now()
      const oneMinuteFromNow = now + 60 * 1000
      if (start.getTime() < oneMinuteFromNow) {
        return res.status(400).json({ message: 'Start time must be in the future' })
      }
      const election = await electionsService.create({ title, description, startDate: start, endDate: end })
      res.status(201).json(election)
    } catch (e) {
      res.status(500).json({ message: (e as Error).message })
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const result = await electionsService.delete(id)
      res.json(result)
    } catch (e) {
      if ((e as Error).message === 'Election not found') {
        return res.status(404).json({ message: 'Election not found' })
      }
      res.status(500).json({ message: (e as Error).message })
    }
  },
}
