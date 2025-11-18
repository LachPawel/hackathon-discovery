import { Router } from 'express'
import { ProjectController } from '../controllers/ProjectController.js'
import { asyncHandler } from '../middlewares/errorHandler.js'
import { validateUUID } from '../middlewares/validation.js'

const router = Router()
const projectController = new ProjectController()

router.get('/', asyncHandler(projectController.getProjects.bind(projectController)))
router.get('/leaderboard', asyncHandler(projectController.getLeaderboard.bind(projectController)))
router.get('/success-stories', asyncHandler(projectController.getSuccessStories.bind(projectController)))
router.get('/:id', validateUUID, asyncHandler(projectController.getProjectById.bind(projectController)))

export default router

