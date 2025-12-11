// pages/api/pairing/complete.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { customInitApp } from '../../../lib/firebase-admin-config';
import { getFirestore } from 'firebase-admin/firestore';

customInitApp();
const db = getFirestore();

export interface PairingCompleteRequest {
  pairingCode: string;
  deviceName?: string;
}

export interface PairingCompleteResponse {
  success: boolean;
  message: string;
  deviceInfo?: {
    address: string;
    deviceName: string;
    pairedAt: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PairingCompleteResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Verify user is authenticated
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const { pairingCode, deviceName } = req.body as PairingCompleteRequest;

  if (!pairingCode || pairingCode.length !== 4) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid pairing code format' 
    });
  }

  try {
    // Get pairing document
    const pairingRef = db.collection('devicePairings').doc(pairingCode);
    const pairingDoc = await pairingRef.get();

    if (!pairingDoc.exists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid pairing code' 
      });
    }

    const pairingData = pairingDoc.data();
    if (!pairingData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid pairing data' 
      });
    }

     const publicKey = pairingData.deviceInfo?.publicKey || pairingData.publicKey;
 

    // Check if expired
    if (new Date() > pairingData.expiresAt.toDate()) {
      await pairingRef.delete(); // Clean up expired
      return res.status(400).json({ 
        success: false, 
        message: 'Pairing code expired' 
      });
    }

    // Check if already completed
    if (pairingData.completed) {
      return res.status(400).json({ 
        success: false, 
        message: 'Pairing code already used' 
      });
    }

    // Mark as completed
    await pairingRef.update({
      completed: true,
      completedAt: new Date(),
      userId: (session as any).email, // Using email as user ID like your existing code
      deviceName: deviceName || `Game Client ${Date.now()}`
    });

    // Now call your existing device pairing logic
    const localplayer: any = session;
    const playerRef = db.collection('players').doc(localplayer.email);
    const playerDoc = await playerRef.get();

    if (!playerDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Player not found' 
      });
    }

    const playerData = playerDoc.data();
    const currentDevices = playerData?.trustedDevices || [];

    // Check if device is already paired
    const existingDevice = currentDevices.find((device: any) => 
      device.address.toLowerCase() === (pairingData.deviceInfo?.publicKey || pairingData.publicKey).toLowerCase()
    );

    if (existingDevice) {
      // Update last seen
      existingDevice.lastSeen = Date.now();
      await playerRef.update({ trustedDevices: currentDevices });
      
      // Clean up pairing document
      await pairingRef.delete();
      
      return res.status(200).json({
        success: true,
        message: 'Device was already paired - updated last seen',
        deviceInfo: {
          address: existingDevice.address,
          deviceName: existingDevice.deviceName,
          pairedAt: existingDevice.pairedAt
        }
      });
    }

    // Add new device using your existing format
    const newDevice = {
      address: pairingData.deviceInfo?.publicKey || pairingData.publicKey,
      deviceName: deviceName || `Game Client ${new Date().toLocaleDateString()}`,
      pairedAt: Date.now(),
      lastSeen: Date.now()
    };

    const updatedDevices = [...currentDevices, newDevice];
    await playerRef.update({ trustedDevices: updatedDevices });

    
    return res.status(200).json({
      success: true,
      message: 'Device paired successfully',
      deviceInfo: {
        address: newDevice.address,
        deviceName: newDevice.deviceName,
        pairedAt: newDevice.pairedAt
      }
    });

  } catch (error) {
    console.error('Error completing pairing:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}