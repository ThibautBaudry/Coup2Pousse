import { Heading, Flex, Text, Badge, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Alert, AlertIcon } from "@chakra-ui/react"

import { formatEther } from "viem"

const Events = ({ events }) => {
  return (
    <>
        <Heading as='h2' size='xl' mt="2rem" mb='1rem'>
            Events
        </Heading>
        {events.length > 0 ? (
            <TableContainer>
                <Table variant='simple'>
                    <Thead>
                        <Tr>
                            <Th>Event name</Th>
                            <Th>Association Address</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                    {events.map((event) => {
                    return (
                        <Tr key={crypto.randomUUID()}>
                            <Td>{event.type === 'AssociationRegistered' ? <Badge colorScheme='green'>Association registered</Badge> : <Badge colorScheme='red'>Projet Agricole registered</Badge>}</Td>
                            <Td>{event.address}</Td>
                        </Tr>
                        )
                    })}
                    </Tbody>
                </Table>
            </TableContainer>
        ) : (
            <Alert status='info'>
                <AlertIcon />
                No events.
            </Alert>
        )}
    </>
  )
}

export default Events