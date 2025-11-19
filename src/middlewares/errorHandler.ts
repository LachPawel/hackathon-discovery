import type { Request, Response, NextFunction } from 'express'
import type { ApiError } from '../types/index.js'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500
  const message = err.message || 'Internal Server Error'

  const errorResponse: ApiError = {
    error: message
  }

  if (process.env.NODE_ENV === 'development') {
    errorResponse.message = err.stack
  }

  res.status(statusCode).json(errorResponse)
}

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

