// pages/auth/signin.tsx
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Box, Button, Input, Text, VStack, Heading } from '@chakra-ui/react'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/store'
      })
      
      if (result?.ok) {
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Sign in error:', error)
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
            Click the link in the email to sign in. The link will expire in 24 hours.
          </Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box maxW="md" mx="auto" mt={8} p={6}>
      <VStack spacing={6} as="form" onSubmit={handleSubmit}>
        <Heading>Sign in to Kamioza</Heading>
        
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