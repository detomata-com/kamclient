
// NextAuth.js API route support: https://nextjs.org/docs/api-routes/introduction
// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { FirestoreAdapter } from "@next-auth/firebase-adapter"
import { cert } from "firebase-admin/app"

export interface returneduser {
  credits: number | null,
  stripeid: string | null,
  ts_added: number | null,
  ip: string | null,
  playername: string | null,
  id: string,
  emailValidated: boolean,
  email: string | null,
  name: string | null,
  image: string | null,
  isAuthenticated: boolean
}

export interface Session {
  playername: string | null,
  id: string,
  stripeid: string | null,
  emailValidated: boolean,
  email: string | null,
  name: string | null,
  image: string | null,
  isAuthenticated: boolean,
  credits: number | null
}

const firestoreAdapter = FirestoreAdapter({
  credential: cert({
    projectId: process.env.FB_PROJECTID,
    clientEmail: process.env.FB_CLIENT_EMAIL,
    privateKey: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  })
})

export const authOptions: NextAuthOptions = {
  adapter: firestoreAdapter, 
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM || 'noreply@kamioza.com',
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
    
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        
        try {
          await resend.emails.send({
            from: provider.from,
            to: email,
            subject: 'Sign in to Kamioza',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to Kamioza!</h2>
                <p>Click the button below to sign in to your account:</p>
                <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                  Sign In
                </a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="color: #666; word-break: break-all;">${url}</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                  This link will expire in 24 hours. If you didn't request this email, you can safely ignore it.
                </p>
              </div>
            `
          })
          console.log('Magic link sent to:', email)
        } catch (error) {
          console.error('Failed to send magic link:', error)
          throw error
        }
      }
    })
  ],
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  
  jwt: {
    secret: process.env.NEXTAUTH_SECRET
  },
  
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('Sign in attempt for:', user.email)
      
      if (!user.email) {
        console.error('No email provided')
        return false
      }
      
      try {
        // Check if player exists in your database
        const response = await fetch(
          `${process.env.NEXTAUTH_URL}/api/player?email=${encodeURIComponent(user.email)}`
        )
        
        if (response.ok) {
          const existingPlayer = await response.json()
          console.log('Existing player found:', existingPlayer.playername)
          
          // Update emailValidated since they clicked the magic link
          await fetch(`${process.env.NEXTAUTH_URL}/api/player`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...existingPlayer,
              emailValidated: true
            })
          })
        } else {
          // Create new player record using your existing API
          console.log('Creating new player:', user.email)
          const createResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/player`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              playername: user.email.split('@')[0] || 'Player',
              emailValidated: true,
              credits: 0,
              stripeid: null,
              trustedDevices: []
            })
          })
          
          if (!createResponse.ok) {
            console.error('Failed to create player')
            return false
          }
        }
        
        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false
      }
    },
    
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    
    async jwt({ user, token, trigger, session }) {
      // On initial sign in, fetch full player data
      if (user?.email) {
        try {
          const response = await fetch(
            `${process.env.NEXTAUTH_URL}/api/player?email=${encodeURIComponent(user.email)}`
          )
          
          if (response.ok) {
            const playerData = await response.json()
            token.id = playerData.email
            token.playername = playerData.playername
            token.stripeid = playerData.stripeid
            token.credits = playerData.credits
            token.emailValidated = playerData.emailValidated
            token.email = playerData.email
          }
        } catch (error) {
          console.error('Error fetching player data in jwt callback:', error)
        }
      }
      
      // Handle credit updates from Stripe
      if (trigger === "update" && session?.credits !== undefined) {
        token.credits = session.credits
      }
      
      return token
    },
    
    async session({ session, token }: any) {
      // Map token data to session
      session.id = token.id || token.email
      session.playername = token.playername
      session.stripeid = token.stripeid
      session.isAuthenticated = true
      session.credits = token.credits
      session.emailValidated = token.emailValidated
      session.email = token.email
      
      return session
    }
  }
}

export default NextAuth(authOptions)