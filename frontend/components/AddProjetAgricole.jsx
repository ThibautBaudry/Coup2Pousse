'use client'

import { useState } from "react"
import { Heading, Flex, Button, Input, useToast } from "@chakra-ui/react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractProjectsFarmAddress, contractProjectsFarmAbi } from "@/constants"

const AddProjetAgricole = ({ refetch }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedProjectDescription, setaddedProjectDescription] = useState('');
    const [addedSIRET, setaddedSIRET] = useState('');
    const [addedProjectAgriculteurAddr, setaddedProjectAgriculteurAddr] = useState('');
    const [addedAssociationAddr, setaddedAssociationAddr] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setaddedProjectDescription('');
                setaddedSIRET('');
                setaddedProjectAgriculteurAddr('');
                setaddedAssociationAddr('');
                refetch();
                toast({
                    title: "Le projet agricole a bien été ajouté",
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

    const AddProjetAgricole = async() => {
        writeContract({
            address: contractProjectsFarmAddress,
            abi: contractProjectsFarmAbi,
            functionName: 'addProjectAgriculteur',
            args: [addedProjectDescription, Number(addedSIRET), addedProjectAgriculteurAddr, addedAssociationAddr],
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
                Add a project Agricole
            </Heading>
            <Flex
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                mt="1rem"
            >
                <Input placeholder='Description' value={addedProjectDescription} onChange={(e) => setaddedProjectDescription(e.target.value)} />
                <Input placeholder='SIRET' value={addedSIRET} onChange={(e) => setaddedSIRET(e.target.value)} />
                <Input placeholder='Address Project' value={addedProjectAgriculteurAddr} onChange={(e) => setaddedProjectAgriculteurAddr(e.target.value)} />
                <Input placeholder='Address Association' value={addedAssociationAddr} onChange={(e) => setaddedAssociationAddr(e.target.value)} />
                <Button colorScheme='purple' onClick={AddProjetAgricole}>{isPending ? 'Adding addr' : 'Add'} </Button>
            </Flex>
        </>
  )
}

export default AddProjetAgricole