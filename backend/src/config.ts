// Config - Load environment variables first, before anything else
import dotenv from 'dotenv'

dotenv.config()

export const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  resendApiKey: process.env.RESEND_API_KEY,
  adminEmail: process.env.ADMIN_EMAIL,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || '3000',
  chatHistoryDays: process.env.CHAT_HISTORY_DAYS ? Number(process.env.CHAT_HISTORY_DAYS) : 90,
  refreshTokenDays: process.env.REFRESH_TOKEN_DAYS ? Number(process.env.REFRESH_TOKEN_DAYS) : 30,
  refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'refresh_token',
}
