'use client'

import { useState } from "react"
import { Heading, Flex, Button, Input, useToast } from "@chakra-ui/react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractStakingAddress, contractStakingAbi } from "@/constants"

const WithdrawOtherToken = ({ refetch, getEvents }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedAmount, setaddedAmount] = useState('');
    const [addedAddrOther, setaddedAddrOther] = useState('');
    const [addedStakingIndex, setaddedStakingIndex] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setaddedAmount('');
                setaddedAddrOther('');
                setaddedStakingIndex('');
                refetch();
                getEvents();
                toast({
                    title: "Le withdraw a bien été effectué",
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

    const WithdrawOtherToken = async() => {
        writeContract({
            address: contractStakingAddress,
            abi: contractStakingAbi,
            functionName: 'withdrawOtherToken',
            args: [Number(addedAmount), addedAddrOther, Number(addedStakingIndex)],
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
                Withdraw Token
            </Heading>
            <Flex
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                mt="1rem"
            >
                <Input placeholder='Amount' value={addedAmount} onChange={(e) => setaddedAmount(e.target.value)} />
                <Input placeholder='Address Token' value={addedAddrOther} onChange={(e) => setaddedAddrOther(e.target.value)} />
                <Input placeholder='Index Stake' value={addedStakingIndex} onChange={(e) => setaddedStakingIndex(e.target.value)} />
                <Button colorScheme='purple' onClick={WithdrawOtherToken}>{isPending ? 'is ..' : 'Withdraw'} </Button>
            </Flex>
        </>
  )
}

export default WithdrawOtherToken