import { ChakraProvider } from '@chakra-ui/react'
import React from 'react'
import Home from './pages/Home'

function App({
  children
}) {
  return (
    <ChakraProvider>
      {children}
    </ChakraProvider>
  )
}


export default <App>
  <Home />  
</App>