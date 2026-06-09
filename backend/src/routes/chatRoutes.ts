import express from 'express'
import { sendChatMessage } from '../controllers/chatController'
import { requireAuth } from '../middleware/authMiddleware'

export const chatRouter = express.Router()

chatRouter.use(requireAuth)
chatRouter.post('/', sendChatMessage)
