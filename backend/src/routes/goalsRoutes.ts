import express from 'express'
import { createGoal, deleteGoal, listGoals } from '../controllers/goalsController'
import { requireAuth } from '../middleware/authMiddleware'

export const goalsRouter = express.Router()

goalsRouter.use(requireAuth)
goalsRouter.get('/', listGoals)
goalsRouter.post('/', createGoal)
goalsRouter.delete('/:id', deleteGoal)
