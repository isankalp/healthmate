import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export function OTPVerifyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'otp' | 'password'>('otp')
  const [timer, setTimer] = useState(600)
  const [debugOtp, setDebugOtp] = useState<string | null>(null)

  const state = location.state as any
  const email = state?.email

  useEffect(() => {
    if (!email) {
      navigate('/signup')
      return
    }

    const storedOtp = sessionStorage.getItem('debugOtp')
    setDebugOtp(state?.debugOtp || storedOtp)
  }, [email, navigate, state])

  useEffect(() => {
    if (step === 'otp' && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000)
      return () => clearInterval(interval)
    }
  }, [step, timer])

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Invalid OTP')
      } else {
        setStep('password')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup/create-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to create account')
      } else {
        localStorage.setItem('token', data.data.token)
        navigate('/profile-setup')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {step === 'otp' ? (
          <>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">Verify Email</h1>
            <p className="text-gray-600 mb-6">We sent an OTP to {email}</p>

            <form onSubmit={handleVerifyOTP}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP (6 digits)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                />
              </div>

              {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

              {debugOtp && (
                <div className="mb-4 p-3 bg-yellow-100 text-yellow-900 rounded">
                  Debug OTP (local dev): <strong>{debugOtp}</strong>
                </div>
              )}

              <div className="mb-4 text-center text-sm text-gray-600">
                {timer > 0 ? `OTP expires in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : 'OTP expired'}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">Create Password</h1>
            <p className="text-gray-600 mb-6">Set a strong password for your account</p>

            <form onSubmit={handleCreatePassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
