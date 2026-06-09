// Auth controller for handling signup, login, and password flows

import express from 'express'
import { supabase } from '../db/client'
import { sendOTP } from '../services/emailService'
import { hashPassword, verifyPassword, generateAccessToken, validatePassword, validateEmail } from '../services/authService'
import { createRefreshToken, verifyAndRotateRefreshToken, revokeRefreshTokensForUser } from '../services/refreshTokenService'
import { createOTP, verifyOTP, isOTPVerified, invalidateOTP } from '../services/otpService'
import { config } from '../config'
import { AuthRequest } from '../middleware/authMiddleware'

// In-memory OTP store (will be replaced with DB)
const otpStore = new Map<string, any>()

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function storeOTP(email: string, type: 'signup' | 'forgot_password'): string {
  const code = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
  otpStore.set(`${email}:${type}`, {
    code,
    expiresAt,
    attempts: 0,
    isUsed: false,
  })
  return code
}

export async function checkEmail(req: express.Request, res: express.Response): Promise<void> {
  try {
    const { email } = req.body

    if (!email || !validateEmail(email)) {
      res.status(400).json({ success: false, error: 'Invalid email format' })
      return
    }

    const { data } = await supabase.from('users').select('id').eq('email', email).single()

    res.json({
      success: true,
      data: {
        exists: !!data,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to check email' })
  }
}

export async function sendSignupOTP(req: express.Request, res: express.Response): Promise<void> {
  try {
    const { email } = req.body

    if (!email || !validateEmail(email)) {
      res.status(400).json({ success: false, error: 'Invalid email format' })
      return
    }

    const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single()

    if (existingUser) {
      res.status(400).json({ success: false, error: 'Email already registered' })
      return
    }

    const code = storeOTP(email, 'signup')
    const result = await sendOTP(email, code)

    if (!result.success) {
      res.status(500).json({ success: false, error: result.error || 'Failed to send OTP' })
      return
    }

    res.json({
      success: true,
      data: {
        expiresIn: 600,
        ...(result.debugCode ? { debugOtp: result.debugCode } : {}),
      },
    })
  } catch (error) {
    console.error('Error sending OTP:', error)
    res.status(500).json({ success: false, error: 'Failed to send OTP' })
  }
}

export async function verifySignupOTP(req: express.Request, res: express.Response): Promise<void> {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      res.status(400).json({ success: false, error: 'Email and OTP required' })
      return
    }

    const key = `${email}:signup`
    const record = otpStore.get(key)

    if (!record) {
      res.status(400).json({ success: false, error: 'Invalid OTP' })
      return
    }

    if (new Date() > record.expiresAt) {
      otpStore.delete(key)
      res.status(400).json({ success: false, error: 'OTP expired' })
      return
    }

    if (record.attempts >= 3) {
      otpStore.delete(key)
      res.status(400).json({ success: false, error: 'Max OTP attempts exceeded. Request a new code.' })
      return
    }

    if (record.code !== otp) {
      record.attempts += 1
      res.status(400).json({ success: false, error: 'Invalid OTP' })
      return
    }

    record.isUsed = true
    res.json({ success: true, data: {} })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to verify OTP' })
  }
}

export async function createPassword(req: express.Request, res: express.Response): Promise<void> {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password required' })
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      res.status(400).json({ success: false, error: passwordValidation.errors.join(', ') })
      return
    }

    const record = otpStore.get(`${email}:signup`)
    if (!record || !record.isUsed) {
      res.status(400).json({ success: false, error: 'OTP verification required' })
      return
    }

    const passwordHash = await hashPassword(password)

    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash: passwordHash,
          profile_complete: false,
        },
      ])
      .select()
      .single()

    if (error || !newUser) {
      console.error('Supabase insert error:', error)
      res.status(500).json({ success: false, error: 'Failed to create user' })
      return
    }

    otpStore.delete(`${email}:signup`)
    const accessToken = generateAccessToken(newUser.id, email)
    const refresh = await createRefreshToken(newUser.id, config.refreshTokenDays)

    if (refresh) {
      res.cookie(config.refreshCookieName, refresh.raw, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: config.refreshTokenDays * 24 * 60 * 60 * 1000,
      })
    }

    res.json({
      success: true,
      data: {
        token: accessToken,
        requiresProfileSetup: true,
      },
    })
  } catch (error) {
    console.error('Error creating password:', error)
    res.status(500).json({ success: false, error: 'Failed to create account' })
  }
}

export async function login(req: express.Request, res: express.Response): Promise<void> {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password required' })
      return
    }

    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single()

    if (error || !user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' })
      return
    }

    const passwordValid = await verifyPassword(password, user.password_hash)

    if (!passwordValid) {
      res.status(401).json({ success: false, error: 'Invalid email or password' })
      return
    }

    const accessToken = generateAccessToken(user.id, email)
    const refresh = await createRefreshToken(user.id, config.refreshTokenDays)

    if (refresh) {
      res.cookie(config.refreshCookieName, refresh.raw, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: config.refreshTokenDays * 24 * 60 * 60 * 1000,
      })
    }

    res.json({
      success: true,
      data: {
        token: accessToken,
        requiresProfileSetup: !user.profile_complete,
      },
    })
  } catch (error) {
    console.error('Error logging in:', error)
    res.status(500).json({ success: false, error: 'Login failed' })
  }
}

export async function refreshToken(req: express.Request, res: express.Response): Promise<void> {
  try {
    const raw = req.cookies?.[config.refreshCookieName]
    if (!raw) {
      res.status(401).json({ success: false, error: 'no_refresh_token' })
      return
    }

    const rotated = await verifyAndRotateRefreshToken(raw)
    if (!rotated) {
      res.status(401).json({ success: false, error: 'invalid_refresh' })
      return
    }

    // fetch user email for token
    const { data: user, error: userErr } = await supabase.from('users').select('email').eq('id', rotated.userId).single()
    if (userErr || !user) {
      res.status(500).json({ success: false, error: 'user_not_found' })
      return
    }

    // issue new access token
    const accessToken = generateAccessToken(rotated.userId, user.email)

    // set new cookie
    res.cookie(config.refreshCookieName, rotated.raw, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: config.refreshTokenDays * 24 * 60 * 60 * 1000,
    })

    res.json({ success: true, data: { token: accessToken } })
  } catch (error) {
    console.error('Error refreshing token:', error)
    res.status(500).json({ success: false, error: 'refresh_failed' })
  }
}

export async function logout(req: express.Request, res: express.Response): Promise<void> {
  try {
    const authReq = req as AuthRequest
    const userId = authReq.user?.userId
    if (userId) {
      await revokeRefreshTokensForUser(userId)
    }
    res.clearCookie(config.refreshCookieName)
    res.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ success: false, error: 'logout_failed' })
  }
}

export async function sendForgotPasswordOTP(req: express.Request, res: express.Response): Promise<void> {
  try {
    const { email } = req.body

    if (!email || !validateEmail(email)) {
      res.status(400).json({ success: false, error: 'Invalid email format' })
      return
    }

    const { data: user } = await supabase.from('users').select('id').eq('email', email).single()
    if (!user) {
      // Don't reveal whether the email exists
      res.json({ success: true, data: { expiresIn: 600 } })
      return
    }

    const code = createOTP(email, 'forgot_password')
    const result = await sendOTP(email, code)

    if (!result.success) {
      res.status(500).json({ success: false, error: result.error || 'Failed to send OTP' })
      return
    }

    res.json({
      success: true,
      data: {
        expiresIn: 600,
        ...(result.debugCode ? { debugOtp: result.debugCode } : {}),
      },
    })
  } catch (error) {
    console.error('Error sending forgot password OTP:', error)
    res.status(500).json({ success: false, error: 'Failed to send OTP' })
  }
}

export async function verifyForgotPasswordOTP(req: express.Request, res: express.Response): Promise<void> {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      res.status(400).json({ success: false, error: 'Email and OTP required' })
      return
    }

    const valid = verifyOTP(email, otp, 'forgot_password')
    if (!valid) {
      res.status(400).json({ success: false, error: 'Invalid or expired OTP' })
      return
    }

    res.json({ success: true, data: {} })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to verify OTP' })
  }
}

export async function resetPassword(req: express.Request, res: express.Response): Promise<void> {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and new password required' })
      return
    }

    if (!isOTPVerified(email, 'forgot_password')) {
      res.status(400).json({ success: false, error: 'OTP verification required' })
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      res.status(400).json({ success: false, error: passwordValidation.errors.join(', ') })
      return
    }

    const passwordHash = await hashPassword(password)
    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('email', email)

    if (error) {
      console.error('Reset password DB error:', error)
      res.status(500).json({ success: false, error: 'Failed to reset password' })
      return
    }

    invalidateOTP(email, 'forgot_password')
    res.json({ success: true, data: {} })
  } catch (error) {
    console.error('Error resetting password:', error)
    res.status(500).json({ success: false, error: 'Failed to reset password' })
  }
}

export async function changePassword(req: express.Request, res: express.Response): Promise<void> {
  try {
    const authReq = req as AuthRequest
    const userId = authReq.user?.userId
    const { currentPassword, newPassword } = req.body

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' })
      return
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, error: 'Current password and new password required' })
      return
    }

    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single()

    if (userErr || !user) {
      res.status(401).json({ success: false, error: 'Unauthorized' })
      return
    }

    const currentValid = await verifyPassword(currentPassword, user.password_hash)
    if (!currentValid) {
      res.status(400).json({ success: false, error: 'Current password is incorrect' })
      return
    }

    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      res.status(400).json({ success: false, error: passwordValidation.errors.join(', ') })
      return
    }

    const newHash = await hashPassword(newPassword)
    const { error: updateErr } = await supabase
      .from('users')
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (updateErr) {
      console.error('Change password DB error:', updateErr)
      res.status(500).json({ success: false, error: 'Failed to change password' })
      return
    }

    await revokeRefreshTokensForUser(userId)
    res.clearCookie(config.refreshCookieName)
    res.json({ success: true, data: {} })
  } catch (error) {
    console.error('Error changing password:', error)
    res.status(500).json({ success: false, error: 'Failed to change password' })
  }
}
