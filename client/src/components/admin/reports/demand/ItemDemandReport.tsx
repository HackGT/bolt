import React from "react";
import { useQuery } from "@apollo/client";
import { Header, List, Message, Table } from "semantic-ui-react";
import DataTable from "react-data-table-component";

import { DETAILED_ITEM_STATISTICS } from "../../../../graphql/Queries";
import LoadingSpinner from "../../../util/LoadingSpinner";
import {
  ABANDONED,
  APPROVED,
  CANCELLED,
  DAMAGED,
  DENIED,
  FULFILLED,
  ItemWithStatistics,
  LOST,
  RETURNED,
} from "../../../../types/Hardware";
import { ReportError } from "../ReportError";

const detailSort = (a: string, b: string) => {
  // Get decimal percentage between parentheses
  const parenthesesRegex = /\((\d*.\d*)%\)/;

  const aPercent = parenthesesRegex.exec(a) ?? [];
  const bPercent = parenthesesRegex.exec(b) ?? [];

  if (aPercent.length > 1 && bPercent.length > 1) {
    return parseFloat(aPercent[1]) - parseFloat(bPercent[1]);
  }

  return 0;
};

const columns = [
  {
    name: "Location",
    selector: "item.location.name",
    sortable: true,
    grow: 2,
  },
  {
    name: "Item",
    selector: "item.name",
    sortable: true,
    grow: 2,
  },
  {
    name: "Total Available",
    selector: "item.totalAvailable",
    sortable: true,
    center: true,
  },
  {
    name: "Demand",
    selector: "totalDemand",
    sortable: true,
    center: true,
    sortFunction: (first: any, second: any) => detailSort(first.totalDemand, second.totalDemand),
  },
  {
    name: "Qty Approved",
    selector: "totalApproved",
    sortable: true,
    center: true,
    sortFunction: (first: any, second: any) =>
      detailSort(first.totalApproved, second.totalApproved),
  },
  {
    name: "Qty Fulfilled",
    selector: "totalFulfilled",
    sortable: true,
    center: true,
    sortFunction: (first: any, second: any) =>
      detailSort(first.totalFulfilled, second.totalFulfilled),
  },
  {
    name: "Qty Not Fulfilled",
    selector: "totalNotFulfilled",
    sortable: true,
    center: true,
  },
  {
    name: "Qty Returned",
    selector: "totalReturned",
    sortable: true,
    center: true,
  },
  {
    name: "Qty Lost/Damaged",
    selector: "totalLostDamaged",
    sortable: true,
    center: true,
    sortFunction: (first: any, second: any) =>
      detailSort(first.totalLostDamaged, second.totalLostDamaged),
  },
];

const columnDefs = [
  {
    column: "Demand",
    def: "The total quantity of this item that has ever been requested",
  },
  {
    column: "Qty Approved",
    def: "The total quantity of this item in requests with status approved, fulfilled, or returned",
  },
  {
    column: "Qty Fulfilled",
    def: "The total quantity of this item in requests with status fulfilled or returned",
  },
  {
    column: "Qty Not Fulfilled",
    def: "The total quantity of this item that was requested but not given out, indicated by a request status of abandoned, cancelled, or declined",
  },
  {
    column: "Qty Returned",
    def: "The total quantity of this item in requests with status returned",
  },
  {
    column: "Qty Lost/Damaged",
    def: "The total quantity of this item in requests with status lost or damaged.  The value in parentheses is this number divided by the item's Total Available value.",
  },
];

const ItemDemandReport: React.FC = () => {
  const { data, loading, error } = useQuery(DETAILED_ITEM_STATISTICS, {
    partialRefetch: true,
  });

  const totalRequests = loading
    ? 0
    : data.itemStatistics.reduce(
        (prev: number, item: ItemWithStatistics) => prev + item.detailedQuantities.total,
        0
      );

  function sumQtys(itemData: ItemWithStatistics, statuses: string[]) {
    return statuses.reduce(
      (accumulator: number, status: string) => itemData.detailedQuantities[status] + accumulator,
      0
    );
  }

  function calculatePartial(
    itemData: ItemWithStatistics,
    statuses: string[],
    totalAvailable: number
  ) {
    const itemTotal = sumQtys(itemData, statuses);
    const percent = ((itemTotal / totalAvailable) * 100).toPrecision(3);

    return `${itemTotal} (${percent}%)`;
  }

  const calculatedData =
    loading || totalRequests === 0
      ? []
      : data.itemStatistics.map((itemData: ItemWithStatistics) => {
          const { totalAvailable } = itemData.item;
          return {
            ...itemData,
            percentAllRequests: `${(itemData.detailedQuantities.total / totalRequests) * 100}%`,
            totalDemand: `${itemData.detailedQuantities.total} (${(
              (itemData.detailedQuantities.total / itemData.item.totalAvailable) *
              100
            ).toPrecision(3)}%)`,
            totalApproved: calculatePartial(
              itemData,
              [APPROVED, FULFILLED, RETURNED],
              totalAvailable
            ),
            totalFulfilled: calculatePartial(itemData, [FULFILLED, RETURNED], totalAvailable),
            totalNotFulfilled: sumQtys(itemData, [ABANDONED, CANCELLED, DENIED]),
            totalReturned: sumQtys(itemData, [RETURNED]),
            totalLostDamaged: calculatePartial(itemData, [LOST, DAMAGED], totalAvailable),
          };
        });

  if (error) {
    return <ReportError header="Item Demand Report" errorMessage={error.message} />;
  }

  return (
    <>
      <Header content="Item Demand Report" size="huge" />
      <Message>
        <Message.Header>About this report</Message.Header>
        <Message.Content>
          <List>
            <List.Item>
              For accurate information, ensure that each item's Total Available value is correct.
            </List.Item>
            <List.Item>
              <Table compact celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell content="Column" />
                    <Table.HeaderCell content="Definition" />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {columnDefs.map(elem => (
                    <Table.Row key={elem.column}>
                      <Table.Cell content={elem.column} />
                      <Table.Cell content={elem.def} />
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </List.Item>
          </List>
        </Message.Content>
      </Message>

      <DataTable
        columns={columns}
        data={calculatedData || []}
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

export default ItemDemandReport;
