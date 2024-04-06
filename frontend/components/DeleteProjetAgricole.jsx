'use client'

import { useState } from "react"
import { Heading, Flex, Button, Input, useToast } from "@chakra-ui/react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractProjectsFarmAddress, contractProjectsFarmAbi } from "@/constants"

const DeleteProjetAgricole = ({ refetch }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedDescription, setaddedDescription] = useState('');
    const [addedAddr, setaddedAddr] = useState('');
    const [addedAssociationAddr, setaddedAssociationAddr] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setaddedDescription('');
                setaddedAddr('');
                setaddedAssociationAddr('');
                refetch();
                toast({
                    title: "Le projet agricole a bien été supprimé",
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

    const DeleteProjetAgricole = async() => {
        writeContract({
            address: contractProjectsFarmAddress,
            abi: contractProjectsFarmAbi,
            functionName: 'deleteProjectAgriculteur',
            args: [addedDescription, addedAddr, addedAssociationAddr],
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
                Delete a project
            </Heading>
            <Flex
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                mt="1rem"
            >
                <Input placeholder='Description' value={addedDescription} onChange={(e) => setaddedDescription(e.target.value)} />
                <Input placeholder='Address' value={addedAddr} onChange={(e) => setaddedAddr(e.target.value)} />
                <Input placeholder='Address' value={addedAssociationAddr} onChange={(e) => setaddedAssociationAddr(e.target.value)} />
                <Button colorScheme='purple' onClick={DeleteProjetAgricole}>{isPending ? 'Deleting' : 'Delete'} </Button>
            </Flex>
        </>
  )
}

export default DeleteProjetAgricole