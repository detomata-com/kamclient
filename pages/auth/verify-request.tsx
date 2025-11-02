import { Box, Heading, Text, VStack } from '@chakra-ui/react'

export default function VerifyRequest() {
  return (
    <Box maxW="md" mx="auto" mt={8} p={6}>
      <VStack spacing={4}>
        <Heading size="lg">Check your email</Heading>
        <Text>
          A sign in link has been sent to your email address.
        </Text>
        <Text color="gray.600" fontSize="sm">
          Click the link in the email to complete sign in. You can close this window.
        </Text>
      </VStack>
    </Box>
  )
}