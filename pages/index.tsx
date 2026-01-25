

import KamNavBar from '../components/NaviBar';
import {ImageTrain} from '../components/ImageWelcome';
import{Footer} from '../components/Footer';
import SubscribeForm from '../components/emailsubscribe';
import { Flex, Square, Text, Center, Box,Spacer, Image, Heading, ListItem, UnorderedList, Button, useColorModeValue } from '@chakra-ui/react';
// Import the functions you need from the SDKs you need

//Authentication Imports
import type { InferGetServerSidePropsType} from 'next'
import { authOptions } from "../pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import PlayerAuthCheck from '../components/Player/PlayerAuthCheck'

import Head from 'next/head';

export async function getServerSideProps(context: any) {
  
  const session = await getServerSession(context.req, context.res, authOptions)
  var localplayer:any;

if (!session) {
  console.log('No session');
  return {
    props: {
      user: null,
      userid: null,
      isAuthenticated: false,
      stripeid: null,
      credits: '0'
    },
  }
}

// Just stringify/parse to remove undefined
return {
  props: JSON.parse(JSON.stringify({
    user: session.user || null,
    userid: session.accountId || null,
    isAuthenticated: !!session,
    stripeid: session.stripeid || null,
    credits: session.credits || '0'
  })),
}

}


// Metadata for the page
// export const metadata: Metadata = {
//   title: 'Kamioza Ch1 Azaria',
//   description: 'Kamioza Chapter 1: Azaria is a unique first-person massively multi-player adventure game that invites players to discover lost treasures, restore ancient artifacts, and unravel mysteries long forgotten. A retro game with co-op puzzle solving, micro competitions and resource management. Create powerful spells to protect and thrive in this beautifully crafted world.',
//   openGraph: {
//     title: 'Kamioza Chapter 1: Azaria',
//     description: 'Kamioza Chapter 1: Azaria is a unique first-person massively multi-player adventure game that invites players to discover lost treasures, restore ancient artifacts, and unravel mysteries long forgotten. A retro game with co-op puzzle solving, micro competitions and resource management. Create powerful spells to protect and thrive in this beautifully crafted world.',
//     url: 'https://kamioza.com', // URL of the page
//     siteName: 'Kamioza Ch1 Azaria',
//     images: [
//       {
//         url: '/azstore_cap2.png', // URL of the image for Open Graph
//         alt: 'Kamioza Chapter 1: Azaria',
//       },
//     ],
//     locale: 'en_US', // Language of the page
//     type: 'website', // Type of the page (e.g., website, article)
//   },robots: {
//     index: true,
//     follow: true, //
//     nocache: true, 
//     googleBot: {
//       index: true,
//       follow: true,
//       noimageindex: true, // This tells Google not to index images on the page
//       // Additional Googlebot directives
//       'noarchive': false, // Prevents Google from caching the page
//       'nosnippet': false, // Allows Google to show a snippet of the page in search results
//       // This tells Google not to show a cached version of the page in search results
//       'max-video-preview': -1, // This tells Google to allow video previews in search results
//       // This tells Google to allow a large image preview in search results 
//       'max-image-preview': 'large',
//       'max-snippet': -1, 
//     },
//   }}
            







  
export default function Home({
  //these are the props from getServerSideProps
  user, userid, isAuthenticated, stripeid, credits
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
 return (
<section className="Hero relative h-screen w-screen bg-[#000000] bg-opacity-100">
<div>
  <Head>
    <meta property="og:title" content="Kamioza Ch1 Azaria" />
    <meta property="og:image" content="/opengraph_image.png" />
    <meta property="og:type" content="website" />
    <meta name="keywords" content="multiplayer, adventure games, mobile game, co-op game, meflin, azaria, kamioza, multi-player games, detomata"></meta>
    <meta
      property="og:description"
      content="Kamioza is a unique multi-player adventure game that can support loads of playersDiscover lost treasure, restore ancient artifacts and unravel forgotten mysteries in this unique First Person multiplayer adventure. A retro game with co-op puzzle solving, micro competitions and resource management. Create powerful spells to protect and thrive in this beautifully crafted world."
    />
  </Head>
  {/* Rest of your page content */}
</div>
  <KamNavBar currentPage = "/"></KamNavBar>
  
  <PlayerAuthCheck user = {user} userid = {userid} isAuthenticated = {isAuthenticated} stripeid = {stripeid} credits = {credits}></PlayerAuthCheck>


     


<Flex flexDirection={{base: 'column', md: 'column', lg:'row'  }}>
  <Center flex='2'  bg={useColorModeValue('gray.300', 'black')}>
      <div className="h-full">
      <Text  mt={8} ml={10} fontSize={['12px','16px','24px']} fontWeight='bold' color={useColorModeValue('gray.800', 'gray.300')}>CHAPTER 1:</Text>
       <ImageTrain></ImageTrain>
      </div>
  </Center>

  <Center flex='1' flexDirection={'column'}  bg={useColorModeValue('gray.300', 'black')}>
      <Center p={4} m={[0,0,8]} h={['100','200','380']} bgImage={{base: '', md: '', lg: '', xl:"url('https://azariaimages.s3.amazonaws.com/frame1.png')" }}
              bgPosition="center"
              bgRepeat="no-repeat"
              backgroundSize="contain"
              >
                <Center flexDirection={'column'}>
                 <Text  m={8} fontSize={['12px','16px','20px']} color={useColorModeValue('gray.800', 'gray.300')}>
                  Come discover lost treasure, restore ancient artifacts and 
                  unravel mysteries long forgotten. Enter the beautifully bizzare world of Azaria
                  and claim your destiny.</Text>
                  {/*<SubscribeForm></SubscribeForm>  */}
                  <Button colorScheme='yellow' onClick={() => {window.location.href = 'https://store.steampowered.com/app/3522380/Kamioza_Ch1_Azaria/'}}>Wishlist Us on Steam!</Button>
                </Center>
      </Center>
      

      <Center p={4} m={[0,0,8]} h={['100','200','380']} bgImage={{base: '', md: '', lg:'', xl:"url('https://azariaimages.s3.amazonaws.com/frame1.png')" }}
              bgPosition="center"
              bgRepeat="no-repeat"
              backgroundSize="contain"
              >
                 
                 
                 <Text  m={8} fontSize={['12px','16px','20px']} color={useColorModeValue('gray.800', 'gray.300')}>
                  Recently remastered from its 1997 designs, 
                  Azaria brings a simple originality to adventure gaming. It is approachable, mysterious and consuming.</Text>
      </Center>
  </Center>
  </Flex>

  <Box   bg={useColorModeValue('gray.300', 'black')} h={['150','300','800']}>
   <Flex flexDirection={{base: 'column', md: 'column', lg:'row'  }}>
                  <UnorderedList fontSize={['12px','16px','24px']} color={useColorModeValue('gray.800', 'gray.300')} p={[0,0,14]}>
                  <Text fontSize={['12px','16px','24px']} fontWeight={'bold'} color={useColorModeValue('gray.800', 'gray.300')}>Gameplay:</Text>
                    <ListItem>Unique First Person massively multi-player adventure - Supports dozens of players in a game instance</ListItem>
                    <ListItem>Collaborative puzzle solving and micro competition</ListItem>
                    <ListItem>Resource Management of both natural resources and currency</ListItem>
                    <ListItem>Spell and item creation system - Drop evil spells and bombs on your friends</ListItem>
                  </UnorderedList>
   </Flex>
      
    
    <Flex my={20} flexDirection={{base: 'column', md: 'column', lg:'row'  }}>
        <Center mb={20} py={2} flexDirection={'row'}>
          <Image src={'https://azariaimages.s3.amazonaws.com/strip.png'}></Image>
        </Center>
      </Flex>  
  </Box>

 
  <Footer></Footer>




  
</section>
  )
}

