import { Router } from 'express'
import { StatsController } from '../controllers/StatsController.js'
import { asyncHandler } from '../middlewares/errorHandler.js'

const router = Router()
const statsController = new StatsController()

router.get('/', asyncHandler(statsController.getStats.bind(statsController)))

export default router

