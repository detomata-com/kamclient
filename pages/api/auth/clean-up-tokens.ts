// pages/api/auth/cleanup-tokens.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { customInitApp } from "@/lib/firebase-admin-config"
import { getFirestore } from 'firebase-admin/firestore'

customInitApp()
const db = getFirestore()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const now = Date.now()
    const expiredTokens = await db.collection('magicTokens')
      .where('expiresAt', '<', now)
      .get()
    
    const batch = db.batch()
    expiredTokens.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    
    await batch.commit()
    
    res.status(200).json({ deleted: expiredTokens.size })
  } catch (error) {
    console.error('Token cleanup error:', error)
    res.status(500).json({ error: 'Cleanup failed' })
  }
}