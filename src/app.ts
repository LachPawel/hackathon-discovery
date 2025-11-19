import express, { type Express } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import projectRoutes from './routes/projectRoutes.js'
import statsRoutes from './routes/statsRoutes.js'
import actionRoutes from './routes/actionRoutes.js'
import { errorHandler } from './middlewares/errorHandler.js'

dotenv.config()

export const createApp = (): Express => {
  const app = express()

  // Middlewares
  app.use(cors())
  app.use(express.json())

  // Routes
  app.use('/api/projects', projectRoutes)
  app.use('/api/stats', statsRoutes)
  app.use('/api', actionRoutes)

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  // Error handler (must be last)
  app.use(errorHandler)

  return app
}

