
import * as React from 'react'
import { Text, Image, Heading, ButtonGroup, Card, CardBody, CardFooter, Divider, Stack, Box, SimpleGrid} from '@chakra-ui/react';
import PurchaseButton from '@/components/Shop/PurchaseItem';


export default async function ItemList (props) {
 
  var items;
  try {
          const response = await fetch(process.env.NEXT_PUBLIC_URL +'/api/purchases/objectsAvailable');
           items = await response.json();
         if (response.status == 200){
          console.log('these items are available',items);
        } 
        } catch (error) {
            console.log('error happened Getting available Objects!....',error)       
        }


const renderItems = () => {

    user = props.user
    var myarray = new Array()
    myarray = items;

    return myarray.map(({name, desc, image, price, user}) => {
      return <Card key={name} bg={'#dbd2d2'} color={'teal'} maxW='sm'>
      <CardBody>
        <Image
          src={image}
          alt={name}
          borderRadius='lg'
        />
        <Stack mt='6' spacing='3'>
          <Heading size='md'>{name}</Heading>
          <Text>
           {desc}
          </Text>
          <Text color='blue.600' fontSize='2xl'>
           {price} Coins
          </Text>
        </Stack>
      </CardBody>
      <Divider />
      <CardFooter>
        <ButtonGroup spacing='2'>
          <PurchaseButton myuser = {user} product = {name} price = {price} authenticated = {isAuthenticated} ></PurchaseButton>
        </ButtonGroup>
      </CardFooter>
    </Card>
    })
  }
  

  return (
    <Box>
        <SimpleGrid m={50} columns={{ sm: 1, md: 2, lg: 3 }} spacing={5} templateColumns='repeat(auto-fill, minmax(220px, 1fr))'>
            {/* <renderItems user = {props.user} isAuthenticated={props.isAuthenticated}/> */}
            {renderItems}

        </SimpleGrid>  
    </Box>
   
     )



}