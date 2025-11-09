
import * as React from 'react'
import Link from 'next/link'
import {
  Text,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Box,
  Container,
  Wrap,
  WrapItem,
  Center,
  VStack,
  Avatar,
  Input,
  Button,
  Heading,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { useDisclosure } from '@chakra-ui/react';
import PlayerAuth from '@/./components/Player/PlayerAuth'

interface Props {
  currentPage: string
}


export default function KamNavBar(props: Props) {
 
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  const [value, setValue] = React.useState('');

  let currentPage = props.currentPage;

  function pageSelected(){
    switch(currentPage) {
      case "/":
        return(
          <div className="flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5">
            <Button mx={4} onClick={toggleColorMode}>
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>
          <Link className="font-medium text-blue-500 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" href="" aria-current="page">Home</Link>
          <Link className="font-medium text-gray-400 hover:text-gray-200" href="Privacy">Privacy</Link>
          <Link className="font-medium text-gray-400 hover:text-gray-200" href="Lobby">Lobby</Link>
           <Link className="font-medium text-gray-400 hover:text-gray-200" href="Apothecary">Market</Link> 
          <Link className="font-medium text-gray-400 hover:text-gray-200" href="https://www.kamiozablog.com/">Blog</Link>
          <PlayerAuth></PlayerAuth>
        </div>
        )

        case "Privacy":
        return(
          <div className="flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5">
            <Button mx={4} onClick={toggleColorMode}>
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>
          <Link className="font-medium text-gray-400 hover:text-gray-200 " href="/">Home</Link>
          <Link className="font-medium text-blue-500 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" href="" aria-current="page">Privacy</Link>
          <Link className="font-medium text-gray-400 hover:text-gray-200" href="Lobby">Lobby</Link>
          <Link className="font-medium text-gray-400 hover:text-gray-200" href="Apothecary">Market</Link> 
          <Link className="font-medium text-gray-400 hover:text-gray-200" href="https://www.kamiozablog.com/">Blog</Link>
          <PlayerAuth></PlayerAuth>
        </div>
        )
    
      case "Lobby":
        return(
          <div className="flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5">
            <Button mx={4} onClick={toggleColorMode}>
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>
          <Link className="font-medium text-gray-400 hover:text-gray-200 " href="/">Home</Link>
          <Link className="font-medium text-gray-400 hover:text-gray-200" href="Privacy">Privacy</Link>
          <Link className="font-medium text-blue-500" href="" aria-current="page">Lobby</Link>
          <Link className="font-medium text-gray-400 hover:text-gray-200" href="Apothecary">Market</Link> 
          <Link className="font-medium text-gray-400 hover:text-gray-200" href="https://www.kamiozablog.com/">Blog</Link>
          <PlayerAuth></PlayerAuth>
        </div>
        )

      case "Apothecary":
        return(
          <div className="flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5">
            <Button mx={4} onClick={toggleColorMode}>
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>
          <Link className="font-medium text-gray-400 hover:text-gray-200" href="/">Home</Link>
          <Link className="font-medium text-gray-400 hover:text-gray-200" href="Privacy">Privacy</Link>
          <Link className="font-medium text-gray-400 hover:text-gray-200" href="Lobby">Lobby</Link>
          <Link className="font-medium text-blue-500 " href="" aria-current="page">Market</Link> 
          <Link className="font-medium text-gray-400 hover:text-gray-200" href="https://www.kamiozablog.com/">Blog</Link>
          <PlayerAuth></PlayerAuth>
        </div>
        )
     
      default:
        return(
          <div className="flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5">
         <Button mx={4} onClick={toggleColorMode}>
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>
          <Link className="font-medium text-gray-400 hover:text-gray-200" href="Privacy">Privacy</Link>
          <Link className="font-medium text-gray-400 hover:text-gray-200" href="Lobby">Lobby</Link>
          <Link className="font-medium text-gray-400 hover:text-gray-200" href="Apothecary">Market</Link>
          <Link className="font-medium text-gray-400 hover:text-gray-200" href="https://www.kamiozablog.com/">Blog</Link>
          <PlayerAuth></PlayerAuth>
        </div>
        )
    }
    
  }
  const { colorMode, toggleColorMode } = useColorMode()
    return (
      <Box bg={useColorModeValue('gray.900', 'gray.900')} p={4}>
        <nav className="max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between" aria-label="Global">
          <div className="flex items-center justify-between">
            <Link className="inline-flex items-center gap-x-2 text-xl font-semibold dark:text-white" href="#">
              <img className="w-40 h-auto" src="https://azariaimages.s3.amazonaws.com/KamiozaLogo.png" alt="Logo"/> 
            </Link>
            
            <div className="sm:hidden">
              <button type="button"  onClick={onOpen} className="hs-collapse-toggle p-2 inline-flex justify-center items-center gap-x-2 rounded-lg border border-gray-200 bg-white text-gray-100 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-transparent dark:border-gray-700 dark:text-white dark:hover:bg-white/10 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" data-hs-collapse="#navbar-image-and-text-2" aria-controls="navbar-image-and-text-2" aria-label="Toggle navigation">
                <svg className="hs-collapse-open:hidden flex-shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
                <svg className="hs-collapse-open:block hidden flex-shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
          </div>

          <Drawer
            size={'xs'}
            isOpen={isOpen}
            colorScheme={'gray'}
            placement='left'
            onClose={onClose}
           // finalFocusRef={btnRef}
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader></DrawerHeader>
              <DrawerBody color={'gray'}>
              <VStack
                    spacing={4}
                    align='stretch'
                    color={'gray'}
                >
                  {pageSelected()}  
                </VStack>   
                </DrawerBody>
              <DrawerFooter>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>





          <div id="navbar-image-and-text-2" className="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow sm:block">
           {pageSelected()}
          </div>
        </nav>
      </Box>
   
     )
   }
   
