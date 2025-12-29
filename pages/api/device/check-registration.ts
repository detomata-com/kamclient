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

  const { token } = req.query

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ 
      verified: false,
      message: 'Token required' 
    })
  }

  try {
    // Look up the registration token
    const tokenRef = db.collection('registrationTokens').doc(token)
    const tokenDoc = await tokenRef.get()

    if (!tokenDoc.exists) {
      return res.status(200).json({ 
        verified: false,
        message: 'Token expired or invalid' 
      })
    }

    const tokenData = tokenDoc.data()

    if (!tokenData) {
      return res.status(200).json({ 
        verified: false,
        message: 'Invalid token data' 
      })
    }

    // Check if expired
    if (tokenData.expiresAt < Date.now()) {
      await tokenRef.delete()
      return res.status(200).json({ 
        verified: false,
        message: 'Token expired' 
      })
    }

    // Check if used (email link was clicked)
    if (tokenData.used) {
      // Email verified! Look up player by email to get accountId
      const email = tokenData.email.toLowerCase()
      const playerDoc = await db.collection('players').doc(email).get()

      if (!playerDoc.exists) {
        return res.status(200).json({ 
          verified: false,
          message: 'Account not found - verification may still be processing' 
        })
      }

      const playerData = playerDoc.data()!

      // Clean up the used token
      await tokenRef.delete()

      return res.status(200).json({
        verified: true,
        message: 'Registration complete!',
        accountId: playerData.accountId,
        email: playerData.email
      })
    } else {
      // Still waiting for email verification
      return res.status(200).json({
        verified: false,
        message: 'Waiting for email verification'
      })
    }

  } catch (error) {
    console.error('Error checking registration status:', error)
    return res.status(500).json({ 
      verified: false,
      message: 'Internal server error' 
    })
  }
}