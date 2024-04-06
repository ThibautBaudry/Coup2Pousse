'use client'

import { useState } from "react"
import { Heading, Flex, Button, Input, useToast } from "@chakra-ui/react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractStakingAddress, contractStakingAbi } from "@/constants"

const CalculateRewards = ({ refetch }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedAddrChainlink, setaddedAddrChainlink] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setaddedAddrChainlink('');
                refetch();
                toast({
                    title: "Rewards disponibles",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            },
            onError: (error) => {
                toast({
                    title: error.shortMessage,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            },
        },
    })

    const CalculateRewards = async() => {
        writeContract({
            address: contractStakingAddress,
            abi: contractStakingAbi,
            functionName: 'calculateRewards',
            args: [addedAddrChainlink],
            account: address,
        })
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

    return (
        <>
            <Heading as='h2' size='xl' mt='1rem'>
                Calculate Rewards
            </Heading>
            <Flex
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                mt="1rem"
            >
                <Input placeholder='Address CHAINLINK' value={addedAddrChainlink} onChange={(e) => setaddedAddrChainlink(e.target.value)} />
                <Button colorScheme='purple' onClick={CalculateRewards}>{isPending ? 'is ..' : 'Rewards'} </Button>
            </Flex>
        </>
  )
}

export default CalculateRewards