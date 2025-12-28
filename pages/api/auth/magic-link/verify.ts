// pages/api/auth/magic-link/verify.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { customInitApp } from "@/lib/firebase-admin-config"
import { getFirestore } from 'firebase-admin/firestore'
import { generateUniqueAccountId } from '@/lib/generate-account-id'


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

    //const email = data!.email
    const email = data!.email.toLowerCase();
// Simple lookup using email as document ID
const playerDoc = await db.collection('players').doc(email).get();
  if (playerDoc.exists) {
  const playerData = playerDoc.data()!;
  return res.status(200).json({
    success: true,
    user: {
      accountId: playerData.accountId,
      email: playerData.email,
      playername: playerData.playername,
      credits: playerData.credits || 0,
      stripeid: playerData.stripeid,
      emailValidated: true
    }
  });
} else {
  // Create new player on first login
  const accountId = await generateUniqueAccountId(db);
  const playerRef = db.collection('players').doc(email);
  
  await playerRef.set({
    accountId,
    email,
    playername: email.split('@')[0],
    emailValidated: true,
    credits: 0,
    stripeid: '',
    trustedDevices: []  // Add this - needed for device registration later
  });
  
  // Return the new player data
  return res.status(200).json({
    success: true,
    user: {
      accountId,
      email,
      playername: email.split('@')[0],
      credits: 0,
      stripeid: '',
      emailValidated: true
    }
  });
}
  } catch (error) {
    console.error('Error verifying magic link token:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}