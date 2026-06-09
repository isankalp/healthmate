// OTP service for signup and forgot password flows

interface OtpRecord {
  email: string
  code: string
  expiresAt: Date
  attempts: number
  isUsed: boolean
  otpType: 'signup' | 'forgot_password'
}

const OTP_EXPIRY_MINUTES = 10
const MAX_ATTEMPTS = 3

// In-memory OTP store (replace with DB in production)
const otpStore = new Map<string, OtpRecord>()

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function createOTP(email: string, otpType: 'signup' | 'forgot_password'): string {
  const code = generateOTP()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  otpStore.set(`${email}:${otpType}`, {
    email,
    code,
    expiresAt,
    attempts: 0,
    isUsed: false,
    otpType,
  })

  return code
}

export function verifyOTP(email: string, code: string, otpType: 'signup' | 'forgot_password'): boolean {
  const key = `${email}:${otpType}`
  const record = otpStore.get(key)

  if (!record) {
    return false
  }

  // Check expiry
  if (new Date() > record.expiresAt) {
    otpStore.delete(key)
    return false
  }

  // Check attempts
  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(key)
    return false
  }

  // Check code
  if (record.code !== code) {
    record.attempts += 1
    return false
  }

  // Mark as used
  record.isUsed = true
  return true
}

export function invalidateOTP(email: string, otpType: 'signup' | 'forgot_password'): void {
  otpStore.delete(`${email}:${otpType}`)
}

export function getOTPAttempts(email: string, otpType: 'signup' | 'forgot_password'): number {
  const key = `${email}:${otpType}`
  const record = otpStore.get(key)
  return record ? record.attempts : 0
}

export function isOTPVerified(email: string, otpType: 'signup' | 'forgot_password'): boolean {
  const key = `${email}:${otpType}`
  const record = otpStore.get(key)
  return !!(record && record.isUsed && new Date() <= record.expiresAt)
}
