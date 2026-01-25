// pages/api/purchases/objectsAvailable.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { customInitApp } from "@/lib/firebase-admin-config";
import { getFirestore, Timestamp, FieldValue, Filter  } from 'firebase-admin/firestore';




customInitApp();
const db = getFirestore();


//used to get a players available objects by player id

export async function GetObjects(){

  try {
   //this is a clean way to map results from firestore
    const snapshot = await db.collection('item_content').get()
    return snapshot.docs.map(doc => doc.data());

    } catch (e) {
      console.error("error getting Objects by name", e);
      return;
    }
  }


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  if (req.method === 'GET') {
          try {

            const list: any = await GetObjects() 
            const jsonData = JSON.parse(JSON.stringify(list));
            res.status(200).json(jsonData)
            //res.status(200).send({'result': myplayer })
             } catch (e) {
              console.error("processing error Getting Objects", e);
              res.status(500).json({error: e })
            }
    } 
  }