// pages/registration-complete.tsx
import { Box, Heading, Text, VStack, Button } from '@chakra-ui/react'
import { useRouter } from 'next/router'

export default function RegistrationComplete() {
  const router = useRouter()

  return (
    <Box maxW="2xl" mx="auto" mt={12} p={8} textAlign="center">
      <VStack spacing={6}>
        <Heading size="2xl">✅ Your Device is Registered!</Heading>
        
        <Text fontSize="lg" color="gray.700">
          You're all set! Your device is now connected to your Kamioza account.
        </Text>

        <Box 
          p={6} 
          bg="blue.50" 
          borderRadius="lg" 
          borderWidth="1px" 
          borderColor="blue.200"
        >
          <Heading size="md" mb={3}>Discover Game Add-ons</Heading>
          <Text mb={4}>
            Find spells, items, and exclusive content in the Kamioza web store.
          </Text>
          <Text fontSize="sm" color="gray.600">
            Simply enter your email at <strong>kamioza.com</strong> to access your account and browse available items.
          </Text>
        </Box>

        <Button 
          colorScheme="blue" 
          size="lg"
          onClick={() => router.push('/')}
        >
          Explore Kamioza
        </Button>

        <Text fontSize="sm" color="gray.500">
          You can close this page and return to the game.
        </Text>
      </VStack>
    </Box>
  )
}