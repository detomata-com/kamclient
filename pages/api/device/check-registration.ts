// pages/api/device/check-registration.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { customInitApp } from '@/lib/firebase-admin-config'
import { getFirestore } from 'firebase-admin/firestore'

customInitApp()
const db = getFirestore()

export interface CheckRegistrationResponse {
  verified: boolean
  message: string
  accountId?: string
  email?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckRegistrationResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      verified: false,
      message: 'Method not allowed' 
    })
  }

  const { token, email } = req.query

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ 
      verified: false,
      message: 'Token required' 
    })
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ 
      verified: false,
      message: 'Email required' 
    })
  }

  try {
    // FIRST: Check if registration already completed
    const emailLower = email.toLowerCase()
    const playersSnapshot = await db.collection('players')
      .where('email', '==', emailLower)
      .limit(1)
      .get()

      if (!playersSnapshot.empty) {
        const playerDoc = playersSnapshot.docs[0]
        const playerData = playerDoc.data()
        
        // Registration is complete!
        // Clean up token if it still exists
        await db.collection('registrationTokens').doc(token).delete().catch(() => {})

        return res.status(200).json({
          verified: true,
          message: 'Registration complete!',
          accountId: playerData.accountId,
          email: playerData.email
        })
      }


    // SECOND: Check token status (registration still pending)
    const tokenRef = db.collection('registrationTokens').doc(token)
    const tokenDoc = await tokenRef.get()

    if (!tokenDoc.exists) {
      return res.status(200).json({ 
        verified: false,
        message: 'No registration found for this email' 
      })
    }

    const tokenData = tokenDoc.data()

    if (!tokenData) {
      return res.status(200).json({ 
        verified: false,
        message: 'Invalid token data' 
      })
    }

    // Verify email matches
    if (tokenData.email.toLowerCase() !== emailLower) {
      return res.status(400).json({
        verified: false,
        message: 'Email does not match token'
      })
    }

    // Check if expired
    if (tokenData.expiresAt < Date.now()) {
      await tokenRef.delete()
      return res.status(200).json({ 
        verified: false,
        message: 'Registration token expired' 
      })
    }

    // Still waiting for email verification
    return res.status(200).json({
      verified: false,
      message: 'Waiting for email verification'
    })

  } catch (error) {
    console.error('Error checking registration status:', error)
    return res.status(500).json({ 
      verified: false,
      message: 'Internal server error' 
    })
  }
}