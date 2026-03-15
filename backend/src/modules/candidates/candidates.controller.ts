import { Response } from 'express'
import { AuthRequest } from '../../middleware/auth'
import { candidatesService } from './candidates.service'

export const candidatesController = {
  async getList(req: AuthRequest, res: Response) {
    try {
      const electionId = req.params.electionId
      const list = await candidatesService.getList(electionId)
      res.json(list)
    } catch (e) {
      if ((e as Error).message === 'Election not found') {
        return res.status(404).json({ message: 'Election not found' })
      }
      res.status(500).json({ message: (e as Error).message })
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const electionId = req.params.electionId
      const { name, description } = req.body
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'name is required' })
      }
      const candidate = await candidatesService.create(electionId, {
        name: name.trim(),
        description: description != null ? String(description) : undefined,
      })
      res.status(201).json(candidate)
    } catch (e) {
      if ((e as Error).message === 'Election not found') {
        return res.status(404).json({ message: 'Election not found' })
      }
      if ((e as Error).message === 'Candidates can only be added to elections with status UPCOMING') {
        return res.status(400).json({ message: (e as Error).message })
      }
      res.status(500).json({ message: (e as Error).message })
    }
  },
}
