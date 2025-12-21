// pages/auth/verify-registration.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Box, Spinner, Text, VStack, Heading, Button } from '@chakra-ui/react'

export default function VerifyRegistration() {
  const router = useRouter()
  const { token } = router.query
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (token && typeof token === 'string') {
      verifyToken(token)
    }
  }, [token])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/device/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus('success')
        setMessage(data.message || 'Device registered successfully!')
        // Redirect to completion page after brief delay
        setTimeout(() => {
          router.push('/registration-complete')
        }, 2000)
      } else {
        setStatus('error')
        setMessage(data.message || 'Registration failed. Please try again.')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  if (status === 'loading') {
    return (
      <Box maxW="md" mx="auto" mt={8} p={6}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Verifying your device registration...</Text>
        </VStack>
      </Box>
    )
  }

  if (status === 'error') {
    return (
      <Box maxW="md" mx="auto" mt={8} p={6}>
        <VStack spacing={4}>
          <Text color="red.500" fontSize="lg">{message}</Text>
          <Text color="gray.600">
            Please try registering your device again from the game client.
          </Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box maxW="md" mx="auto" mt={8} p={6}>
      <VStack spacing={4}>
        <Heading size="lg" color="green.500">✅ Success!</Heading>
        <Text>{message}</Text>
        <Text color="gray.600">Redirecting...</Text>
      </VStack>
    </Box>
  )
}