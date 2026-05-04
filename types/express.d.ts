import { Request } from 'express'
import type { Session } from 'better-auth'

declare global {
  namespace Express {
    interface Request {
      user?: any
      session?: Session
    }
  }
}
