import express from 'express'
import { config } from '../config'
import { AuthRequest } from '../middleware/authMiddleware'
import OpenAI from 'openai'
import { supabase } from '../db/client'

function formatProfileForPrompt(profile: any) {
  if (!profile) return 'No profile available.'
  const age = profile.dob ? Math.floor((Date.now() - new Date(profile.dob).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 'unknown'
  return `Profile:\n- Email: ${profile.email}\n- Name: ${profile.full_name || 'N/A'}\n- Age: ${age}\n- Weight: ${profile.weight || 'N/A'}\n- Height: ${profile.height || 'N/A'}\n- Unit preference: ${profile.unit_preference || 'metric'}\n- Profile complete: ${profile.profile_complete}`
}

function formatRecordsForPrompt(records: any[]) {
  if (!records || records.length === 0) return 'No health records available.'
  return records
    .map((r) => `- ${r.record_date}: systolic=${r.systolic_bp || 'N/A'}, diastolic=${r.diastolic_bp || 'N/A'}, pulse=${r.pulse_rate || 'N/A'}, weight=${r.weight || 'N/A'}, calories=${r.calories_intake || 'N/A'}`)
    .join('\n')
}

export async function sendChatMessage(req: express.Request, res: express.Response): Promise<void> {
  try {
    const authReq = req as AuthRequest
    const userId = authReq.user?.userId
    const { message } = req.body

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' })
      return
    }

    if (!message) {
      res.status(400).json({ success: false, error: 'Message is required' })
      return
    }

    // Fetch user profile
    const { data: profile, error: profileErr } = await supabase.from('users').select('*').eq('id', userId).single()
    if (profileErr) console.warn('Profile fetch error in chat:', profileErr)

    // Fetch today's records and recent history (last 30 days)
    const today = new Date().toISOString().slice(0, 10)
    const { data: todayRecords } = await supabase
      .from('health_records')
      .select('*')
      .eq('user_id', userId)
      .eq('record_date', today)

    const historyDays = (config.chatHistoryDays && Number(config.chatHistoryDays)) || 30
    const thirtyDaysAgo = new Date(Date.now() - historyDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const { data: pastRecords } = await supabase
      .from('health_records')
      .select('*')
      .eq('user_id', userId)
      .gte('record_date', thirtyDaysAgo)
      .lte('record_date', today)
      .order('record_date', { ascending: false })

    // Assemble system prompt with context
    const systemPromptLines = [
      'You are HealthMate, a careful and conservative medical assistant. Act like a personal doctor but always include uncertainty and encourage clinical verification. Do not provide definitive diagnoses; provide guidance, suggestions, and next steps. Clearly separate facts from suggestions.',
      'Use the provided patient profile and health records to contextualize your answers. Reference dates when appropriate.',
      '\nPatient context follows:\n',
      formatProfileForPrompt(profile),
      '\nToday records:\n',
      formatRecordsForPrompt(todayRecords || []),
      '\nRecent (30 days) records:\n',
      formatRecordsForPrompt(pastRecords || []),
    ]

    const messages = [
      { role: 'system', content: systemPromptLines.join('\n') },
      { role: 'user', content: message },
    ]

    if (config.openaiApiKey) {
      const client = new OpenAI({ apiKey: config.openaiApiKey })
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages as any,
        max_tokens: 400,
      })

      const reply = response.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.'
      res.json({ success: true, data: { reply } })
      return
    }

    // Fallback: simple echo with context
    const fallbackReply = `Context aware echo:\n${messages.map((m) => `${m.role}: ${m.content}`).join('\n\n')}`
    res.json({ success: true, data: { reply: fallbackReply } })
  } catch (error) {
    console.error('Error sending chat message:', error)
    res.status(500).json({ success: false, error: 'Failed to send chat message' })
  }
}
