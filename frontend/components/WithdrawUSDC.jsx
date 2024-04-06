'use client'

import { useState } from "react"
import { Heading, Flex, Button, Input, useToast } from "@chakra-ui/react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractStakingAddress, contractStakingAbi } from "@/constants"

const WithdrawUSDC = ({ refetch }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedAmount, setaddedAmount] = useState('');
    const [addedAddrUSDC, setaddedAddrUSDC] = useState('');
    const [addedStakingIndex, setaddedStakingIndex] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setaddedAmount('');
                setaddedAddrUSDC('');
                setaddedStakingIndex('');
                refetch();
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

    const WithdrawUSDC = async() => {
        writeContract({
            address: contractStakingAddress,
            abi: contractStakingAbi,
            functionName: 'withdrawUSDC',
            args: [Number(addedAmount), addedAddrUSDC, Number(addedStakingIndex)],
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
                Withdraw USDC
            </Heading>
            <Flex
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                mt="1rem"
            >
                <Input placeholder='Amount' value={addedAmount} onChange={(e) => setaddedAmount(e.target.value)} />
                <Input placeholder='Address USDC' value={addedAddrUSDC} onChange={(e) => setaddedAddrUSDC(e.target.value)} />
                <Input placeholder='Index Stake' value={addedStakingIndex} onChange={(e) => setaddedStakingIndex(e.target.value)} />
                <Button colorScheme='purple' onClick={WithdrawUSDC}>{isPending ? 'is ..' : 'Withdraw'} </Button>
            </Flex>
        </>
  )
}

export default WithdrawUSDC