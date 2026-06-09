import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface GoalRecord {
  id: string
  title: string
  goal_type: string
  target?: string
  notes?: string
}

export function GoalsPage() {
  const navigate = useNavigate()
  const [goals, setGoals] = useState<GoalRecord[]>([])
  const [title, setTitle] = useState('')
  const [goalType, setGoalType] = useState<'yearly' | 'monthly' | 'daily'>('daily')
  const [target, setTarget] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    fetch('/api/goals', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGoals(data.data)
        }
      })
  }, [navigate])

  const handleCreateGoal = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ goalType, title, target, notes }),
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to create goal')
      }
      setGoals([data.data, ...goals])
      setTitle('')
      setTarget('')
      setNotes('')
      setMessage('Goal created.')
    } catch (err: any) {
      setMessage(err.message || 'Failed to create goal')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGoal = async (id: string) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/goals/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()
    if (data.success) {
      setGoals(goals.filter((goal) => goal.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-green-50 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <button onClick={() => navigate('/home')} className="mb-6 text-blue-600 hover:underline">
          ← Back to dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Manage Goals</h1>
        <p className="text-gray-600 mb-8">Create your yearly, monthly, or daily health goals.</p>

        <form onSubmit={handleCreateGoal} className="grid gap-4 mb-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Goal type</label>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as 'yearly' | 'monthly' | 'daily')}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Target</label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          {message && <p className="text-sm text-green-700">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Saving goal...' : 'Add Goal'}
          </button>
        </form>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your goals</h2>
          <div className="space-y-4">
            {goals.length === 0 ? (
              <p className="text-gray-600">No goals yet. Add one to get started.</p>
            ) : (
              goals.map((goal) => (
                <div key={goal.id} className="rounded-xl border border-green-100 bg-green-50 p-4">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-green-700">{goal.goal_type}</p>
                      <h3 className="text-xl font-bold text-gray-900">{goal.title}</h3>
                      {goal.target && <p className="text-gray-700">Target: {goal.target}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                  {goal.notes && <p className="mt-2 text-gray-600">{goal.notes}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
