"use client"
import { Flex, Text } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const Header = () => {
  return (
    <Flex
        justifyContent="space-between"
        alignItems="center"
        p="2rem"
    >
        <Text>C2P</Text>
        <ConnectButton showBalance={false} />
    </Flex>
  )
}

export default Header