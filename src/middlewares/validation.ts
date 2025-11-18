import type { Request, Response, NextFunction } from 'express'
import { AppError } from './errorHandler.js'

export const validateUUID = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (id && !uuidRegex.test(id)) {
    throw new AppError('Invalid project ID format', 400)
  }

  next()
}

export const validateScrapeRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { url } = req.body

  if (!url || typeof url !== 'string') {
    throw new AppError('URL is required', 400)
  }

  try {
    new URL(url)
  } catch {
    throw new AppError('Invalid URL format', 400)
  }

  next()
}

