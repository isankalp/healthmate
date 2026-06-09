import express from 'express'
import { supabase } from '../db/client'
import { AuthRequest } from '../middleware/authMiddleware'

export async function getProfile(req: express.Request, res: express.Response): Promise<void> {
  try {
    const authReq = req as AuthRequest
    const userId = authReq.user?.userId

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' })
      return
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id,email,full_name,dob,weight,height,unit_preference,profile_complete')
      .eq('id', userId)
      .single()

    if (error || !user) {
      res.status(500).json({ success: false, error: 'Failed to retrieve profile' })
      return
    }

    res.json({ success: true, data: user })
  } catch (error) {
    console.error('Error retrieving profile:', error)
    res.status(500).json({ success: false, error: 'Failed to retrieve profile' })
  }
}

export async function updateProfile(req: express.Request, res: express.Response): Promise<void> {
  try {
    const authReq = req as AuthRequest
    const userId = authReq.user?.userId
    const { fullName, dob, weight, height, unitPreference } = req.body

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' })
      return
    }

    if (!fullName || !dob || !weight || !height || !unitPreference) {
      res.status(400).json({ success: false, error: 'All profile fields are required' })
      return
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        dob,
        weight,
        height,
        unit_preference: unitPreference,
        profile_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id,email,full_name,dob,weight,height,unit_preference,profile_complete')
      .single()

    if (error || !updatedUser) {
      console.error('Profile update error:', error)
      res.status(500).json({ success: false, error: 'Failed to update profile' })
      return
    }

    res.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ success: false, error: 'Failed to update profile' })
  }
}
