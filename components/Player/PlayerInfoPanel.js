import * as React from 'react'
import { useSession } from "next-auth/react"
import {
    Text,
    Box,
    VStack,
    Input,
    Button,
    Stack,
    Heading,
    Divider,
    useColorModeValue,
    HStack,

  } from '@chakra-ui/react'

  //import {useRef} from 'react'
  import {useSelector, useDispatch} from 'react-redux'


 var http = require('http');



export default function PlayerInfoPanel() {
   
  const { data: session, status, update } = useSession()
  //this is always reading from the redux store  
    const myplayer = useSelector((state) => state.player);
   
   

 

 //on login, read from session for the original credits and put it in the redux store
   


    
    return (
        <>
             <Box p='2'>
             <HStack> <Heading size='sm'>Player Email: </Heading><Text size='lg'>{myplayer.id}</Text></HStack>    
             <HStack><Heading size='sm'>Coin Balance: </Heading><Heading size='sm'>{myplayer.credits}</Heading></HStack> 
           </Box>
           <Divider orientation='horizontal' />
          

              
        </>
      )
  }

