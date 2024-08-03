'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { collection, getDoc, getDocs, query, setDoc, deleteDoc, doc } from "firebase/firestore";

export default function Home() {
  // variable to store inventory
  const [inventory, setInventory] = useState([]);
  // state variable to add and remove stuff
  const [open, setOpen] = useState(false);
  // set item names
  const [itemName, setItemName] = useState('');

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
  const handleClose = () => setOpen(false)

  useEffect(() => {
    updateInventory()
  }, []) // dependency list array empty because we only want this to execute once when page is loaded

  const [results, setResults] = useState([]);

  const handleSearch = async (query) => {
    // Replace with your search logic
    const response = await fetch(`/api/search?q=${query}`);
    const data = await response.json();
    setResults(data);
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
              focused="true"
              value={itemName}
              // this allows to type in the text field
              onChange={(e) => {
                setItemName(e.target.value)
              }}
            ></TextField>
            <Button variant="outlined" onClick={() => {
              if (itemName != 0){
                addItem(itemName)
                setItemName('')
                handleClose()
              } else {
                handleClose()
              }
            }}>Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant='contained' onClick={() =>{
        handleOpen()
      }}> Add New Item</Button>
      <Box border='1px solid #333'>
        <Box 
          width='800px' 
          height='100px' 
          bgcolor='#ADD8E6'
          alignItems='center' 
          justifyContent='center' 
          display='flex'
        >
          <Typography variant='h2' color='#333'>Pantry Items</Typography>
        </Box>
        <Stack width='800px' height='300px' spacing={2} overflow='auto'>
          {inventory.map(({name, quantity}) => (
            <Box 
              key={name} 
              width='100%' 
              minHeight='50px' 
              display='flex' 
              alignItems='center' 
              justifyContent='space-between'
              bgColor='#f0f0f0' 
              padding={5}
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
      </Box>
    </Box>
  );
}
