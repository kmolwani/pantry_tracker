'use client'
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, TextField, Typography, Snackbar } from "@mui/material";
import { collection, getDoc, getDocs, query, setDoc, deleteDoc, doc } from "firebase/firestore";

export default function Home() {
  // variable to store inventory
  const [inventory, setInventory] = useState([]);
  // state variable to add and remove stuff
  const [open, setOpen] = useState(false);
  const [openMessage, setOpenMessage] = useState(false);
  // set item names
  const [itemName, setItemName] = useState('');
  const [message, setMessage] = useState('');

  // fetch inventory from firebase; async becasue we don;t want firebase block out code when being fetched. 
  // This prevents website freezing
  const updateInventory = async () => {
    // get a snapshot of the inventory via a query to firebase
    const snapshot = query(collection(firestore, 'inventory'))
    // gets the subcollection
    const docs = await getDocs(snapshot)
    
    const inventoryList = []
    docs.forEach(doc => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(), // this is the count of the inventory
      })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item) // this gets the item reference
    const docSnap = await getDoc(docRef)

    // if the item already exists, we add 1 to it. If it doesn't exist, we add it to be 1
    if (docSnap.exists()) {
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1})
    } else {
      await setDoc(docRef, {quantity: 1})
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item) // this gets the item reference
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const {quantity} = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }
    await updateInventory()
  }

  const handleOpen = () => setOpen(true)
  const handleOpenMessage = async () => {
    if (itemName) {
      setMessage(itemName + ' Added ... ');
    } else {
      setMessage('');
    }
    setOpenMessage(true)
  }
  const handleClose = () => setOpen(false)
  const handleCloseMessage = () => setOpenMessage(false)

  useEffect(() => {
    updateInventory()
  }, []) // dependency list array empty because we only want this to execute once when page is loaded

  // adding focus to the textfield input area so the user doesn't have to manually click on it to enter text
  const textFieldRef = useRef(null);
  useEffect(() => {
    if (open) {
        const timer = setTimeout(() => {
            if (textFieldRef.current) {
                textFieldRef.current.focus();
            }
        }, 100); // Delay to ensure modal is fully rendered
        return () => clearTimeout(timer);
    }
  }, [open]);

  // adding functionality so the user can press enter and have the item added instead of clicking on the Add button
  const addButtonRef = useRef(null);
  const handleKeyDown = (event) => {
    const timer = setTimeout(() => {
      if (event.key === 'Enter') {
        addButtonRef.current.click();
      }
    }, 100); // Delay to ensure modal is fully rendered
    return () => clearTimeout(timer);
  };

  return (
    <Box 
      width="100vw"
      height='100vh'
      display="flex"
      justifyContent='center'
      alignItems='center'
      flexDirection='column'
      gap={2}
      bgcolor='#786'
      sx={{
        flexDirection:{xs: 'column', md: 'column'}
      }}
    >
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)"
          }}
        >
          <Typography variant="h6" textAlign='center'>Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              inputRef={textFieldRef}
              onKeyDown={handleKeyDown}
              focused="true"
              placeholder="Add Item"
              value={itemName}
              // this allows to type in the text field
              onChange={(e) => {
                setItemName(e.target.value)
              }}
            >
            </TextField>
            <Button variant="outlined" ref={addButtonRef} onClick={() => {
              if (itemName.length != 0 && isNaN(itemName)){
                addItem(itemName)
                setItemName('')
                handleClose()
                handleOpenMessage()
              } else {
                setItemName('')
                handleClose()
              }
            }}>Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant='contained' onClick={() =>{
        handleOpen()
      }}> Add New Item</Button>
      <Box 
        border='1px solid #333' 
        bgcolor='white'
        sx={{
          transform: "translate(0%, 0%)", 
          width: {xs: '100%', sm: '80%'}
        }}
      >
        <Box 
          width='100%' 
          height='100px' 
          bgcolor='#ADD8E6'
          alignItems='center' 
          justifyContent='center' 
          display='flex'
          sx={{
            flexDirection:'column'
          }}
        >
          <Typography variant='h2' color='#333'>Pantry Items</Typography>
        </Box>
        <Stack 
          width='100%' 
          height='300px' 
          spacing={2} 
          overflow='auto'
          display='auto'
          sx={{
            flexDirection:'column'
          }}
        >
          {inventory.map(({name, quantity}) => (
            <Box 
              key={name} 
              width='100%' 
              minHeight='50px' 
              display='flex' 
              alignItems='center' 
              justifyContent='space-between'
              bgColor='#f0f0f0' 
              padding={2}
            >
              <Typography variant="h5" color='#333' textAlign='center'>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Typography variant="h5" color='#333' textAlign='center'>
                  {quantity}
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    addItem(name)
                  }}
                >
                  Add
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    removeItem(name)
                  }}
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
        {/* Added temporary label show up on screen confirming add the item */}
        <Snackbar
          ref={addButtonRef}
          open={openMessage}
          autoHideDuration={2000}
          onClose={handleCloseMessage}
          message={message}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          ContentProps={{
            sx: { display: 'block', textAlign: 'center' }
          }}
        />
      </Box>
    </Box>
  );
}
