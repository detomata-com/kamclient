import * as React from 'react'
import { signOut } from "next-auth/react"
import {
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    WrapItem,
    VStack,
    Avatar,
    Button
   } from '@chakra-ui/react'

import {useSelector, useDispatch} from 'react-redux'
import {SET_PLAYER} from '../../services/reducers/playerSlice'

import { useDisclosure } from '@chakra-ui/react';
import PlayerAuthChoice from './PlayerAuthChoice'
import PlayerInfoPanel from './PlayerInfoPanel'

export default function PlayerAuth() {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = React.useRef();
   
    const myplayer = useSelector((state) => state.player);
    const dispatch = useDispatch();

    const handleLogout = async () => {
      console.log('logging out!')
      signOut({ callbackUrl: '/' })
    }

    // Use playername if available, fallback to email
    const displayName = myplayer.isAuthenticated 
      ? (myplayer.playername || myplayer.email) 
      : '';

    return (
        <>
          <WrapItem>
            <Avatar onClick={onOpen} size='md' src='' name={displayName} />
          </WrapItem>

          <Drawer
            size={'md'}
            isOpen={isOpen}
            placement='right'
            onClose={onClose}
            finalFocusRef={btnRef}
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Your account</DrawerHeader>
    
              <DrawerBody>
            
                <VStack
                  spacing={4}
                  align='stretch'
                >
                  <Avatar size='lg' name={displayName} src='' />
        
                  {!myplayer.isAuthenticated ? (
                    <PlayerAuthChoice/>
                  ) : (
                    <>
                      <PlayerInfoPanel/>
                      <Button 
                        bg={'blue.400'} 
                        color={'white'} 
                        _hover={{ bg: 'blue.500' }} 
                        size='sm' 
                        onClick={handleLogout}
                      >
                        Log Out
                      </Button>
                    </>
                  )}
                </VStack> 
              </DrawerBody>
    
              <DrawerFooter>
                <Button variant='outline' mr={3} onClick={onClose}>
                  Done
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </>
      )
}