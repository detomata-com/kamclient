// pages/api/device/verify-registration.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { customInitApp } from '@/lib/firebase-admin-config'
import { getFirestore } from 'firebase-admin/firestore'
import { generateUniqueAccountId } from '@/lib/generate-account-id';

customInitApp()
const db = getFirestore()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { token } = req.body

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token required' })
  }

  try {
    const tokenRef = db.collection('registrationTokens').doc(token)
    const tokenDoc = await tokenRef.get()

    if (!tokenDoc.exists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired registration link' 
      })
    }

    const tokenData = tokenDoc.data()

    // Check if already used
    if (tokenData?.used) {
      return res.status(400).json({ 
        success: false, 
        message: 'Registration link already used' 
      })
    }

    // Check if expired
    if (tokenData && tokenData.expiresAt < Date.now()) {
      //await tokenRef.delete()
      return res.status(400).json({ 
        success: false, 
        message: 'Registration link expired' 
      })
    }

    if (!tokenData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid token data' 
      })
    }

    // Mark as used
    await tokenRef.update({ used: true })

    const email = tokenData.email
    const publicKey = tokenData.publicKey
    const deviceInfo = tokenData.deviceInfo

    // Check if player exists (using email as document ID - simple approach)
    const playerRef = db.collection('players').doc(email)
    const playerDoc = await playerRef.get()

    if (playerDoc.exists) {
      // Player exists - add device to trustedDevices
      const playerData = playerDoc.data()
      const currentDevices = playerData?.trustedDevices || []
      const accountId = playerData?.accountId  // Get existing accountId

      // Check if device already paired
      const existingDevice = currentDevices.find((device: any) => 
        device.address.toLowerCase() === publicKey.toLowerCase()
      )

      if (existingDevice) {
        // Update last seen
        existingDevice.lastSeen = Date.now()
        await playerRef.update({ trustedDevices: currentDevices })
       // await tokenRef.delete()
        
        return res.status(200).json({
          success: true,
          message: 'Device was already registered - updated last seen',
          accountId,  // Return accountId to game client
          isNewAccount: false
        })
      }

      // Add new device
      const newDevice = {
        address: publicKey,
        deviceName: deviceInfo.deviceName || 
                   `${deviceInfo.platform || 'Game Client'} - ${new Date().toLocaleDateString()}`,
        pairedAt: Date.now(),
        lastSeen: Date.now()
      }

      currentDevices.push(newDevice)
      await playerRef.update({ trustedDevices: currentDevices })
     // await tokenRef.delete()

      return res.status(200).json({
        success: true,
        message: 'Device registered successfully',
        accountId,  // Return accountId to game client
        isNewAccount: false
      })

    } else {
      // New player - create account with device
      // Generate unique accountId for Guy to use
      const accountId = await generateUniqueAccountId(db)
      
      const newPlayer = {
        accountId,  // Add accountId field for game client
        email: email,
        playername: email.split('@')[0] || 'Player',
        emailValidated: true,
        credits: 0,
        stripeid: null,
        trustedDevices: [{
          address: publicKey,
          deviceName: deviceInfo.deviceName || 
                     `${deviceInfo.platform || 'Game Client'} - ${new Date().toLocaleDateString()}`,
          pairedAt: Date.now(),
          lastSeen: Date.now()
        }],
        ts_added: Date.now(),
        ip: ''
      }

      // Still use email as document ID (simple approach)
      await playerRef.set(newPlayer)
     //await tokenRef.delete()

      return res.status(200).json({
        success: true,
        message: 'Account created and device registered!',
        accountId,  // Return accountId to game client
        isNewAccount: true
      })
    }

  } catch (error) {
    console.error('Error verifying registration:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to verify registration' 
    })
  }
}