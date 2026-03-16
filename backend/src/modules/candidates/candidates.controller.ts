import { Response } from 'express'
import { AuthRequest } from '../../middleware/auth'
import { candidatesService } from './candidates.service'
import type { UploadedPhotoFile } from '../../config/s3'

export const candidatesController = {
  async getList(req: AuthRequest, res: Response) {
    try {
      const electionId = String(req.params.electionId ?? '')
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
      const electionId = String(req.params.electionId ?? '')
      const { name, description, credentials } = req.body
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'name is required' })
      }
      const candidate = await candidatesService.create(electionId, {
        name: name.trim(),
        description: description != null ? String(description) : undefined,
        credentials: credentials != null ? String(credentials) : undefined,
        photoFile: (req as AuthRequest & { file?: UploadedPhotoFile }).file,
      })
      res.status(201).json(candidate)
    } catch (e) {
      if ((e as Error).message === 'Election not found') {
        return res.status(404).json({ message: 'Election not found' })
      }
      if ((e as Error).message === 'Candidates can only be added to elections with status UPCOMING') {
        return res.status(400).json({ message: (e as Error).message })
      }
      if ((e as Error).message === 'S3 upload is not configured on the backend') {
        return res.status(500).json({ message: (e as Error).message })
      }
      if ((e as Error).message === 'Only JPG, PNG, WEBP, and GIF images are allowed') {
        return res.status(400).json({ message: (e as Error).message })
      }
      res.status(500).json({ message: (e as Error).message })
    }
  },

  async getPhoto(req: AuthRequest, res: Response) {
    try {
      const electionId = String(req.params.electionId ?? '')
      const candidateId = String(req.params.candidateId ?? '')
      const photo = await candidatesService.getPhoto(electionId, candidateId)
      res.setHeader('Content-Type', photo.contentType)
      res.setHeader('Cache-Control', 'public, max-age=3600')
      res.send(photo.buffer)
    } catch (e) {
      if (
        (e as Error).message === 'Candidate not found' ||
        (e as Error).message === 'Candidate photo not found'
      ) {
        return res.status(404).json({ message: (e as Error).message })
      }

      res.status(500).json({ message: (e as Error).message })
    }
  },
}
