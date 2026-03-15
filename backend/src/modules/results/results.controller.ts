import { Response } from 'express'
import { AuthRequest } from '../../middleware/auth'
import { resultsService } from './results.service'

export const resultsController = {
  async getResults(req: AuthRequest, res: Response) {
    try {
      const { electionId } = req.params
      const data = await resultsService.getElectionResults(electionId)
      res.json(data)
    } catch (e) {
      if ((e as Error).message === 'Election not found') {
        return res.status(404).json({ message: 'Election not found' })
      }
      res.status(400).json({ message: (e as Error).message })
    }
  },

  async getLogs(req: AuthRequest, res: Response) {
    try {
      const { electionId } = req.params
      const logs = await resultsService.getElectionLogs(electionId)
      res.json(
        logs.map((v) => ({
          id: v.id,
          txHash: v.txHash,
          candidateId: v.candidateId,
          timestamp: v.createdAt,
        }))
      )
    } catch (e) {
      if ((e as Error).message === 'Election not found') {
        return res.status(404).json({ message: 'Election not found' })
      }
      res.status(500).json({ message: (e as Error).message })
    }
  },
}

