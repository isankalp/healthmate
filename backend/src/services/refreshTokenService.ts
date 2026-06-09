import { supabase } from '../db/client'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const DEFAULT_EXPIRY_DAYS = 30

export async function createRefreshToken(userId: string, expiresInDays?: number) {
  const raw = crypto.randomBytes(48).toString('hex')
  const hash = await bcrypt.hash(raw, 10)
  const expiresAt = new Date(Date.now() + ((expiresInDays || DEFAULT_EXPIRY_DAYS) * 24 * 60 * 60 * 1000)).toISOString()

  const { error } = await supabase
    .from('refresh_tokens')
    .insert([
      {
        user_id: userId,
        token_hash: hash,
        expires_at: expiresAt,
      },
    ])

  if (error) {
    console.warn('Refresh token creation failed, continuing without refresh token storage:', error)
    return null
  }

  return { raw, expiresAt }
}

export async function verifyAndRotateRefreshToken(rawToken: string) {
  // Find candidate tokens that are not revoked and not expired
  const { data: rows, error } = await supabase
    .from('refresh_tokens')
    .select('*')
    .eq('revoked', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error querying refresh tokens:', error)
    throw new Error('Refresh token verify failed')
  }

  if (!rows || rows.length === 0) return null

  for (const row of rows) {
    if (row.expires_at && new Date(row.expires_at) < new Date()) continue
    const match = await bcrypt.compare(rawToken, row.token_hash)
    if (match) {
      // rotate: revoke old token and create a new one
      await supabase.from('refresh_tokens').update({ revoked: true, last_used_at: new Date().toISOString() }).eq('id', row.id)
      const newToken = await createRefreshToken(row.user_id)
      return { ...newToken, userId: row.user_id }
    }
  }

  return null
}

export async function revokeRefreshTokensForUser(userId: string) {
  await supabase.from('refresh_tokens').update({ revoked: true }).eq('user_id', userId)
}
