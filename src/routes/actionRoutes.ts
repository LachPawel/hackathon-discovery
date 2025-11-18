import { Router } from 'express'
import { ActionController } from '../controllers/ActionController.js'
import { asyncHandler } from '../middlewares/errorHandler.js'
import { validateUUID, validateScrapeRequest } from '../middlewares/validation.js'

const router = Router()
const actionController = new ActionController()

router.post('/scrape', validateScrapeRequest, asyncHandler(actionController.scrapeHackathon.bind(actionController)))
router.post('/research/:id', validateUUID, asyncHandler(actionController.researchProject.bind(actionController)))

export default router

