import { useState, useEffect } from "react"

import AddAssociation from "./AddAssociation"
import AddProjetAgricole from "./AddProjetAgricole"
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

    const getEvents = async() => {
        const associationRegisteredEvents = await publicClient.getLogs({
            address: contractProjectsFarmAddress,
            event: parseAbiItem('event AssociationRegistered (string associationName, address associationAddress)'),
            fromBlock: 5512413n,
            toBlock: 'latest'
        })

        const projetAgricoleRegisteredEvents = await publicClient.getLogs({
            address: contractProjectsFarmAddress,
            event: parseAbiItem('event ProjetAgricoleRegistered (string projectDescription, address agriculteurAddress)'),
            fromBlock: 5512413n,
            toBlock: 'latest'
        })

        const combinedEvents = associationRegisteredEvents.map((event) => ({
            type: 'AssociationRegistered',
            name: event.args.associationName,
            address: event.args.associationAddress,
            blockNumber: Number(event.blockNumber)
        })).concat(projetAgricoleRegisteredEvents.map((event) => ({
            type: 'ProjetAgricoleRegistered',
            description: event.args.projectDescription,
            address: event.args.agriculteurAddress,
            blockNumber: Number(event.blockNumber)
        })))

        combinedEvents.sort(function (a, b) {
            return b.blockNumber - a.blockNumber;
        });

        setEvents(combinedEvents)
    }

    useEffect(() => {
        const getAllEvents = async() => {
            if(address !== 'undefined') {
                await getEvents();
            }
        }
        getAllEvents()
    }, [address])

    return (
        <>
        <AddAssociation refetch={refetch} getEvents={getEvents} />
        <AddProjetAgricole refetch={refetch} getEvents={getEvents} />
        <StakeUSDC refetch={refetch} getEvents={getEvents} />
        <StakeOtherToken refetch={refetch} getEvents={getEvents} />
        <WithdrawUSDC refetch={refetch} getEvents={getEvents} />
        <WithdrawOtherToken refetch={refetch} getEvents={getEvents} />
        <CalculateRewards refetch={refetch} getEvents={getEvents} />
        <GetRewardsAndSupportProject refetch={refetch} getEvents={getEvents} />
        </>
    )
}

export default C2P