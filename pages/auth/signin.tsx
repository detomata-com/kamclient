// pages/auth/signin.tsx
// pages/auth/signin.tsx
import { useState } from 'react'
import { Box, Button, Input, Text, VStack, Heading } from '@chakra-ui/react'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/magic-link/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to send magic link')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <Box maxW="md" mx="auto" mt={8} p={6}>
        <VStack spacing={4}>
          <Heading size="lg">Check your email</Heading>
          <Text>
            We've sent a magic link to <strong>{email}</strong>
          </Text>
          <Text color="gray.600" fontSize="sm">
            Click the link in the email to sign in. The link will expire in 15 minutes.
          </Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box maxW="md" mx="auto" mt={8} p={6}>
      <VStack spacing={6} as="form" onSubmit={handleSubmit}>
        <Heading>Sign in to Kamioza</Heading>

        {error && (
          <Text color="red.500">{error}</Text>
        )}

        <Input
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          size="lg"
        />

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          width="full"
          isLoading={isLoading}
        >
          Send Magic Link
        </Button>

        <Text fontSize="sm" color="gray.600">
          No password needed - we'll email you a secure login link
        </Text>
      </VStack>
    </Box>
  )
}