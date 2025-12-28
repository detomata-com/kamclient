'use client'

import * as React from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import {
    Text,
     Box,
    VStack,
    Input,
    InputGroup,
    InputLeftElement,
    Button,
    Stack,
    Heading,
    Accordion,
    AccordionPanel,
    AccordionIcon,
    AccordionButton,
    AccordionItem,
    useColorModeValue,
    HStack,
    FormControl,
    FormLabel,
    Spacer,
    Alert, 
    AlertIcon

  } from '@chakra-ui/react'

  //import {useRef} from 'react'
  import {useSelector, useDispatch} from 'react-redux'
  import {SET_PLAYER} from '../../services/reducers/playerSlice'
  //import { EmailIcon } from '@chakra-ui/icons';
  import { v4 as uuidv4 } from 'uuid';
  import { usePathname } from 'next/navigation'


 

export default function PlayerAuthChoice() {
    const { data: session } = useSession()
    const dispatch = useDispatch();
    const [value, setValue] = React.useState('');
    const [playername, setplayername] = React.useState('');
    const [email, setemail] = React.useState('');
    const pathname = usePathname();
   // console.log(pathname);
   // const myplayer = useSelector((state) => state.player);
  
    const handleplayerNameChange = (event) => setplayername(event.target.value)
    const handleEmailChange = (event) => setemail(event.target.value)

 
function setMessage(msg) {
      return (
            <Alert status='info'>
              <AlertIcon />
                  {msg}
            </Alert>
          )
  }


  const handleRegister = async () => {
   
    setMessage('Sending registration email...'); // Show loading state
  
  try {
    const response = await fetch('/api/auth/magic-link/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    console.log('Registration response:', data);
    
    if (response.ok && data.success) {
      setMessage('Check your email for registration link!');
    } else {
      setMessage(data.error || 'Problem registering. Please try again.');
    }
  } catch (error) {
    console.error('Registration error:', error);
    setMessage('Problem registering. Please try again.');
  } 
};


    const handleLogin = async () => {
        try {
        signIn('kamioza_login', {
            callbackUrl: pathname,
            })
         
        } catch (error) {
            console.log('error happened calling signin!....',error)
            
        }
    };
  
    
    return (
        <>
              <VStack
                    spacing={4}
                    align='stretch'
                >
                  <Accordion allowToggle>
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box as='span' flex='1' textAlign='left'>
                          Register
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                Registering only requires your email.
                <Box
                          rounded={'lg'}
                          bg={useColorModeValue('white', 'gray.700')}
                          boxShadow={'lg'}
                          p={8}>
                          <Stack spacing={4}>
                            
                            <FormControl id="email" isRequired>
                              <FormLabel>Email address</FormLabel>
                              <Input type="email" onChange={handleEmailChange} />
                            </FormControl>
                        
                            <Stack spacing={10} pt={2}>
                              <Button
                                loadingText="Submitting"
                                onClick={() =>  handleRegister()}
                                size="lg"
                                bg={'blue.400'}
                                color={'white'}
                                _hover={{
                                  bg: 'blue.500',
                                }}>
                                Register
                                {/* Not Taking Sign Ups Yet */}
                              </Button>
                            </Stack>
                          
                          </Stack>
                        </Box>
                    </AccordionPanel>
                  </AccordionItem>

                 
                  </Accordion>
                  <Button
                    loadingText="Submitting"
                    onClick={() => handleLogin()}
                    size="lg"
                    bg={'blue.400'}
                    color={'white'}
                    _hover={{
                      bg: 'blue.500',
                    }}>
                    Login
                  </Button>
                </VStack> 
        </>
      )
  }

  //callbackUrl: new URL(returnpath, window.location.href).href,