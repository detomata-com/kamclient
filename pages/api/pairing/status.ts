// pages/api/pairing/status.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { customInitApp } from '../../../lib/firebase-admin-config';
import { getFirestore } from 'firebase-admin/firestore';

customInitApp();
const db = getFirestore();

export interface PairingStatusResponse {
  success: boolean;
  complete: boolean;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PairingStatusResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      complete: false, 
      message: 'Method not allowed' 
    });
  }

  const { pairingCode } = req.query;

  if (!pairingCode || typeof pairingCode !== 'string' || pairingCode.length !== 4) {
    return res.status(400).json({ 
      success: false, 
      complete: false, 
      error: 'Invalid pairing code format' 
    });
  }

  try {
    const pairingRef = db.collection('devicePairings').doc(pairingCode);
    const pairingDoc = await pairingRef.get();

    if (!pairingDoc.exists) {
      return res.status(200).json({ 
        success: true, 
        complete: false, 
        error: 'Invalid or expired code' 
      });
    }

    const pairingData = pairingDoc.data();
    if (!pairingData) {
      return res.status(200).json({ 
        success: true, 
        complete: false, 
        error: 'Invalid pairing data' 
      });
    }

    // Check expiration
    if (new Date() > pairingData.expiresAt.toDate()) {
      // Clean up expired document
      await pairingRef.delete();
      return res.status(200).json({ 
        success: true, 
        complete: false, 
        error: 'Pairing code expired' 
      });
    }

    // If pairing is complete, delete the document after returning status
    if (pairingData.completed) {
      // Delete in background (don't await)
      pairingRef.delete().catch(err => 
        console.error('Error cleaning up completed pairing:', err)
      );
      
      return res.status(200).json({ 
        success: true,
        complete: true,
        message: 'Device successfully paired!' 
      });
    }

    // Still waiting for user to complete pairing
    return res.status(200).json({ 
      success: true,
      complete: false
    });

  } catch (error) {
    console.error('Error checking pairing status:', error);
    return res.status(500).json({ 
      success: false, 
      complete: false, 
      error: 'Internal server error' 
    });
  }
}