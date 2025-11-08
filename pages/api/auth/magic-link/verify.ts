// pages/api/auth/magic-link/verify.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { customInitApp } from "@/lib/firebase-admin-config"
import { getFirestore } from 'firebase-admin/firestore'

customInitApp()
const db = getFirestore()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token } = req.body

  if (!token) {
    return res.status(400).json({ error: 'Token required' })
  }

  try {
    const docRef = db.collection('magicTokens').doc(token)
    const doc = await docRef.get()

    if (!doc.exists) {
      return res.status(400).json({ error: 'Invalid or expired token' })
    }

    const data = doc.data()

    // Check if already used
    if (data?.used) {
      return res.status(400).json({ error: 'Token already used' })
    }

    // Check if expired
    if (data && data.expiresAt < Date.now()) {
      await docRef.delete()
      return res.status(400).json({ error: 'Token expired' })
    }

    // Mark as used
    await docRef.update({ used: true })

    const email = data!.email

    // Check if player exists
    const playerResponse = await fetch(
      `${process.env.NEXTAUTH_URL}/api/player?email=${encodeURIComponent(email)}`
    )

    let playerData
    if (playerResponse.ok) {
      playerData = await playerResponse.json()
      
      // Update emailValidated
      await fetch(`${process.env.NEXTAUTH_URL}/api/player`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...playerData,
          emailValidated: true
        })
      })
    } else {
      // Create new player
      const newPlayer = {
        email: email,
        playername: email.split('@')[0] || 'Player',
        emailValidated: true,
        credits: 0,
        stripeid: null,
        trustedDevices: []
      }
      
      const createResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlayer)
      })
      
      if (createResponse.ok) {
        playerData = await createResponse.json()
      } else {
        playerData = newPlayer
      }
    }

    // Return user data for session creation
    res.status(200).json({
      success: true,
      user: {
        email: email,
        id: email,
        playername: playerData.playername,
        credits: playerData.credits || 0,
        stripeid: playerData.stripeid,
        emailValidated: true
      }
    })
  } catch (error) {
    console.error('Error verifying token:', error)
    res.status(500).json({ error: 'Failed to verify token' })
  }
}