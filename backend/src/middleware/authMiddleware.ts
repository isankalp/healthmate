import express from 'express'
import { verifyJWT } from '../services/authService'
import { supabase } from '../db/client'

export interface AuthRequest extends express.Request {
  user?: {
    userId: string
    email: string
  }
}

export async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void | express.Response> {
  try {
    const authorization = req.headers.authorization
    if (!authorization?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Missing authorization token' })
    }

    const token = authorization.replace('Bearer ', '').trim()
    let payload
    try {
      payload = verifyJWT(token)
    } catch (err: any) {
      if (err?.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'token_expired' })
      }
      return res.status(401).json({ success: false, error: 'invalid_token' })
    }

    if (!payload || typeof payload !== 'object' || !payload.userId) {
      return res.status(401).json({ success: false, error: 'invalid_token' })
    }

    const { data: user, error } = await supabase.from('users').select('id,email').eq('id', payload.userId).single()
    if (error || !user) {
      return res.status(401).json({ success: false, error: 'unauthorized' })
    }

    ;(req as AuthRequest).user = {
      userId: payload.userId,
      email: payload.email,
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ success: false, error: 'unauthorized' })
  }
}
