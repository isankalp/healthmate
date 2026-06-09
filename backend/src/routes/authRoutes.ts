// Auth routes for signup, login, and password flows

import express from 'express'
import { checkEmail, sendSignupOTP, verifySignupOTP, createPassword, login, refreshToken, logout, sendForgotPasswordOTP, verifyForgotPasswordOTP, resetPassword, changePassword } from '../controllers/authController'
import { requireAuth } from '../middleware/authMiddleware'
import { getProfile, updateProfile } from '../controllers/profileController'

export const authRouter = express.Router()

// Email check
authRouter.post('/signup/check-email', checkEmail)

// OTP flows
authRouter.post('/signup/send-otp', sendSignupOTP)
authRouter.post('/signup/verify-otp', verifySignupOTP)

// Password creation
authRouter.post('/signup/create-password', createPassword)

// Login
authRouter.post('/login', login)

// Profile routes
authRouter.get('/profile', requireAuth, getProfile)
authRouter.put('/profile', requireAuth, updateProfile)

// Token refresh and logout
authRouter.post('/refresh', refreshToken)
authRouter.post('/logout', requireAuth, logout)

// Forgot password (no auth required)
authRouter.post('/forgot-password/send-otp', sendForgotPasswordOTP)
authRouter.post('/forgot-password/verify-otp', verifyForgotPasswordOTP)
authRouter.post('/forgot-password/reset', resetPassword)

// Change password (authenticated)
authRouter.post('/change-password', requireAuth, changePassword)
