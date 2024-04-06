'use client'

import { useState } from "react"
import { Heading, Flex, Button, Input, useToast } from "@chakra-ui/react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractStakingAddress, contractStakingAbi } from "@/constants"

const AddToken = ({ refetch }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedName, setaddedName] = useState('');
    const [addedAddr, setaddedAddr] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setaddedName('');
                setaddedAddr('');
                refetch();
                toast({
                    title: "Le token a bien été ajouté",
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

    const AddToken = async() => {
        writeContract({
            address: contractStakingAddress,
            abi: contractStakingAbi,
            functionName: 'addToken',
            args: [addedName, addedAddr],
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
                Add a token
            </Heading>
            <Flex
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                mt="1rem"
            >
                <Input placeholder='Name' value={addedName} onChange={(e) => setaddedName(e.target.value)} />
                <Input placeholder='Address' value={addedAddr} onChange={(e) => setaddedAddr(e.target.value)} />
                <Button colorScheme='purple' onClick={AddToken}>{isPending ? 'Adding addr' : 'Add'} </Button>
            </Flex>
        </>
  )
}

export default AddToken