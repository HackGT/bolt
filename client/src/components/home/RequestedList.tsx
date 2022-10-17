// import React from "react";
// import { Card, Container, Header, Icon, Label, Loader, Message, Step } from "semantic-ui-react";
// import { useQuery } from "@apollo/client";
// import _ from "lodash";

// import {
//   ABANDONED,
//   APPROVED,
//   CANCELLED,
//   DAMAGED,
//   DENIED,
//   FULFILLED,
//   LOST,
//   READY_FOR_PICKUP,
//   RETURNED,
//   SUBMITTED,
// } from "../../types/Hardware";
// import { USER_REQUESTS } from "../../graphql/Queries";
// import { Request } from "../../types/Request";
// import ItemAndQuantity from "../admin/desk/ItemAndQuantity";
// import { User } from "../../types/User";

// interface RequestedListProps {
//   requests: Request[];
// }

// function RequestedList({ requests }: RequestedListProps) {
//   // if (error) {
//   //   return (
//   //     <Message title="Error displaying requests" warning icon>
//   //       <Icon name="warning sign" />
//   //       {error.message}
//   //     </Message>
//   //   );
//   // }

//   let steps = (
//     <Step.Group>
//       <Step>
//         <Step.Content>
//           <Step.Title>Loading steps</Step.Title>
//         </Step.Content>
//       </Step>
//     </Step.Group>
//   );

//   if (requests.length === 0) {
//     return (
//       <Container textAlign="center">
//         <Header>
//           You haven't requested any hardware yet. To request an item, select the quantity and click
//           on the blue Request button.
//         </Header>
//       </Container>
//     );
//   }

//   if (requests.length > 0) {
//     return requests
//       .sort(
//         (a: Request, b: Request) =>
//           a.item.location.name.localeCompare(b.item.location.name) ||
//           a.item.name.localeCompare(b.item.name) ||
//           a.id - b.id
//       )
//       .map((r: Request) => {
//         const returnInfo = r.item.returnRequired &&
//           r.status !== RETURNED &&
//           r.status !== DENIED &&
//           r.status !== CANCELLED &&
//           r.status !== ABANDONED && (
//             <Label size="large" color="yellow" attached="top right">
//               <Icon name="id badge" />
//               Return required
//             </Label>
//           );

//         const returned = r.status === RETURNED && (
//           <Label size="large" color="green" attached="top right">
//             <Icon name="check circle" /> Returned
//           </Label>
//         );

//         const locationInfo = (
//           <Card.Content>
//             <Label attached="bottom">
//               <Icon name="map marker alternate" />
//               Checked out at {r.item.location.name}
//             </Label>
//           </Card.Content>
//         );

//         if (r.status === SUBMITTED || r.status === APPROVED) {
//           steps = (
//             <Label.Group size="large">
//               <Label color={r.status === SUBMITTED ? "blue" : undefined}>Submitted</Label>
//               <Label color={r.status === APPROVED ? "blue" : undefined}>Approved</Label>
//               <Label>Ready for Pickup</Label>
//             </Label.Group>
//           );
//         } else if (r.status === READY_FOR_PICKUP || r.status === FULFILLED) {
//           steps = (
//             <Label.Group size="large">
//               <Label color={r.status === READY_FOR_PICKUP ? "green" : undefined}>
//                 Ready for Pickup
//               </Label>
//               <Label color={r.status === FULFILLED ? "blue" : undefined}>Fulfilled</Label>
//               {r.item.returnRequired && <Label disabled>Returned</Label>}
//             </Label.Group>
//           );
//         } else {
//           steps = (
//             <Label.Group size="large">
//               {(r.status === DENIED || r.status === ABANDONED || r.status === CANCELLED) && (
//                 <Label size="large" color="red" attached="top right">
//                   <Icon name="times circle" />
//                   {r.status === DENIED
//                     ? "Declined"
//                     : r.status.charAt(0).toUpperCase() + r.status.substring(1).toLowerCase()}
//                 </Label>
//               )}
//               {(r.status === LOST || r.status === DAMAGED) && (
//                 <Label size="large" color="orange">
//                   <Icon name="exclamation circle" />
//                   {r.status.charAt(0).toUpperCase() + r.status.substring(1).toLowerCase()}
//                 </Label>
//               )}
//             </Label.Group>
//           );
//         }

//         return (
//           <Card fluid key={r.id}>
//             <Card.Content>
//               <Card.Header>
//                 <ItemAndQuantity quantity={r.quantity} itemName={r.item.name} />
//                 &nbsp;
//                 <span
//                   style={{
//                     color: "gray",
//                     fontSize: 14,
//                     fontWeight: "normal",
//                   }}
//                 >
//                   #{r.id}
//                 </span>
//               </Card.Header>
//               <Card.Description>{steps}</Card.Description>
//               {returnInfo}
//               {returned}
//             </Card.Content>
//             {locationInfo}
//           </Card>
//         );
//       });
//   }
// }

// export default RequestedList;

import { Box, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { MapPinIcon } from "@heroicons/react/24/solid";

import { APPROVED, DENIED, READY_FOR_PICKUP, SUBMITTED } from "../../types/Hardware";
import { Request, RequestStatus } from "../../types/Request";

interface RequestedListProps {
  requests: Request[];
}
const RequestedList = ({ requests }: RequestedListProps) => {
  const [userRequests, setUserRequests] = useState(requests);

  console.log(requests);

  const statuses = (status: RequestStatus): JSX.Element => {
    switch (status) {
      case SUBMITTED:
        return (
          <Box
            borderRadius="8px"
            w="full"
            textAlign="center"
            bgGradient="linear(to-r, purple.500, purple.400)"
            fontWeight="semibold"
            py={1.5}
            color="white"
          >
            Submitted
          </Box>
        );
      case APPROVED:
        return (
          <Box
            w="full"
            textAlign="center"
            bgGradient="linear(to-r, green.200, green.300)"
            fontWeight="semibold"
            borderRadius="8px"
            py={1.5}
            color="white"
          >
            Approved
          </Box>
        );
      case DENIED:
        return (
          <Box
            borderRightRadius="8px"
            w="full"
            textAlign="center"
            borderRadius="8px"
            fontWeight="semibold"
            backgroundColor="red.400"
            py={1.5}
            color="white"
          >
            Denied
          </Box>
        );
      case READY_FOR_PICKUP:
        return (
          <Box
            borderRightRadius="8px"
            w="full"
            textAlign="center"
            borderRadius="8px"
            py={1.5}
            fontWeight="semibold"
            bgGradient="linear(to-r, cyan.400, purple.500)"
            color="white"
          >
            Ready for Pickup
          </Box>
        );
      default:
        return (
          <Box
            borderRightRadius="8px"
            w="full"
            textAlign="center"
            borderRadius="8px"
            backgroundColor="gray.400"
            fontWeight="semibold"
            py={1.5}
            color="white"
          >
            {status.toUpperCase()[0] + status.slice(1).toLowerCase()}
          </Box>
        );
    }
  };

  return (
    <Box w="45%">
      <Heading mb="4">My Requests</Heading>
      <Flex
        borderRadius="4px"
        // borderColor="gray.200"
        // borderStyle="solid"
        // borderWidth="1px"
        // boxShadow="md"
        backgroundColor="gray.200"
        w="full"
        p="4"
        minH="200px"
        gap="4"
        flexDir="column"
      >
        {requests && requests.length > 0 ? (
          requests
            .sort(
              (a: Request, b: Request) =>
                a.item.location.name.localeCompare(b.item.location.name) ||
                a.item.name.localeCompare(b.item.name) ||
                a.id.localeCompare(b.id)
            )
            .map(r => (
              <Box p="4" backgroundColor="white" borderRadius="8px" boxShadow="md">
                <Flex dir="row" alignItems="center" gap="8px" mb="8px">
                  <Heading as="h4" size="md">
                    {r.item.name}
                  </Heading>
                  <Text color="gray.500">{`Qty: ${r.quantity}`}</Text>
                  <Flex dir="row" color="black">
                    <MapPinIcon />
                    <Text>{r.item.location.name}</Text>
                  </Flex>
                </Flex>
                {statuses(r.status)}
              </Box>
            ))
        ) : (
          // .map((r: Request) => <Box>Hello</Box>)
          <Box my="auto" mx="auto" fontWeight="semibold" color="gray.600">
            Requests you make will appear here!
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default RequestedList;
