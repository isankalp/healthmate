import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/apiClient'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function ChatPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: 'user' as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      const response = await apiFetch('/chat', {
        method: 'POST',
        body: JSON.stringify({ message: input }),
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Chat failed')
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.data.reply }])
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: err.message || 'Chat failed' }])
    } finally {
      setLoading(false)
      setInput('')
    }
  }

  return (
    <div className="min-h-screen bg-indigo-50 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <button onClick={() => navigate('/home')} className="mb-6 text-blue-600 hover:underline">
          ← Back to dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">AI Health Chat</h1>
        <p className="text-gray-600 mb-8">Ask HealthMate for insights, tips, and daily guidance.</p>

        <div className="space-y-4 mb-8">
          {messages.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-6 text-gray-600">
              Start the conversation by asking a question.
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`rounded-3xl p-5 ${message.role === 'user' ? 'bg-blue-50 text-blue-900 self-end' : 'bg-gray-100 text-gray-900'}`}
              >
                <p className="text-sm uppercase tracking-wide text-gray-500">{message.role}</p>
                <p className="mt-2 whitespace-pre-line">{message.content}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            className="w-full rounded-3xl border border-gray-300 p-4 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Ask about your health metrics, goals, or daily habits..."
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-3xl bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Thinking...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}
