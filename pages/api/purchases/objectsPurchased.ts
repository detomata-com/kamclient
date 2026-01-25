// pages/api/purchases/objectsPurchased.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { customInitApp } from "@/lib/firebase-admin-config"
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

customInitApp()
const db = getFirestore()

// Create a signed purchase and update player balance
export async function CapturePurchase(email: string, purchase: any, newBalance: number) {
  try {
    const playerRef = db.collection('players').doc(email)
    
    // Update player document atomically
    await playerRef.update({
      credits: newBalance,
      pendingPurchases: FieldValue.arrayUnion(purchase)
    })
    
    console.log('✅ Purchase captured for', email)
    return { success: true }
    
  } catch (e) {
    console.error("Purchase capture error", e)
    throw e
  }
}

// Get player's pending purchases WITH expanded item pack details
export async function GetPendingPurchases(email: string) {
  try {
    const playerRef = db.collection('players').doc(email)
    const playerDoc = await playerRef.get()
    
    if (!playerDoc.exists) {
      return []
    }
    
    const playerData = playerDoc.data()
    const pendingPurchases = playerData?.pendingPurchases || []
    
    // Filter for unclaimed purchases only
    const unclaimedPurchases = pendingPurchases.filter((p: any) => !p.claimed)
    
    // Expand each purchase with item pack details from item_content
    const expandedPurchases = await Promise.all(
      unclaimedPurchases.map(async (purchase: any) => {
        try {
          // Look up the item pack in item_content collection
          // Using itemId as the document ID (e.g., "Bomb Pack")
          const itemPackRef = db.collection('item_content').doc(purchase.itemId)
          const itemPackDoc = await itemPackRef.get()
          
          if (itemPackDoc.exists) {
            const packData = itemPackDoc.data()
            return {
              ...purchase,
              // Add the items array from the pack
              items: packData?.items || [],
              packDescription: packData?.desc || '',
              packImage: packData?.image || '',
              packName: packData?.name || purchase.itemId
            }
          } else {
            // Pack not found in item_content, return purchase as-is with warning
            console.warn(`⚠️ Item pack not found in item_content: ${purchase.itemId}`)
            return {
              ...purchase,
              items: [],
              packDescription: 'Pack details not found',
              packImage: '',
              packName: purchase.itemId
            }
          }
        } catch (error) {
          console.error(`Error expanding purchase ${purchase.purchaseId}:`, error)
          return purchase
        }
      })
    )
    
    console.log(`📦 Returning ${expandedPurchases.length} unclaimed purchases for ${email}`)
    return expandedPurchases
    
  } catch (e) {
    console.error("Error getting purchases", e)
    throw e
  }
}

// Mark purchases as claimed
export async function ClaimPurchases(email: string, purchaseIds: string[], deviceId: string) {
  try {
    const playerRef = db.collection('players').doc(email)
    const playerDoc = await playerRef.get()
    
    if (!playerDoc.exists) {
      throw new Error('Player not found')
    }
    
    const playerData = playerDoc.data()
    const pendingPurchases = playerData?.pendingPurchases || []
    
    // Update claimed purchases
    const updatedPurchases = pendingPurchases.map((p: any) => {
      if (purchaseIds.includes(p.purchaseId) && !p.claimed) {
        return {
          ...p,
          claimed: true,
          claimedByDevice: deviceId,
          claimedAt: Date.now()
        }
      }
      return p
    })
    
    await playerRef.update({
      pendingPurchases: updatedPurchases
    })
    
    console.log(`✅ Claimed ${purchaseIds.length} purchases for ${email} on device ${deviceId.substring(0, 10)}...`)
    
    return { success: true, claimedCount: purchaseIds.length }
    
  } catch (e) {
    console.error("Error claiming purchases", e)
    throw e
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify authentication
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  
  if (req.method === 'POST') {
    // Create new purchase
    try {
      const { purchase, newBalance } = req.body
      
      if (!purchase || newBalance === undefined) {
        return res.status(400).json({ error: 'Missing purchase or newBalance' })
      }
      
      await CapturePurchase(session.user.email, purchase, newBalance)
      
      res.status(200).json({ 
        success: true,
        message: 'Purchase captured successfully' 
      })
      
    } catch (e) {
      console.error("Processing error adding purchase", e)
      res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' })
    }
    
  }else if (req.method === 'GET') {
  // Get pending purchases with expanded item details
  try {
    // Check if this is a game client request (has accountId param)
    const accountId = req.query.accountId as string
    
    let email: string
    
    if (accountId) {
      // Game client request - look up email from accountId
      const playersSnapshot = await db.collection('players')
        .where('accountId', '==', accountId)
        .limit(1)
        .get()
      
      if (playersSnapshot.empty) {
        return res.status(404).json({ error: 'Player not found' })
      }
      
      const playerDoc = playersSnapshot.docs[0]
      email = playerDoc.id // Document ID is the email
      
    } else {
      // Web browser request - use session
      const session = await getServerSession(req, res, authOptions)
      
      if (!session?.user?.email) {
        return res.status(401).json({ error: 'Not authenticated' })
      }
      
      email = session.user.email
    }
    
    const purchases = await GetPendingPurchases(email)
    
    res.status(200).json({ 
      success: true,
      purchases,
      count: purchases.length
    })
    
  } catch (e) {
    console.error("Processing error getting purchases", e)
    res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' })
  }
} else if (req.method === 'PUT') {
    // Claim purchases (when game client adds to inventory)
    try {
      const { purchaseIds, deviceId } = req.body
      
      if (!purchaseIds || !Array.isArray(purchaseIds)) {
        return res.status(400).json({ error: 'Missing purchaseIds array' })
      }
      
      if (!deviceId) {
        return res.status(400).json({ error: 'Missing deviceId' })
      }
      
      const result = await ClaimPurchases(session.user.email, purchaseIds, deviceId)
      
      res.status(200).json({ 
        success: true,
        message: 'Purchases claimed successfully',
        claimedCount: result.claimedCount
      })
      
    } catch (e) {
      console.error("Processing error claiming purchases", e)
      res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' })
    }
    
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}