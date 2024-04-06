'use client'

import { useState } from "react"
import { Heading, Flex, Button, Input, useToast } from "@chakra-ui/react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractStakingAddress, contractStakingAbi } from "@/constants"

const GetRewardsAndSupportProject = ({ refetch, getEvents }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedAddrProject, setaddedAddrProject] = useState('');
    const [addedAddrChainlink, setaddedAddrChainlink] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setaddedAddrProject('');
                setaddedAddrChainlink('');
                refetch();
                getEvents();
                toast({
                    title: "Get Rewards And Support",
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

    const GetRewardsAndSupport = async() => {
        writeContract({
            address: contractStakingAddress,
            abi: contractStakingAbi,
            functionName: 'getRewardAndSupportProject',
            args: [addedAddrChainlink, addedAddrChainlink],
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
                Get Rewards And Support Project
            </Heading>
            <Flex
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                mt="1rem"
            >
                <Input placeholder='Address PROJET AGRICOLE' value={addedAddrProject} onChange={(e) => setaddedAddrProject(e.target.value)} />
                <Input placeholder='Address CHAINLINK' value={addedAddrChainlink} onChange={(e) => setaddedAddrChainlink(e.target.value)} />
                <Button colorScheme='purple' onClick={GetRewardsAndSupport}>{isPending ? 'is ..' : 'GetAndSupport'} </Button>
            </Flex>
        </>
  )
}

export default GetRewardsAndSupportProject