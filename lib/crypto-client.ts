/**
 * Kamioza Crypto Client - Browser Implementation
 * 
 * Uses Web Crypto API (built-in, no external dependencies)
 * Algorithm: ECDSA with P-256 curve
 * Compatible with Node.js crypto module for game client verification
 */

const STORAGE_KEY = 'kamioza_device_keypair'

interface StoredKeypair {
  publicKey: JsonWebKey
  privateKey: JsonWebKey
}

/**
 * Generate or load device keypair from localStorage
 * Private key never leaves the browser
 */
async function getOrCreateKeypair(): Promise<CryptoKeyPair> {
  // Check for existing keypair
  const stored = localStorage.getItem(STORAGE_KEY)
  
  if (stored) {
    try {
      const keypair: StoredKeypair = JSON.parse(stored)
      
      // Import keys from storage
      const publicKey = await crypto.subtle.importKey(
        'jwk',
        keypair.publicKey,
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['verify']
      )
      
      const privateKey = await crypto.subtle.importKey(
        'jwk',
        keypair.privateKey,
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign']
      )
      
      console.log('🔑 Loaded existing browser keypair')
      return { publicKey, privateKey }
    } catch (error) {
      console.error('Failed to load stored keypair, generating new one:', error)
      // Fall through to generate new keypair
    }
  }
  
  // Generate new keypair using ECDSA P-256
  const keypair = await crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256' // Also known as secp256r1, prime256v1
    },
    true, // extractable
    ['sign', 'verify']
  )
  
  // Export and store in localStorage
  const publicKeyJwk = await crypto.subtle.exportKey('jwk', keypair.publicKey)
  const privateKeyJwk = await crypto.subtle.exportKey('jwk', keypair.privateKey)
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    publicKey: publicKeyJwk,
    privateKey: privateKeyJwk
  }))
  
  console.log('🔑 Generated new browser keypair')
  
  return keypair
}

/**
 * Get browser's public key as hex string
 * This is stored in Firebase as the device's "address"
 * Format: Uncompressed point (04 + x-coordinate + y-coordinate)
 */
export async function getBrowserPublicKey(): Promise<string> {
  const keypair = await getOrCreateKeypair()
  const publicKeyJwk = await crypto.subtle.exportKey('jwk', keypair.publicKey)
  
  // Convert JWK coordinates to hex
  const x = base64UrlToHex(publicKeyJwk.x!)
  const y = base64UrlToHex(publicKeyJwk.y!)
  
  // Return as uncompressed point format (standard for ECDSA)
  // '04' prefix indicates uncompressed point
  return `04${x}${y}`
}

/**
 * Sign purchase data with browser's private key
 * 
 * @param purchaseData - The purchase information to sign
 * @returns Signature as hex string
 */
export async function signPurchase(purchaseData: {
  accountId: string
  itemId: string
  cost: number
  timestamp: number
  purchaseId: string
}): Promise<string> {
  const keypair = await getOrCreateKeypair()
  
  // Create deterministic JSON string (sorted keys for consistency)
  const message = JSON.stringify(purchaseData, Object.keys(purchaseData).sort())
  const messageBuffer = new TextEncoder().encode(message)
  
  // Sign with ECDSA-SHA256
  const signatureBuffer = await crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: 'SHA-256'
    },
    keypair.privateKey,
    messageBuffer
  )
  
  // Convert to hex string for storage
  const signatureHex = bufferToHex(signatureBuffer)
  
  console.log('✍️ Signed purchase:', {
    purchaseId: purchaseData.purchaseId,
    signatureLength: signatureHex.length,
    signaturePreview: signatureHex.substring(0, 20) + '...'
  })
  
  return signatureHex
}

/**
 * Verify a signature (for testing/debugging)
 * 
 * @param purchaseData - The original purchase data
 * @param signatureHex - Signature to verify
 * @param publicKeyHex - Public key that should have signed it
 * @returns true if signature is valid
 */
export async function verifySignature(
  purchaseData: any,
  signatureHex: string,
  publicKeyHex: string
): Promise<boolean> {
  try {
    // Reconstruct the same message
    const message = JSON.stringify(purchaseData, Object.keys(purchaseData).sort())
    const messageBuffer = new TextEncoder().encode(message)
    
    // Import the public key
    const publicKey = await importPublicKeyFromHex(publicKeyHex)
    
    // Convert signature from hex to buffer
    const signatureBuffer = hexToBuffer(signatureHex)
    
    // Verify the signature
    const isValid = await crypto.subtle.verify(
      {
        name: 'ECDSA',
        hash: 'SHA-256'
      },
      publicKey,
      signatureBuffer,
      messageBuffer
    )
    
    console.log('🔍 Signature verification:', isValid ? '✅ Valid' : '❌ Invalid')
    return isValid
    
  } catch (error) {
    console.error('❌ Verification failed:', error)
    return false
  }
}

/**
 * Check if browser has a keypair initialized
 */
export function hasKeypair(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null
}

/**
 * Clear stored keypair (for testing or account reset)
 * WARNING: This will invalidate all signatures from this browser
 */
export function clearKeypair(): void {
  localStorage.removeItem(STORAGE_KEY)
  console.log('🗑️ Cleared browser keypair')
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert base64url (JWK format) to hex string
 */
function base64UrlToHex(base64url: string): string {
  // Convert base64url to base64
  const base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  
  // Decode base64 to binary
  const binary = atob(base64)
  
  // Convert binary to hex
  return Array.from(binary)
    .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Convert hex string to ArrayBuffer
 */
function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes.buffer
}

/**
 * Convert hex string to base64url (for JWK)
 */
function hexToBase64Url(hex: string): string {
  // Convert hex to byte array
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  
  // Convert to binary string
  let binary = ''
  bytes.forEach(b => binary += String.fromCharCode(b))
  
  // Convert to base64url
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Import public key from hex format
 * Used for signature verification
 */
async function importPublicKeyFromHex(hex: string): Promise<CryptoKey> {
  // Remove '04' prefix if present (uncompressed point indicator)
  if (hex.startsWith('04')) {
    hex = hex.substring(2)
  }
  
  // Split into x and y coordinates (each 64 hex chars = 32 bytes for P-256)
  const x = hex.substring(0, 64)
  const y = hex.substring(64, 128)
  
  // Convert to base64url format for JWK
  const xBase64 = hexToBase64Url(x)
  const yBase64 = hexToBase64Url(y)
  
  // Import as JWK
  return await crypto.subtle.importKey(
    'jwk',
    {
      kty: 'EC',
      crv: 'P-256',
      x: xBase64,
      y: yBase64
    },
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['verify']
  )
}

// ============================================================================
// Testing/Debug Functions
// ============================================================================

/**
 * Get current keypair info (for debugging)
 * Does NOT expose private key
 */
export async function getKeypairInfo(): Promise<{
  hasKeypair: boolean
  publicKey?: string
}> {
  if (!hasKeypair()) {
    return { hasKeypair: false }
  }
  
  const publicKey = await getBrowserPublicKey()
  
  return {
    hasKeypair: true,
    publicKey: publicKey.substring(0, 20) + '...' + publicKey.substring(publicKey.length - 10)
  }
}

/**
 * Test the signing and verification flow
 */
export async function testSigningFlow(): Promise<boolean> {
  console.log('🧪 Testing signing flow...')
  
  // Generate test purchase
  const testPurchase = {
    accountId: 'test_account_123',
    itemId: 'furniture_pack_01',
    cost: 100,
    timestamp: Date.now(),
    purchaseId: 'test_purchase_' + Date.now()
  }
  
  // Sign it
  const signature = await signPurchase(testPurchase)
  const publicKey = await getBrowserPublicKey()
  
  // Verify it
  const isValid = await verifySignature(testPurchase, signature, publicKey)
  
  console.log('🧪 Test result:', isValid ? '✅ PASS' : '❌ FAIL')
  
  return isValid
}