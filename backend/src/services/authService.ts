// Authentication service for password hashing and JWT

import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config'

const JWT_SECRET = config.jwtSecret || 'your-super-secret-key-change-in-production'
const JWT_EXPIRY = '15m'

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

export function generateAccessToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY })
}

export function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error: any) {
    // Re-throw TokenExpiredError for callers to distinguish
    if (error?.name === 'TokenExpiredError') throw error
    return null
  }
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
