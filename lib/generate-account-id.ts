// lib/generate-account-id.ts
import { customAlphabet } from 'nanoid';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const generateId = customAlphabet(alphabet, 16);

export function generateAccountId(): string {
  return generateId();
}

// Test collision resistance
export async function generateUniqueAccountId(
  db: FirebaseFirestore.Firestore
): Promise<string> {
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    const accountId = generateId();
    
    // Check if exists
    const doc = await db.collection('players').doc(accountId).get();
    if (!doc.exists) {
      return accountId;
    }
    
    attempts++;
    console.warn(`AccountId collision detected, retrying... (${attempts}/${maxAttempts})`);
  }
  
  throw new Error('Failed to generate unique accountId');
}