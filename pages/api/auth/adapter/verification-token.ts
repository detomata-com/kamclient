// pages/api/auth/adapter/verification-token.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { customInitApp } from "@/lib/firebase-admin-config"
import { getFirestore } from 'firebase-admin/firestore'

customInitApp()
const db = getFirestore()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Create verification token
    try {
      const { identifier, token, expires } = req.body
      
      await db.collection('verificationTokens').doc(token).set({
        identifier, // email address
        token,
        expires: new Date(expires).getTime(),
        createdAt: Date.now()
      })
      
      res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error creating verification token:', error)
      res.status(500).json({ error: 'Failed to create token' })
    }
  } else if (req.method === 'DELETE') {
    // Use verification token (delete after use)
    try {
      const { token } = req.query
      
      const docRef = db.collection('verificationTokens').doc(token as string)
      const doc = await docRef.get()
      
      if (!doc.exists) {
        res.status(404).json({ error: 'Token not found' })
        return
      }
      
      const data = doc.data()
      
      // Check if expired
      if (data && data.expires < Date.now()) {
        await docRef.delete()
        res.status(400).json({ error: 'Token expired' })
        return
      }
      
      // Delete token after successful use
      await docRef.delete()
      res.status(200).json(data)
    } catch (error) {
      console.error('Error using verification token:', error)
      res.status(500).json({ error: 'Failed to use token' })
    }
  }
}