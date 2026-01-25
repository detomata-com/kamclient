

// This is old file!!



// pages/api/player/purchase-item.ts - Integration with Guy's server

//As I already have a purchase item endpoint - I need to incorporate the signing and verification here



import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { ethers, AbiCoder,keccak256, verifyMessage} from 'ethers'
import { arrayify } from "@ethersproject/bytes";

import { getFirestore } from 'firebase-admin/firestore'
import { customInitApp } from '@/lib/firebase-admin-config'


customInitApp()
const db = getFirestore()

export interface ItemPurchaseRequest {
  itemId: string
  price: number
  playerSignature: string
  playerAddress: string
}

export default async function itemPurchaseHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const { itemId, price, playerSignature, playerAddress } = req.body as ItemPurchaseRequest

  try {
    // 1. Verify the device is paired to this account
    var localplayer:any;
    localplayer = session;


    const playerRef = db.collection('players').doc(localplayer.email)
    const playerDoc = await playerRef.get()
    
    if (!playerDoc.exists) {
      return res.status(404).json({ error: 'Player not found' })
    }

    const playerData = playerDoc.data()
    const trustedDevices = playerData?.trustedDevices || []
    
    const deviceTrusted = trustedDevices.some((device: any) => 
      device.address.toLowerCase() === playerAddress.toLowerCase()
    )

    if (!deviceTrusted) {
      return res.status(403).json({ error: 'Device not paired to this account' })
    }

     // 2. signature verification

    const abiCoder = new AbiCoder();
    const transactionData = abiCoder.encode(
      ['string', 'uint256', 'address'],
      [itemId, price, playerAddress]
    )
    
    const transactionHash = keccak256(transactionData)
    
    const recoveredAddress = verifyMessage(
      arrayify(transactionHash),
      playerSignature
    )

    if (recoveredAddress.toLowerCase() !== playerAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' })
    }

    // 3. Forward to Guy's server for processing
    const guyServerResponse = await fetch(`${process.env.GUY_SERVER_URL}/purchase-item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GUY_SERVER_API_KEY}`
      },
      body: JSON.stringify({
        itemId,
        price,
        playerSignature,
        playerAddress,
        playerId: localplayer.id,
        playerEmail: localplayer.email
      })
    })

    const purchaseResult = await guyServerResponse.json()

    if (!guyServerResponse.ok) {
      return res.status(guyServerResponse.status).json(purchaseResult)
    }

    // 4. Update player's local data if needed
    // (credits, inventory, etc.)

    return res.status(200).json({
      success: true,
      transactionId: purchaseResult.transactionId,
      message: 'Purchase completed successfully'
    })

  } catch (error) {
    console.error('Error processing purchase:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}