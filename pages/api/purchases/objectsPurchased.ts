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
      console.log(`⚠️ Player not found: ${email}`)
      return []
    }
    
    const playerData = playerDoc.data()
    const pendingPurchases = playerData?.pendingPurchases || []
    
    // Filter for unclaimed purchases only
    const unclaimedPurchases = pendingPurchases.filter((p: any) => !p.claimed)
    
    if (unclaimedPurchases.length === 0) {
      console.log(`📦 No unclaimed purchases for ${email}`)
      return []
    }
    
    console.log(`🔍 Looking up ${unclaimedPurchases.length} unclaimed purchases...`)
    
    // Fetch ALL item_content docs once (more efficient than individual lookups)
    const itemContentSnapshot = await db.collection('item_content').get()
    const itemContentMap = new Map()
    
    // Build case-insensitive lookup map
    itemContentSnapshot.docs.forEach(doc => {
      const data = doc.data()
      const lowercaseName = data.name?.toLowerCase()
      
      if (lowercaseName) {
        itemContentMap.set(lowercaseName, {
          id: doc.id,
          name: data.name,
          desc: data.desc || '',
          image: data.image || '',
          items: data.items || []
        })
      }
    })
    
    console.log(`📋 Loaded ${itemContentMap.size} item packs from item_content`)
    
    // Expand each purchase with pack details
    const expandedPurchases = unclaimedPurchases.map((purchase: any) => {
      const lowercaseItemId = purchase.itemId.toLowerCase()
      const packData = itemContentMap.get(lowercaseItemId)
      
      if (packData) {
        console.log(`   ✅ "${purchase.itemId}" → Found pack with ${packData.items.length} items`)
        
        return {
          ...purchase,
          items: packData.items,
          packDescription: packData.desc,
          packImage: packData.image,
          packName: packData.name // Use the correct casing from database
        }
      } else {
        console.warn(`   ❌ "${purchase.itemId}" → No matching pack found`)
        console.warn(`      Available packs: ${Array.from(itemContentMap.keys()).join(', ')}`)
        
        return {
          ...purchase,
          items: [],
          packDescription: 'Pack not found in catalog',
          packImage: '',
          packName: purchase.itemId
        }
      }
    })
    
    const totalItems = expandedPurchases.reduce((sum: any, p: { items: string | any[] }) => sum + (p.items?.length || 0), 0)
    console.log(`📦 Returning ${expandedPurchases.length} purchases with ${totalItems} total items for ${email}`)
    
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
  
  if (req.method === 'POST') {
    // Create new purchase - REQUIRES SESSION
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    
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
    
  } else if (req.method === 'GET') {
    // Get pending purchases - SUPPORTS BOTH SESSION AND ACCOUNTID
    try {
      const accountId = req.query.accountId as string
      let email: string
      
      if (accountId) {
        // Game client request - look up email from accountId
        console.log(`🎮 Game client request for accountId: ${accountId}`)
        
        const playersSnapshot = await db.collection('players')
          .where('accountId', '==', accountId)
          .limit(1)
          .get()
        
        if (playersSnapshot.empty) {
          return res.status(404).json({ error: 'Player not found' })
        }
        
        const playerDoc = playersSnapshot.docs[0]
        email = playerDoc.id // Document ID is the email
        console.log(`✅ Found player: ${email}`)
        
      } else {
        // Web browser request - use session
        const session = await getServerSession(req, res, authOptions)
        
        if (!session?.user?.email) {
          return res.status(401).json({ error: 'Not authenticated' })
        }
        
        email = session.user.email
        console.log(`🌐 Web request for: ${email}`)
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
    // Claim purchases - SUPPORTS BOTH SESSION AND ACCOUNTID
    try {
      const { purchaseIds, deviceId, accountId } = req.body
      let email: string
      
      if (!purchaseIds || !Array.isArray(purchaseIds)) {
        return res.status(400).json({ error: 'Missing purchaseIds array' })
      }
      
      if (!deviceId) {
        return res.status(400).json({ error: 'Missing deviceId' })
      }
      
      if (accountId) {
        // Game client request
        console.log(`🎮 Game client claim for accountId: ${accountId}`)
        
        const playersSnapshot = await db.collection('players')
          .where('accountId', '==', accountId)
          .limit(1)
          .get()
        
        if (playersSnapshot.empty) {
          return res.status(404).json({ error: 'Player not found' })
        }
        
        const playerDoc = playersSnapshot.docs[0]
        email = playerDoc.id
        
      } else {
        // Web browser request
        const session = await getServerSession(req, res, authOptions)
        
        if (!session?.user?.email) {
          return res.status(401).json({ error: 'Not authenticated' })
        }
        
        email = session.user.email
      }
      
      const result = await ClaimPurchases(email, purchaseIds, deviceId)
      
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