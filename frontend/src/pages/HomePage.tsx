import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/apiClient'

interface ProfileData {
  full_name?: string
  email: string
}

export function HomePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { replace: true })
      return
    }

    apiFetch('/auth/profile')
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem('token')
          navigate('/login', { replace: true })
          return
        }
        const data = await res.json()
        if (data.success) setProfile(data.data)
      })
      .catch(() => {
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
      })
      .finally(() => setLoading(false))
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HealthMate</h1>
            <p className="text-gray-600">Your Personal Health Companion</p>
            {loading ? (
              <p className="text-sm text-gray-500 mt-2">Loading profile...</p>
            ) : (
              <p className="text-sm text-gray-700 mt-2">
                Welcome, {profile?.full_name || profile?.email || 'HealthMate user'}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/change-password')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-2">📊 Log Health Metrics</h3>
            <p className="text-gray-600 mb-4">Track BP, weight, calories, and more.</p>
            <button
              onClick={() => navigate('/health-log')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Log Today
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-2">🎯 Set Goals</h3>
            <p className="text-gray-600 mb-4">Define yearly, monthly, and daily targets.</p>
            <button
              onClick={() => navigate('/goals')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Manage Goals
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-2">🤖 AI Chat</h3>
            <p className="text-gray-600 mb-4">Get personalized health insights.</p>
            <button
              onClick={() => navigate('/chat')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Start Chat
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
