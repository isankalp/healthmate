import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function HealthLogPage() {
  const navigate = useNavigate()
  const [recordDate, setRecordDate] = useState('')
  const [systolicBp, setSystolicBp] = useState('')
  const [diastolicBp, setDiastolicBp] = useState('')
  const [pulseRate, setPulseRate] = useState('')
  const [weight, setWeight] = useState('')
  const [caloriesIntake, setCaloriesIntake] = useState('')
  const [weakness, setWeakness] = useState('')
  const [unitPreference, setUnitPreference] = useState<'metric' | 'imperial'>('metric')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recordDate,
          systolicBp: systolicBp ? Number(systolicBp) : null,
          diastolicBp: diastolicBp ? Number(diastolicBp) : null,
          pulseRate: pulseRate ? Number(pulseRate) : null,
          weight: weight ? Number(weight) : null,
          caloriesIntake: caloriesIntake ? Number(caloriesIntake) : null,
          weakness,
          unitPreference,
        }),
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to save health record')
      }
      setMessage('Health record saved successfully.')
      setRecordDate('')
      setSystolicBp('')
      setDiastolicBp('')
      setPulseRate('')
      setWeight('')
      setCaloriesIntake('')
      setWeakness('')
    } catch (err: any) {
      setMessage(err.message || 'Failed to save health record')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <button
          onClick={() => navigate('/home')}
          className="mb-6 text-blue-600 hover:underline"
        >
          ← Back to dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Log Health Metrics</h1>
        <p className="text-gray-600 mb-8">Add your latest readings to track progress.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Systolic BP</label>
              <input
                type="number"
                value={systolicBp}
                onChange={(e) => setSystolicBp(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Diastolic BP</label>
              <input
                type="number"
                value={diastolicBp}
                onChange={(e) => setDiastolicBp(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Pulse Rate</label>
              <input
                type="number"
                value={pulseRate}
                onChange={(e) => setPulseRate(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Weight</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Calories Intake</label>
              <input
                type="number"
                value={caloriesIntake}
                onChange={(e) => setCaloriesIntake(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit Preference</label>
              <select
                value={unitPreference}
                onChange={(e) => setUnitPreference(e.target.value as 'metric' | 'imperial')}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="metric">Metric</option>
                <option value="imperial">Imperial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes / Weakness</label>
            <textarea
              value={weakness}
              onChange={(e) => setWeakness(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={4}
              placeholder="Optional notes about how you feel today"
            />
          </div>

          {message && <p className="text-sm text-blue-700">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Health Record'}
          </button>
        </form>
      </div>
    </div>
  )
}
