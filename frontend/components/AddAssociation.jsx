'use client'

import { useState } from "react"
import { Heading, Flex, Button, Input, useToast } from "@chakra-ui/react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractProjectsFarmAddress, contractProjectsFarmAbi } from "@/constants"

const AddAssociation = ({ refetch, getEvents }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedName, setaddedName] = useState('');
    const [addedRNA, setaddedRNA] = useState('');
    const [addedAddr, setaddedAddr] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setaddedName('');
                setaddedRNA('');
                setaddedAddr('');
                refetch();
                getEvents();
                toast({
                    title: "L'association a bien été ajoutée",
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

    const AddAssociation = async() => {
        writeContract({
            address: contractProjectsFarmAddress,
            abi: contractProjectsFarmAbi,
            functionName: 'addAssociation',
            args: [addedName, Number(addedRNA), addedAddr],
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
                Add an association
            </Heading>
            <Flex
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                mt="1rem"
            >
                <Input placeholder='Name' value={addedName} onChange={(e) => setaddedName(e.target.value)} />
                <Input placeholder='RNA' value={addedRNA} onChange={(e) => setaddedRNA(e.target.value)} />
                <Input placeholder='Address' value={addedAddr} onChange={(e) => setaddedAddr(e.target.value)} />
                <Button colorScheme='purple' onClick={AddAssociation}>{isPending ? 'Adding addr' : 'Add'} </Button>
            </Flex>
        </>
  )
}

export default AddAssociation