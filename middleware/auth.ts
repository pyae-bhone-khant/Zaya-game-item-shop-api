import { auth } from "../lib/auth"
import type { NextFunction, Request, Response } from "express"
import type { Session } from "better-auth"

declare global {
  namespace Express {
    interface Request {
      user?: any
      session?: any
    }
  }
}

export const AuthMiddleware =  async (req: Request , res: Response , next : NextFunction) => {
    const session = await auth.api.getSession({
        headers : req.headers
    })
     if (!session) {
        return  res.status(401).json({message : "Please login"})
     } 
req.user = session.user 
req.session = session.session
next()
}

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if ( req.user && req.user?.role === "ADMIN") {
      next()
    } else {
        return res.status(403).json({message: "Forbidden"})
    }
}
