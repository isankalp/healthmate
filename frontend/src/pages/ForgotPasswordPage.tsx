import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

type Step = 'email' | 'otp' | 'password'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(600)
  const [debugOtp, setDebugOtp] = useState<string | null>(null)

  useEffect(() => {
    if (step === 'otp' && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000)
      return () => clearInterval(interval)
    }
  }, [step, timer])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to send OTP')
        return
      }

      if (data.data?.debugOtp) setDebugOtp(data.data.debugOtp)
      setTimer(600)
      setStep('otp')
    } catch {
      setError('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Invalid OTP')
        return
      }

      setStep('password')
    } catch {
      setError('Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to reset password')
        return
      }

      navigate('/login', { state: { message: 'Password reset successfully. Please sign in.' } })
    } catch {
      setError('Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {step === 'email' && (
          <>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">Forgot Password</h1>
            <p className="text-gray-600 mb-6">Enter your email and we'll send you a verification code.</p>

            <form onSubmit={handleSendOTP}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Code'}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                <button type="button" onClick={() => navigate('/login')} className="text-blue-600 hover:underline">
                  Back to sign in
                </button>
              </p>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">Enter Verification Code</h1>
            <p className="text-gray-600 mb-6">We sent a code to {email}</p>

            <form onSubmit={handleVerifyOTP}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                />
              </div>

              {debugOtp && (
                <div className="mb-4 p-3 bg-yellow-100 text-yellow-900 rounded">
                  Debug OTP (local dev): <strong>{debugOtp}</strong>
                </div>
              )}

              <div className="mb-4 text-center text-sm text-gray-600">
                {timer > 0
                  ? `Code expires in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`
                  : 'Code expired'}
              </div>

              {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(''); setError('') }}
                  className="text-blue-600 hover:underline"
                >
                  Try a different email
                </button>
              </p>
            </form>
          </>
        )}

        {step === 'password' && (
          <>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">Set New Password</h1>
            <p className="text-gray-600 mb-6">Choose a strong password for your account.</p>

            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Min 8 chars, 1 uppercase, 1 number, 1 special char (!@#$%^&*)
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

              <button
                type="submit"
                disabled={loading || !password || password !== confirmPassword}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
