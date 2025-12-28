import type { NextApiRequest, NextApiResponse } from 'next'
import { customInitApp } from "@/lib/firebase-admin-config";
import { getFirestore, Timestamp, FieldValue, Filter  } from 'firebase-admin/firestore';




customInitApp();
const db = getFirestore();



//ip address comes in at login
//login updates but doesn't capture new data
//game will pass a player for registration (playername, email, public key)
// _login is actually requested to the game (still designing)
// _addPublicKey will be it's own call to update


export async function CapturePlayer(player: any){
  try {
      const data = player //this stuff should already be in player
      data.ts_added = Date.now();
      data.emailValidated = false;
      data.ip = '';
      data.credits = 0;
      const res = await db.collection('players').doc(player.email).set(data); 
      return res;
    } catch (e) {
      console.error("player creation error", e);
      return;
    }
  }

 export async function UpdatePlayer(email: string, updates: any) {
  try {
    // Simple update using email as document ID
    const playerRef = db.collection('players').doc(email.toLowerCase());
    await playerRef.update(updates);
    
    return { success: true };
  } catch (e) {
    console.error("Error updating player:", e);
    throw e;
  }
}




export async function GetPlayer(email: string) {
  try {
    // Simple lookup using email as document ID
    const playerDoc = await db.collection('players')
      .doc(email.toLowerCase())
      .get();
    
    if (!playerDoc.exists) {
      console.log('No player found for email:', email);
      return null;
    }
    
    return playerDoc.data();
  } catch (e) {
    console.error("Error getting player by email:", e);
    return null;
  }
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  if (req.method === 'POST') {
         try {
                let myPlayer = req.body
                console.log('myPlayer to the database is -->', myPlayer)
                let result = await CapturePlayer(myPlayer);
                res.status(200).json({ 'result': result })

          } catch (e) {
            console.error("processing error adding player", e);
            res.status(500).json({error: e })
          }

    } else if (req.method === 'GET') {
          try {
            console.log('request is',req.query);

            const myemail = req.query.email as string


            const myplayer: any = await GetPlayer(myemail) 
            const jsonData = JSON.parse(JSON.stringify(myplayer));
            res.status(200).json(jsonData)
            //res.status(200).send({'result': myplayer })
             } catch (e) {
              console.error("processing error Getting player", e);
              res.status(500).json({error: e })
            }
    } else if (req.method === 'PUT') {
      try {
             let myPlayer = req.body
             console.log('myPlayer update -->', myPlayer)
             let result = await UpdatePlayer(myPlayer.email, myPlayer.updates);
             res.status(200).json({ 'result': result })

       } catch (e) {
         console.error("processing error updating player", e);
         res.status(500).json({error: e })
       }

 }
  }