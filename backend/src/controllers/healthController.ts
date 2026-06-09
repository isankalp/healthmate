import express from 'express'
import { supabase } from '../db/client'
import { AuthRequest } from '../middleware/authMiddleware'

export async function listHealthRecords(req: express.Request, res: express.Response): Promise<void> {
  try {
    const authReq = req as AuthRequest
    const userId = authReq.user?.userId

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' })
      return
    }

    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('user_id', userId)
      .order('record_date', { ascending: false })

    if (error) {
      console.error('List health records error:', error)
      res.status(500).json({ success: false, error: 'Failed to list health records' })
      return
    }

    res.json({ success: true, data })
  } catch (error) {
    console.error('Error listing health records:', error)
    res.status(500).json({ success: false, error: 'Failed to list health records' })
  }
}

export async function createHealthRecord(req: express.Request, res: express.Response): Promise<void> {
  try {
    const authReq = req as AuthRequest
    const userId = authReq.user?.userId
    const { recordDate, systolicBp, diastolicBp, pulseRate, weight, caloriesIntake, weakness, unitPreference } = req.body

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' })
      return
    }

    if (!recordDate || !unitPreference) {
      res.status(400).json({ success: false, error: 'Record date and unit preference are required' })
      return
    }

    const { data, error } = await supabase
      .from('health_records')
      .insert([
        {
          user_id: userId,
          record_date: recordDate,
          systolic_bp: systolicBp,
          diastolic_bp: diastolicBp,
          pulse_rate: pulseRate,
          weight,
          calories_intake: caloriesIntake,
          weakness,
          unit_preference: unitPreference,
        },
      ])
      .select()
      .single()

    if (error || !data) {
      console.error('Create health record error:', error)
      res.status(500).json({ success: false, error: 'Failed to create health record' })
      return
    }

    res.json({ success: true, data })
  } catch (error) {
    console.error('Error creating health record:', error)
    res.status(500).json({ success: false, error: 'Failed to create health record' })
  }
}
