import { useState, useEffect } from "react"

import AddAssociation from "./AddAssociation"
import AddProjetAgricole from "./AddProjetAgricole"
import DeleteAssociation from "./DeleteAssociation"
import DeleteProjetAgricole from "./DeleteProjetAgricole"
import AddToken from "./AddToken"
import StakeUSDC from "./StakeUSDC"
import StakeOtherToken from "./StakeOtherToken"
import WithdrawUSDC from "./WithdrawUSDC"
import WithdrawOtherToken from "./WithdrawOtherToken"
import CalculateRewards from "./CalculateRewards"
import GetRewardsAndSupportProject from "./GetRewardsAndSupportProject"

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi'
import { contractProjectsFarmAddress, contractProjectsFarmAbi } from '@/constants'

import {
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from '@chakra-ui/react'

import { publicClient } from '../utils/client'

import { parseAbiItem } from 'viem'


const C2P = () => {

    const { address } = useAccount();
    const [events, setEvents] = useState([]);

    const { data: addressOfAssociation, error, isPending, refetch } = useReadContract({
      address: contractProjectsFarmAddress,
      abi: contractProjectsFarmAbi,
      functionName: 'getAssociation',
      account: address
  })

    return (
        <>
        <AddAssociation refetch={refetch} />
        <AddProjetAgricole refetch={refetch} />
        <DeleteAssociation refetch={refetch} />
        <DeleteProjetAgricole refetch={refetch} />
        <AddToken refetch={refetch} />
        <StakeUSDC refetch={refetch} />
        <StakeOtherToken refetch={refetch} />
        <WithdrawUSDC refetch={refetch} />
        <WithdrawOtherToken refetch={refetch} />
        <CalculateRewards refetch={refetch} />
        <GetRewardsAndSupportProject refetch={refetch} />
        </>
    )
}

export default C2P