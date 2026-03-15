import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { requireAdmin } from '../../middleware/role'
import { candidatesController } from './candidates.controller'

const router = Router({ mergeParams: true })

router.get('/', candidatesController.getList.bind(candidatesController))
router.post('/', authenticate, requireAdmin, candidatesController.create.bind(candidatesController))

export default router
