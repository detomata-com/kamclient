// pages/auth/verify.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import { Box, Spinner, Text, VStack, Button } from '@chakra-ui/react'

export default function VerifyMagicLink() {
  const router = useRouter()
  const { token } = router.query
  const [error, setError] = useState('')

  useEffect(() => {
    if (token && typeof token === 'string') {
      verifyToken(token)
    }
  }, [token])

  const verifyToken = async (token: string) => {
    try {
      const result = await signIn('magic-link', {
        token,
        redirect: false,
        callbackUrl: '/Apothecary'
      })

      if (result?.ok) {
        router.push('/Apothecary')
      } else {
        setError('Invalid or expired link. Please request a new one.')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setError('Something went wrong. Please try again.')
    }
  }

  if (error) {
    return (
      <Box maxW="md" mx="auto" mt={8} p={6}>
        <VStack spacing={4}>
          <Text color="red.500">{error}</Text>
          <Button onClick={() => router.push('/auth/signin')}>
            Back to Sign In
          </Button>
        </VStack>
      </Box>
    )
  }

  return (
    <Box maxW="md" mx="auto" mt={8} p={6}>
      <VStack spacing={4}>
        <Spinner size="xl" />
        <Text>Verifying your magic link...</Text>
      </VStack>
    </Box>
  )
}