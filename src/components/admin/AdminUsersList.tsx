// TODO: Fix search bar reloads on every keypress
import React, { useCallback, useMemo, useState } from "react";
import { Tag, IconButton, useDisclosure, Text } from "@chakra-ui/react";
import {
  ErrorScreen,
  SearchableTable,
  useAuth,
  Service,
  apiUrl,
  LoadingScreen,
} from "@hex-labs/core";
import useAxios from "axios-hooks";
import { LinkIcon } from "@chakra-ui/icons";
import UserRequestsModal from "./UserRequestsModal";
import axios from "axios";

const limit = 50;

function RowEntry(props: { row: any }) {
  return (
    <Text fontWeight="medium">
      {props.row.name.first}
      {props.row.name.middle ? " " : ""}
      {props.row.name.middle} {props.row.name.last}
    </Text>
  );
}

function Roles(props: { roles: any }) {
  return (
    <>
      {props.roles?.member && <Tag m="5px">Member</Tag>}
      {props.roles?.admin && <Tag m="5px">Admin</Tag>}
      {props.roles?.exec && <Tag m="5px">Exec</Tag>}
    </>
  );
}

function Requests(props: { user: any; onOpen: any }) {
  return (
    <IconButton
      icon={<LinkIcon fontSize="1.25rem" />}
      variant="ghost"
      aria-label="View Requests"
      onClick={() => props.onOpen(props.user)}
    />
  );
}

const AllApplicationsTable: React.FC = () => {
  const [offset, setOffset] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [{ data, loading, error }, refetch] = useAxios({
    method: "GET",
    url: "https://users.api.hexlabs.org/users",
    params: {
      search: searchText,
      offset,
    },
  });

  const [{data: requestsData, loading: requestsLoading, error: requestsError}] = useAxios(
    apiUrl(Service.HARDWARE, `/hardware-requests`)
  );

  const onPreviousClicked = () => {
    setOffset(offset - limit);
  };
  const onNextClicked = () => {
    setOffset(offset + limit);
  };
  const onSearchTextChange = (event: any) => {
    setSearchText(event.target.value);
    setOffset(0);
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentModalData, setCurrentModalData] = useState<any>([]);

  const handleModalOpen = async (user: any) => {
    const userRequests = requestsData?.filter((r: any) => r.user.userId === user.userId);
    setCurrentModalData(userRequests);
    onOpen();
  };

  const handleModalClose = () => {
    setCurrentModalData([]);
    onClose();
  };

  const columns = [
    {
      key: 0,
      header: "Name",
      accessor: (row: any) => RowEntry({ row }),
    },
    {
      key: 1,
      header: "Email",
      accessor: (row: any) => row.email,
    },
    {
      key: 2,
      header: "Permissions",
      accessor: (row: any) => Roles({ roles: row.roles }),
    },
    {
      key: 3,
      header: "Requests",
      accessor: (row: any) => Requests({ user: row, onOpen: handleModalOpen }),
    },
  ];

  if (loading || requestsLoading) {
    return <LoadingScreen />;
  }

  if (error || requestsError) {
    return <ErrorScreen error={error || requestsError as Error} />;
  }

  return (
    <>
      <SearchableTable
        title="Users"
        data={data?.profiles}
        columns={columns}
        searchText={searchText}
        onSearchTextChange={onSearchTextChange}
        onPreviousClicked={onPreviousClicked}
        onNextClicked={onNextClicked}
        offset={offset}
        total={data?.total}
      />
      <UserRequestsModal data={currentModalData} isOpen={isOpen} onClose={handleModalClose} />
    </>
  );
};

export default AllApplicationsTable;
