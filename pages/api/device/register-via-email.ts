// pages/api/device/register-via-email.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { customInitApp } from '@/lib/firebase-admin-config'
import { getFirestore } from 'firebase-admin/firestore'
import crypto from 'crypto'
import { Resend } from 'resend'

customInitApp()
const db = getFirestore()
const resend = new Resend(process.env.RESEND_API_KEY)

export interface DeviceRegistrationRequest {
  email: string
  publicKey: string
  deviceInfo: {
    platform?: string
    userAgent?: string
    deviceName?: string
  }
}

export interface DeviceRegistrationResponse {
  success: boolean
  message: string
  emailSent?: boolean
  error?: string,
  checkToken?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeviceRegistrationResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  const { email, publicKey, deviceInfo } = req.body as DeviceRegistrationRequest

  // Validate email
  if (!email || !email.includes('@')) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid email address' 
    })
  }

  // Validate public key (Ethereum address format)
  if (!publicKey || !publicKey.match(/^0x[a-fA-F0-9]{40}$/)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid public key format. Expected Ethereum address (0x...)' 
    })
  }

  try {
    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes

    // Store registration intent in Firebase
    await db.collection('registrationTokens').doc(token).set({
      token,
      email: email.toLowerCase(),
      publicKey,
      deviceInfo: deviceInfo || {},
      createdAt: Date.now(),
      expiresAt,
      used: false
    })

    // Create magic link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const magicLink = `${baseUrl}/auth/verify-registration?token=${token}`

    // Send email via Resend (same template as login)
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@kamioza.com',
      to: email,
      subject: 'Complete Your Kamioza Device Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Kamioza!</h2>
          <p>Click the button below to complete your device registration:</p>
          <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Complete Registration
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${magicLink}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 15 minutes. If you didn't request this, you can safely ignore it.
          </p>
        </div>
      `
    })

    console.log('Device registration email sent to:', email)
    
    return res.status(200).json({
      success: true,
      message: 'Check your email to complete device registration',
      emailSent: true,
      checkToken: token
    })

  } catch (error) {
    console.error('Error sending device registration email:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send registration email',
      error: 'Internal server error'
    })
  }
}