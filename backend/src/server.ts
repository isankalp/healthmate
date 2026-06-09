import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { authRouter } from './routes/authRoutes'
import { healthRouter } from './routes/healthRoutes'
import { goalsRouter } from './routes/goalsRoutes'
import { chatRouter } from './routes/chatRoutes'
import { config } from './config'

const app = express()

// cookies
app.use(cookieParser())
const port = config.port || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api/auth', authRouter)
app.use('/api/health', healthRouter)
app.use('/api/goals', goalsRouter)
app.use('/api/chat', chatRouter)
app.use('/api/admin', (_req, res) => {
  res.json({ message: 'Admin endpoints not yet implemented' })
})

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  })
})

app.listen(port, () => {
  console.log(`HealthMate backend listening on port ${port}`)
})
