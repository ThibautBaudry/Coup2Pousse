"use client"
import { Flex, Text } from '@chakra-ui/react'

const Footer = () => {
  return (
    <Flex
        p="2rem"
        justifyContent="center"
        alignItems="center"
    >
        <Text>Thibaut BAUDRY &copy; Alyra {new Date().getFullYear()}</Text>
    </Flex>
  )
}

export default Footer