import { Resend } from 'resend'
import { config } from '../config'

export interface SendOTPResult {
  success: boolean
  debugCode?: string
  error?: string
}

const resendClient = config.resendApiKey ? new Resend(config.resendApiKey) : null
const isDev = config.nodeEnv !== 'production'

export async function sendOTP(email: string, code: string): Promise<SendOTPResult> {
  try {
    if (resendClient) {
      await resendClient.emails.send({
        from: config.adminEmail || 'noreply@healthmate.app',
        to: email,
        subject: 'HealthMate OTP Verification',
        html: `Your OTP is <strong>${code}</strong>. It is valid for 10 minutes.`,
      })
      return { success: true }
    }

    console.warn(`[OTP] RESEND_API_KEY is not configured. Falling back to console/debug output.`)
    console.log(`[OTP] Email: ${email}, Code: ${code}`)

    if (isDev) {
      return { success: true, debugCode: code }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to send OTP:', error)
    return { success: false, error: 'Failed to send OTP' }
  }
}
