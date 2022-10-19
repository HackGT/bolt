import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import { LoadingScreen } from "@hex-labs/core";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import React, { useMemo } from "react";

import { APPROVED, READY_FOR_PICKUP, SUBMITTED } from "../../../../types/Hardware";
import { Request, RequestStatus } from "../../../../types/Request";

const columnHelper = createColumnHelper<Request>();

export const generateBadge = (status: RequestStatus) => {
  switch (status) {
    case SUBMITTED:
      return <Badge colorScheme="purple">Submitted</Badge>;
    case APPROVED:
      return <Badge colorScheme="green">Approved</Badge>;
    case READY_FOR_PICKUP:
      return (
        <Badge bgGradient="linear(to-r, cyan.400, purple.500)" color="white">
          Ready For Pickup
        </Badge>
      );
    default:
      return <Badge colorScheme="gray">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  }
};

const columns = [
  columnHelper.accessor("user.displayName", {
    cell: info => (
      <Flex
        bgColor="gray.200"
        maxW="fit-content"
        rounded="full"
        pl={0.5}
        gap={1}
        pr={3}
        py={0.5}
        fontSize={14}
        alignItems="center"
      >
        <Flex
          bgColor="blue.400"
          color="white"
          fontSize={12}
          rounded="full"
          w={5}
          h={5}
          justify="center"
          alignItems="center"
        >
          {(info.getValue() as string)[0]}
        </Flex>
        {info.getValue()}
      </Flex>
    ),
    header: () => <span>Recipient</span>,
  }),
  columnHelper.accessor("user.email", {
    cell: info => (
      <Flex px={3} py={0.5} bgColor="gray.200" rounded="full" maxW="fit-content">
        {info.getValue()}
      </Flex>
    ),
    header: () => <span>Email</span>,
  }),
  columnHelper.accessor("item.name", {
    cell: info => (
      <Flex px={3} py={0.5} bgColor="gray.200" rounded="full" maxW="fit-content">
        {info.getValue()}
      </Flex>
    ),
    header: () => <span>Item</span>,
  }),
  columnHelper.accessor("item.totalAvailable", {
    cell: info => info.getValue(),
    header: () => <span>Total Available</span>,
  }),
  columnHelper.accessor("quantity", {
    cell: info => info.getValue(),
    header: () => <span>Quantity Requested</span>,
  }),
  columnHelper.accessor("status", {
    cell: info => generateBadge(info.getValue()),
    header: () => <span>Status</span>,
  }),
  columnHelper.accessor("id", {
    cell: info => (
      <Flex gap={2}>
        <Tooltip label="Approve request">
          <IconButton
            aria-label="approve"
            icon={<CheckIcon />}
            variant="ghost"
            colorScheme="green"
          />
        </Tooltip>
        <Tooltip label="Deny request">
          <IconButton aria-label="deny" icon={<CloseIcon />} variant="ghost" colorScheme="red" />
        </Tooltip>
        <Button variant="ghost">Edit</Button>
      </Flex>
    ),
    header: () => <span>Actions</span>,
  }),
];

const SubmittedTable = () => {
  const { data, isLoading } = useQuery(["requests"], async () => {
    const response = await axios.get("/requests");
    return response.data;
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <TableContainer>
      <Heading size="lg" mt={2} mb={4}>
        All Requests
      </Heading>
      <Button colorScheme="twitter">Add Request</Button>
      {/* <Input type="text" /> */}
      <Table variant="simple">
        <Thead>
          {table.getHeaderGroups().map(headerGroup => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <Th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table.getRowModel().rows.map(row => (
            <Tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default SubmittedTable;
