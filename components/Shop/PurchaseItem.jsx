import {
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Stack, 
  Text
} from '@chakra-ui/react'
import { signPurchase, getBrowserPublicKey } from '@/lib/crypto-client'
import { SET_PLAYER } from '@/services/reducers/playerSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useSession } from "next-auth/react"
import React, { useState, useEffect } from 'react'

export default function PurchaseButton(props) {
  const dispatch = useDispatch()
  const player = useSelector((state) => state.player)
  const [productState, setProductState] = useState(props)

  const { data: session, status, update } = useSession()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef()
 
  useEffect(() => {
    setProductState(props)
  }, [props])

  async function buy() {
    console.log(props)
    
    if (!props.authenticated) {
      alert('Please log in to make purchases')
      return
    }

    const activeCredits = session.credits

    // Check balance
    if (activeCredits < props.price) {
      alert('Insufficient credits. You need ' + props.price + ' but have ' + activeCredits)
      return
    }

    try {
      // Generate purchase ID
      const purchaseId = `purch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Prepare purchase data for signing
      const purchaseData = {
        accountId: session.accountId,
        itemId: props.product,
        cost: parseInt(props.price), // Ensure it's a number
        timestamp: Date.now(),
        purchaseId
      }
      
      console.log('📝 Preparing purchase:', purchaseData)
      
      // Sign the purchase with browser's private key
      const signature = await signPurchase(purchaseData)
      const browserPublicKey = await getBrowserPublicKey()
      
      console.log('✍️ Purchase signed:', {
        purchaseId,
        signature: signature.substring(0, 20) + '...',
        signedBy: browserPublicKey.substring(0, 20) + '...'
      })
      
      // Create complete purchase record
      const purchase = {
        purchaseId,
        itemId: props.product,
        quantity: 1,
        cost: parseInt(props.price),
        purchasedAt: purchaseData.timestamp,
        
        // CRYPTO FIELDS
        signature,
        deviceAddress: browserPublicKey,
        
        // Claiming fields
        claimed: false,
        claimedByDevice: null,
        claimedAt: null
      }
      
      // Calculate new balance
      const newBalance = activeCredits - parseInt(props.price)
      
      console.log('💾 Saving to database...')
      
      // Call API to save purchase and update balance
      const response = await fetch('/api/purchases/objectsPurchased', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchase,
          newBalance
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Purchase failed')
      }

      console.log('✅ Database updated successfully!')
      
      // Update Redux state
      dispatch(SET_PLAYER({
        ...player,
        credits: newBalance,
        pendingPurchases: [...(player.pendingPurchases || []), purchase]
      }))
      
      // Update session credits
      await update({
        ...session,
        credits: newBalance
      })
      
      console.log('✅ Purchase complete and signed!')
      
      // Show success message
      alert('Purchase successful! Item will be available in your game.')
      
      // Close dialog
      onClose()
      
    } catch (error) {
      console.error('❌ Purchase failed:', error)
      alert('Purchase failed: ' + error.message)
    }
  }
   
  return (
    <>
      <Button onClick={onOpen} variant='solid' colorScheme='blue'>
        Purchase
      </Button>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Complete Purchase
            </AlertDialogHeader>

            <AlertDialogBody>
              <Stack>
                <Text>Item Purchase: {props.product}</Text>
                <Text>Price: {props.price} credits</Text>
                <Text>Your Balance: {session?.credits || 0} credits</Text>
                <Text>Balance After: {(session?.credits || 0) - parseInt(props.price)} credits</Text>
              </Stack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme='green' 
                onClick={buy} 
                ml={3}
                isDisabled={!props.authenticated || (session?.credits || 0) < parseInt(props.price)}
              >
                Buy
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}