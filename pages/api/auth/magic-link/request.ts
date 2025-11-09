// pages/api/auth/magic-link/request.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { customInitApp } from "@/lib/firebase-admin-config"
import { getFirestore } from 'firebase-admin/firestore'
import crypto from 'crypto'
import { Resend } from 'resend'

customInitApp()
const db = getFirestore()
const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Magic link request received:', req.method, req.body)
     
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  try {
    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes

    // Store token in Firebase
    await db.collection('magicTokens').doc(token).set({
      email: email.toLowerCase(),
      token,
      createdAt: Date.now(),
      expiresAt,
      used: false
    })

    // Create magic link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const magicLink = `${baseUrl}/auth/verify?token=${token}`

    // Send email via Resend
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@kamioza.com',
      to: email,
      subject: 'Sign in to Kamioza',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Kamioza!</h2>
          <p>Click the button below to sign in to your account:</p>
          <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Sign In to Kamioza
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${magicLink}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 15 minutes. If you didn't request this email, you can safely ignore it.
          </p>
        </div>
      `
    })

    console.log('Magic link sent to:', email)
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error sending magic link:', error)
    res.status(500).json({ error: 'Failed to send magic link' })
  }
}