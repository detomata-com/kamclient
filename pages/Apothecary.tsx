

import KamNavBar from '../components/NaviBar';

import{Footer} from '../components/Footer';
import { Flex, Square, Text, Center, Box,Spacer, Image, Heading, ListItem, UnorderedList, Button, ButtonGroup, Card, CardBody, CardFooter, Divider, Stack, SimpleGrid, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,useColorModeValue, HStack, VStack, LinkOverlay, Alert, AlertIcon} from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/react';
import StripeOrder from '../components/StripeOrder'
import { useSelector } from 'react-redux';

export function AuthError(){
 
  const myplayer = useSelector((state: any) => state.player);
  if(!myplayer.isAuthenticated){
    return (
      <Alert status='warning'>
        <AlertIcon />
            You must have an active logged in account to purchase. Please click on the round icon from the navigation menu.
      </Alert>
    )
  }else{
    return (
      <></>
    )
  }
 }

export default function Apothecary() {

  const { isOpen, onOpen, onClose } = useDisclosure();


 return (
<Box   w='100%' h='100%' bg={useColorModeValue('gray.400', 'gray.800')}>

<KamNavBar currentPage="Apothecary"></KamNavBar>

<AuthError></AuthError>

    <Flex flex={2} flexDirection={{base: 'column', md: 'column', lg:'row'  }}>
    
    <Box  mt={8} ml={10}>
    <Text  fontSize={['12px','16px','24px']} fontWeight='bold' color={useColorModeValue('gray.800', 'gray.300')}>Rathe&apos;s Apothecary is under construction</Text>
    <Image w={['150','300','400']} src='https://azariaimages.s3.amazonaws.com/bigRathe.png' alt='Rathe' />
    </Box>
    
   
    <Box  mt={8} ml={10}>
    <Box m={[5,10,20]}>
              
                      <Card bg={'#dbd2d2'} color={'teal'} maxW='md' >
                          <CardBody>
                            <HStack mt='6' spacing='3'>
                            <Image
                             boxSize='150px'
                             objectFit='cover'
                              src='https://azariaimages.s3.amazonaws.com/items/coins.png'
                              alt='Gopa 3 vials'
                              borderRadius='lg'
                            />
                             <VStack>
                             <Heading size='md'>Minted Nystrom <br></br> Rathe's favorite currency</Heading>
                             <Text fontSize='sm'>Not a crypto coin: Use Nystrom Coins to pay for our digital objects.</Text>
                             </VStack>
                             
                            
                            </HStack>
                          </CardBody>
                          <Divider />
                          <CardFooter>
                           <HStack>
                              <VStack px={4}>
                                <Text fontSize='lg' fontWeight={'bold'} >400 Coins</Text>  
                                <Text fontWeight={'bold'}>$5</Text>  
                                <StripeOrder productId = {1} price = {500}></StripeOrder>
                              </VStack>
                              <VStack px={4}>
                                <Text fontSize='lg' fontWeight={'bold'} >900 Coins</Text>  
                                <Text fontWeight={'bold'}>$10</Text>  
                                <StripeOrder productId = {2} price = {1000}></StripeOrder>
                              </VStack>
                              <VStack px={4}>
                                <Text fontSize='lg' fontWeight={'bold'} >2200 Coins</Text>  
                                <Text fontWeight={'bold'}>$20</Text>  
                                <StripeOrder productId = {3} price = {2000}></StripeOrder>
                              </VStack>
                              
                           </HStack>
                            
                           
                          </CardFooter>
                          <Text p={4} fontSize='xs'>When you buy Nystrom Coins you receive only a limited, non-refundable, non-transferable, revocable license to use Nystrom Coins, which have no value in real currency.</Text>
                        </Card>



      <Text  mt={8} mx={2} fontSize={['12px','16px','24px']} fontWeight='bold' color={useColorModeValue('gray.800', 'gray.300')}>App Items:</Text>
        <Text  mt={2} mx={2} fontSize={['12px','16px','16px']} fontWeight='bold' color={useColorModeValue('gray.800', 'gray.300')}>
        Kamioza Azaria is free to play and we have built it for you to be able to play all the way
        through with items available in the world. These items are here for added game play and are
        not required to play the game - but they could make it more fun!
      </Text>
    </Box>

    <SimpleGrid m={50} columns={{ sm: 1, md: 2, lg: 3 }} spacing={5} templateColumns='repeat(auto-fill, minmax(220px, 1fr))'>
          <Card bg={'#dbd2d2'} color={'teal'} maxW='sm'>
            <CardBody>
              <Image
                src='https://azariaimages.s3.amazonaws.com/items/Gopabrew.png'
                alt='Gopa 3 vials'
                borderRadius='lg'
              />
              <Stack mt='6' spacing='3'>
                <Heading size='md'>3 Vials of Gopa</Heading>
                <Text>
                  Sweet, restorative Gopa!
                </Text>
                <Text color='blue.600' fontSize='2xl'>
                  $2
                </Text>
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <ButtonGroup spacing='2'>
                <Button variant='solid' colorScheme='blue'>
                Purchase
                </Button>
              
              </ButtonGroup>
            </CardFooter>
          </Card>
          {/*******---------------------------------- */}
          <Card bg={'#dbd2d2'} color={'teal'} maxW='sm'>
            <CardBody>
              <Image
                src='https://azariaimages.s3.amazonaws.com/items/magicspell1.png'
                alt='Spell Pack 1 (3 random spells)'
                borderRadius='lg'
              />
              <Stack mt='6' spacing='3'>
                <Heading size='md'>Spell Pack 1</Heading>
                <Text>
                Get 3 Random spells - all ready to go 
                </Text>
                <Text color='blue.600' fontSize='2xl'>
                  $3
                </Text>
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <ButtonGroup spacing='2'>
                <Button variant='solid' colorScheme='blue'>
                Purchase
                </Button>
              
              </ButtonGroup>
            </CardFooter>
          </Card>
          {/*******---------------------------------- */}
          <Card bg={'#dbd2d2'} color={'teal'} maxW='sm'>
            <CardBody>
              <Image
                src='https://azariaimages.s3.amazonaws.com/items/fishboat.png'
                alt='fishboat'
                borderRadius='lg'
              />
              <Stack mt='6' spacing='3'>
                <Heading size='md'>Catch of the day</Heading>
                <Text>
                  Someone used a boat and caught some fish
                </Text>
                <Text color='blue.600' fontSize='2xl'>
                  $2
                </Text>
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <ButtonGroup spacing='2'>
                <Button variant='solid' colorScheme='blue'>
                Purchase
                </Button>
              
              </ButtonGroup>
            </CardFooter>
          </Card>
          {/*******---------------------------------- */}
          <Card bg={'#dbd2d2'} color={'teal'} maxW='sm'>
            <CardBody>
              <Image
                src='https://azariaimages.s3.amazonaws.com/items/Explosionstuff.png'
                alt='Gopa 3 vials'
                borderRadius='lg'
              />
              <Stack mt='6' spacing='3'>
                <Heading size='md'>Bomb Pack</Heading>
                <Text>
                  Drop em on all your friends!
                </Text>
                <Text color='blue.600' fontSize='2xl'>
                  $4
                </Text>
              </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
              <ButtonGroup spacing='2'>
                <Button variant='solid' colorScheme='blue'>
                Purchase
                </Button>
              
              </ButtonGroup>
            </CardFooter>
          </Card>
          {/*******---------------------------------- */}
    </SimpleGrid>  
    </Box>


    </Flex>

  <Footer></Footer>



</Box>

 
  )
}

{/* <Text fontSize='xs'>When you buy Nystrom Coins you receive only a limited, non-refundable, non-transferable, revocable license to use Nystrom Coins, which have no value in real currency.</Text> */}