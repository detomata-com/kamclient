// pages/api/pairing/start.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { customInitApp } from '../../../lib/firebase-admin-config';
import { getFirestore } from 'firebase-admin/firestore';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};



customInitApp();
const db = getFirestore();

export interface PairingStartRequest {
  playerId: string;
  name?: string;
  deviceInfo?: {
    publicKey: string;
    platform?: string;
    userAgent?: string;
    timestamp?: number;
  };
}

export interface PairingStartResponse {
  success: boolean;
  pairingCode?: string;
  expiresIn?: number;
  webPairUrl?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PairingStartResponse>
) {
  // if (req.method !== 'POST') {
  //   return res.status(405).json({ success: false, message: 'Method not allowed' });
  // }

 // const { publicKey, deviceInfo } = req.body as PairingStartRequest;
 const myRequest: PairingStartRequest  = req.body;
 console.log('Content-Type:', req.headers['content-type']);
 console.log('Raw body:', req.body);
 console.log("myRequest-------->", myRequest);
  console.log('=== Pairing Start Request ===');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body type:', typeof req.body);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('===========================');
  // // Validate public key format (Ethereum address)
  // if (!publicKey || !publicKey.match(/^0x[a-fA-F0-9]{40}$/)) {
  //   return res.status(400).json({ 
  //     success: false, 
  //     message: 'Invalid public key format' 
  //   });
  // }

  

  try {
    // Generate 4-digit code
    const pairingCode = await generateUniquePairingCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
    const playerId = myRequest.playerId || '';
    const name = myRequest.name || '';
    const deviceInfo = myRequest.deviceInfo || {};
    const publicKey = myRequest.deviceInfo?.publicKey || '';
  
    // Store pending pairing in Firestore
    await db.collection('devicePairings').doc(pairingCode).set({
      pairingCode,
      publicKey,
      playerId,
      name,
      deviceInfo: deviceInfo || {},
      createdAt: now,
      expiresAt,
      completed: false,
      completedAt: null,
      userId: null
    });

    return res.status(200).json({
      success: true,
      pairingCode,
      expiresIn: 300, // 5 minutes in seconds
      webPairUrl: `${process.env.NEXTAUTH_URL}/pair`
    });

  } catch (error) {
    console.error('Error starting pairing process:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
  async function generateUniquePairingCode(): Promise<string> {
    const maxAttempts = 5;
    for (let i = 0; i < maxAttempts; i++) {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      // Check if code already exists
      const existing = await db.collection('devicePairings').doc(code).get();
      if (!existing.exists) {
        return code; // Found unique code
      } 
      console.log(`Collision detected for code ${code}, retrying...`);
    }
    throw new Error('Failed to generate unique pairing code');
  }

}