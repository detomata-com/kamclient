// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { customInitApp } from "@/lib/firebase-admin-config";
import { getFirestore, Timestamp, FieldValue, Filter  } from 'firebase-admin/firestore';

customInitApp();
const db = getFirestore();


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

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'magic-link',
      name: 'Magic Link',
      credentials: {
        token: { label: "Token", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.token) {
          return null
        }

        try {
          // Verify token through our custom endpoint
          const response = await fetch(
            `${process.env.NEXTAUTH_URL}/api/auth/magic-link/verify`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: credentials.token })
            }
          )

          if (response.ok) {
            const data = await response.json()
            return data.user
          }

          return null
        } catch (error) {
          console.error('Authorization error:', error)
          return null
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
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',

  jwt: {
    secret: process.env.NEXTAUTH_SECRET
  },

  callbacks: {
  async jwt({ user, token, trigger, session }) {
    if (user?.email) {
      // Simple lookup using email as document ID
      const playerDoc = await db.collection('players')
        .doc(user.email.toLowerCase())
        .get();
      
      if (playerDoc.exists) {
        const playerData = playerDoc.data()!;
        token.accountId = playerData.accountId;  // Add accountId to JWT (if exists)
        token.email = playerData.email;
        token.playername = playerData.playername;
        token.stripeid = playerData.stripeid;
        token.credits = playerData.credits;
        token.emailValidated = playerData.emailValidated;
      }
    }
    
    if (trigger === "update" && session?.credits !== undefined) {
      token.credits = session.credits;
    }
    
    return token;
    },

   async session({ session, token }: any) {
    session.accountId = token.accountId;  // Add to session (if exists)
    session.email = token.email;
    session.playername = token.playername;
    session.stripeid = token.stripeid;
    session.isAuthenticated = true;
    session.credits = token.credits;
    session.emailValidated = token.emailValidated;
    
    return session;
  
    }
  }
}

export default NextAuth(authOptions)