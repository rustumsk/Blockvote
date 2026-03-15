import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { requireApprovedVoter } from '../../middleware/role'
import { votesController } from './votes.controller'

const router = Router()

router.post('/', authenticate, requireApprovedVoter, votesController.cast.bind(votesController))
router.get('/my', authenticate, requireApprovedVoter, votesController.myVotes.bind(votesController))
router.get('/verify/:txHash', votesController.verify.bind(votesController))

export default router

