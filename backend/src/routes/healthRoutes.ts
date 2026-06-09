import express from 'express'
import { createHealthRecord, listHealthRecords } from '../controllers/healthController'
import { requireAuth } from '../middleware/authMiddleware'

export const healthRouter = express.Router()

healthRouter.use(requireAuth)
healthRouter.get('/', listHealthRecords)
healthRouter.post('/', createHealthRecord)
