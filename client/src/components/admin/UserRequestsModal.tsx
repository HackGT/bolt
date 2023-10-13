import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  useToast,
  FormControl,
  Checkbox,
  Text,
  VStack,
  Heading,
  Tag,
  HStack,
  Box,
  TagLabel,
  TagLeftIcon,
  ModalFooter,
  TableContainer,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosPromise, AxiosRequestConfig } from "axios";
import useAxios, { RefetchOptions } from "axios-hooks";
import { CheckCircleIcon, WarningIcon, WarningTwoIcon } from "@chakra-ui/icons";
import { apiUrl, LoadingScreen, Service, useAuth } from "@hex-labs/core";
import { Request } from "../../types/Request";

interface Props {
  data: Request[];
  isOpen: boolean;
  onClose: () => void;
}

const RequestStatus = {
  SUBMITTED: "#63B3ED",
  APPROVED: "#68D391",
  DENIED: "#FC8181",
  ABANDONED: "#F6AD55",
  CANCELLED: "#E53E3E",
  READY_FOR_PICKUP: "#4FD1C5",
  FULFILLED: "#F687B3",
  RETURNED: "#B794F4",
  "DAMAGED/LOST": "#C05621",
};

const UserRequestsModal: React.FC<Props> = props => (
  <Modal onClose={props.onClose} isOpen={props.isOpen} isCentered>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Requests</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        {props.data && props.data.length > 0 ? (
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Item</Th>
                <Th>Status</Th>
                <Th isNumeric>Quantity</Th>
              </Tr>
            </Thead>
            <Tbody>
              {props.data.map((request: Request) => (
                <Tr>
                  <Td key={request.id} mt={2} justifyContent="space-between">
                    <Box>
                      <Text>{request.item.name}</Text>
                    </Box>
                  </Td>
                  <Td>
                    <Tag style={{ backgroundColor: RequestStatus[request.status] }}>
                      {request.status}
                    </Tag>
                  </Td>
                  <Td>
                    <Text color="gray.500">{`${request.quantity}`}</Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        ) : (
          <Text>This user has no requests!</Text>
        )
        }
      </ModalBody>
    </ModalContent>
    <ModalFooter />
  </Modal>
);

export default UserRequestsModal;
