import { useQuery } from "@apollo/client";
import dateFormat from "dateformat";
import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import { Button, Header, Icon, Input, Message } from "semantic-ui-react";

import { Request } from "../../types/Request";
import { ALL_REQUESTS } from "../../graphql/Queries";
import LoadingSpinner from "../util/LoadingSpinner";

const columns = [
  {
    name: "Id",
    selector: "id",
    sortable: true,
  },
  {
    name: "Item Name",
    selector: "item.name",
    sortable: true,
    grow: 2,
  },
  {
    name: "Quantity",
    selector: "quantity",
    sortable: true,
    center: true,
  },
  {
    name: "User",
    selector: "user.name",
    sortable: true,
    center: true,
    grow: 2,
  },
  {
    name: "Status",
    selector: "status",
    sortable: true,
    center: true,
    grow: 3,
  },
  {
    name: "Created At",
    selector: (row: any) => dateFormat(row.createdAt, "hh:MM:ss TT -- mm/dd/yy"),
    sortable: true,
    center: true,
    grow: 3,
  },
  {
    name: "Edit",
    selector: (row: any) => (
      <Button
        as={Link}
        primary
        basic
        compact
        size="tiny"
        to={`/admin/requests/${row.id}`}
        style={{ margin: 0 }}
      >
        Edit
      </Button>
    ),
    center: true,
  },
];

const AdminRequestsWrapper: React.FC = () => {
  const { data, loading, error } = useQuery(ALL_REQUESTS);
  const [searchQuery, setSearchQuery] = useState("");

  if (error) {
    return (
      <Message
        error
        visible
        header="Can't fetch requests"
        content={`Hmm, an error is preventing us from displaying the list of requests.  The error was: ${error.message}`}
      />
    );
  }

  const filteredData =
    data && data.requests
      ? data.requests.filter(
          (request: Request) =>
            request.id.toString().indexOf(searchQuery) !== -1 ||
            request.item.name.toLowerCase().indexOf(searchQuery) !== -1 ||
            request.user.name.toLowerCase().indexOf(searchQuery) !== -1 ||
            request.status.toLowerCase().indexOf(searchQuery) !== -1
        )
      : [];

  return (
    <>
      <Header content="Manage Requests" size="huge" />
      <Input
        type="text"
        label="Search requests"
        name="searchQuery"
        onChange={(e, { value }) => {
          setSearchQuery(value.trim().toLowerCase());
        }}
        style={{ marginBottom: "10px", marginRight: "30px" }}
      />
      <Button
        primary
        icon
        labelPosition="left"
        as={Link}
        to="/admin/requests/new"
        style={{ marginBottom: "10px" }}
      >
        <Icon name="plus circle" />
        Create request
      </Button>
      <DataTable
        columns={columns}
        data={filteredData}
        dense
        defaultSortField="id"
        defaultSortAsc={false}
        fixedHeader
        pagination
        paginationComponentOptions={{
          selectAllRowsItem: true,
        }}
        paginationPerPage={25}
        paginationRowsPerPageOptions={[25, 50, 100]}
        progressPending={loading}
        noHeader
        striped
        progressComponent={<LoadingSpinner active content="Crunching the numbers..." />}
      />
    </>
  );
};

export default AdminRequestsWrapper;
