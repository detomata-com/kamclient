'use client;'

import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { store } from '../store'
import { Provider, useDispatch } from 'react-redux'
import { SessionProvider, useSession } from "next-auth/react"
import { SET_PLAYER } from '@/services/reducers/playerSlice'
import { RoomProvider } from '@/components/Room/RoomContext'
import type { Session } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    accountId?: string
    playername?: string
    email?: string
    emailValidated?: boolean
    stripeid?: string
    credits?: number
    trustedDevices?: string[]
  }
}

// Sync component
function SessionSync() {
  const { data: session } = useSession()
  const dispatch = useDispatch()
  
  useEffect(() => {
    if (session?.accountId) {
      dispatch(SET_PLAYER({
        playername: session.playername || '',
        email: session.email || '',
        id: session.accountId,
        playerip: '',
        verToken: 'authenticated',
        isAuthenticated: true,
        emailValidated: session.emailValidated || true,
        stripeid: session.stripeid || '',
        credits: session.credits || 0,
        trustedDevices: session.trustedDevices || []
      }))
    }
  }, [session, dispatch])
  
  return null
}

export default function App({Component, pageProps: { session, ...pageProps }}: AppProps) {
 
  useEffect(() => {
    import('preline')
  }, [])

  return(
    <SessionProvider session={session}>
      <Provider store={store}>
        <SessionSync />  {/* Add this */}
        <RoomProvider>
          <ChakraProvider>
            <Component {...pageProps} />
          </ChakraProvider> 
        </RoomProvider>
      </Provider>
    </SessionProvider>
  )
}