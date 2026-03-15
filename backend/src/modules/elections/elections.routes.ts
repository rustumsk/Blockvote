import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { requireAdmin } from '../../middleware/role'
import { electionsController } from './elections.controller'
import candidatesRoutes from '../candidates/candidates.routes'

const router = Router()

router.get('/', electionsController.getList.bind(electionsController))
router.post('/', authenticate, requireAdmin, electionsController.create.bind(electionsController))
router.use('/:electionId/candidates', candidatesRoutes)
router.get('/:id', electionsController.getById.bind(electionsController))

export default router
