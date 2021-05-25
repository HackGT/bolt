import React from "react";
import DataTable from "react-data-table-component";
import { useQuery } from "@apollo/client";
import { Header, Icon, Message } from "semantic-ui-react";

import LoadingSpinner from "../../../util/LoadingSpinner";
import { DETAILED_ITEM_STATISTICS } from "../../../../graphql/Queries";
import { ReportError } from "../ReportError";

const columns = [
  {
    name: "Location",
    selector: "item.location.name",
    sortable: true,
    grow: 5,
  },
  {
    name: "Item",
    selector: "item.name",
    sortable: true,
    grow: 6,
  },
  {
    name: "Total",
    selector: "detailedQuantities.total",
    sortable: true,
    center: true,
  },
  {
    name: "Submitted",
    selector: "detailedQuantities.SUBMITTED",
    sortable: true,
    center: true,
  },
  {
    name: "Approved",
    selector: "detailedQuantities.APPROVED",
    sortable: true,
    center: true,
  },
  {
    name: "Denied",
    selector: "detailedQuantities.DENIED",
    sortable: true,
    center: true,
  },
  {
    name: "RFP",
    selector: "detailedQuantities.READY_FOR_PICKUP",
    sortable: true,
    center: true,
  },
  {
    name: "Fulfilled",
    selector: "detailedQuantities.FULFILLED",
    sortable: true,
    center: true,
  },
  {
    name: "Returned",
    selector: "detailedQuantities.RETURNED",
    sortable: true,
    center: true,
  },
  {
    name: "Kept",
    selector: "detailedQuantities.KEPT",
    sortable: true,
    center: true,
  },
  {
    name: "Lost",
    selector: "detailedQuantities.LOST",
    sortable: true,
    center: true,
  },
  {
    name: "Damaged",
    selector: "detailedQuantities.DAMAGED",
    sortable: true,
    center: true,
  },
  {
    name: "Abandoned",
    selector: "detailedQuantities.ABANDONED",
    sortable: true,
    center: true,
  },
  {
    name: "Cancelled",
    selector: "detailedQuantities.CANCELLED",
    sortable: true,
    center: true,
  },
];

const DetailedItemStatistics: React.FC = () => {
  const { data, loading, error } = useQuery(DETAILED_ITEM_STATISTICS, {
    partialRefetch: true,
    pollInterval: 120000,
  });

  if (error) {
    return <ReportError header="Detailed Item Statistics" errorMessage={error.message} />;
  }

  return (
    <>
      <Header content="Detailed Item Statistics" size="huge" />
      <Message>
        <Icon name="info circle" /> Data refreshes automatically every 2 minutes.
      </Message>
      <DataTable
        columns={columns}
        data={data && data.itemStatistics ? data.itemStatistics : []}
        dense
        defaultSortField="item.location.name"
        fixedHeader
        pagination
        paginationComponentOptions={{
          selectAllRowsItem: true,
        }}
        paginationRowsPerPageOptions={[25, 50, 100]}
        progressPending={loading}
        noHeader
        striped
        progressComponent={<LoadingSpinner active content="Crunching the numbers..." />}
      />
    </>
  );
};

export default DetailedItemStatistics;
