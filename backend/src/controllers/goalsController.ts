import express from 'express'
import { supabase } from '../db/client'
import { AuthRequest } from '../middleware/authMiddleware'

export async function listGoals(req: express.Request, res: express.Response): Promise<void> {
  try {
    const authReq = req as AuthRequest
    const userId = authReq.user?.userId

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' })
      return
    }

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('List goals error:', error)
      res.status(500).json({ success: false, error: 'Failed to list goals' })
      return
    }

    res.json({ success: true, data })
  } catch (error) {
    console.error('Error listing goals:', error)
    res.status(500).json({ success: false, error: 'Failed to list goals' })
  }
}

export async function createGoal(req: express.Request, res: express.Response): Promise<void> {
  try {
    const authReq = req as AuthRequest
    const userId = authReq.user?.userId
    const { goalType, title, target, notes } = req.body

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' })
      return
    }

    if (!goalType || !title) {
      res.status(400).json({ success: false, error: 'goalType and title are required' })
      return
    }

    const { data, error } = await supabase
      .from('goals')
      .insert([
        {
          user_id: userId,
          goal_type: goalType,
          title,
          target,
          notes,
        },
      ])
      .select()
      .single()

    if (error || !data) {
      console.error('Create goal error:', error)
      res.status(500).json({ success: false, error: 'Failed to create goal' })
      return
    }

    res.json({ success: true, data })
  } catch (error) {
    console.error('Error creating goal:', error)
    res.status(500).json({ success: false, error: 'Failed to create goal' })
  }
}

export async function deleteGoal(req: express.Request, res: express.Response): Promise<void> {
  try {
    const authReq = req as AuthRequest
    const userId = authReq.user?.userId
    const { id } = req.params

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' })
      return
    }

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Delete goal error:', error)
      res.status(500).json({ success: false, error: 'Failed to delete goal' })
      return
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting goal:', error)
    res.status(500).json({ success: false, error: 'Failed to delete goal' })
  }
}
