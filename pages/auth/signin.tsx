import { Stack, Flex, Heading, FormControl, FormLabel, Checkbox, Button, Input,Text,Image} from "@chakra-ui/react"
import * as React from 'react'
import type {
    GetServerSidePropsContext,
    InferGetServerSidePropsType,
  } from "next"
  import { getCsrfToken } from "next-auth/react"
  
  export default function SignIn({
    csrfToken
  }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    
    
    const [email, setemail] = React.useState('');

    const handleEmailChange = (event: { target: { value: React.SetStateAction<string> } }) => setemail(event.target.value)

    return (
      <Stack minH={'100vh'} direction={{ base: 'column', md: 'row' }}>
      
      <Flex p={8} flex={1} align={'center'} justify={'center'}>
        <Stack spacing={4} w={'full'} maxW={'md'}>
        
        <Heading fontSize={'2xl'}>Sign in to your account</Heading>
        
        <form method="post" action="/api/auth/callback/kamioza_login">
          <Input name="csrfToken" type="hidden" defaultValue={csrfToken} /> 
          <FormControl id="email" isRequired>
              <FormLabel>Email address</FormLabel>
              <Input name="email" value={email} type="email" onChange={handleEmailChange} />
          </FormControl>

          <Button marginY={6} colorScheme={'blue'} variant={'solid'} type="submit">Sign in</Button>
        </form>

        </Stack>

      </Flex>
      <Flex flex={1}>
        <Image
          alt={'Login Image'}
          objectFit={'cover'}
          src={
            'https://azariaimages.s3.amazonaws.com/MEFLINS.png'
          }
        />
      </Flex>
    </Stack>
    )
  }
  
  export async function getServerSideProps(context: GetServerSidePropsContext) {
    return {
      props: {
        csrfToken: await getCsrfToken(context),
      },
    }
  }