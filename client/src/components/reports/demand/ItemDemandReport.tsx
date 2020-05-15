import React, {useMemo, useState} from 'react';
import {useQuery} from "@apollo/react-hooks";
import {DETAILED_ITEM_STATISTICS} from "../../util/graphql/Queries";
import {Button, Header, Icon, List, Message, Table} from "semantic-ui-react";
import DataTable from "react-data-table-component";
import LoadingSpinner from "../../util/LoadingSpinner";
import {FULFILLED, ItemWithStatistics, RETURNED} from "../../../types/Hardware";

function ColumnDef(column: string, def: string) {
	return {column, def};
}

function ItemDemandReport(props: {}) {
	const {data, loading, error, refetch} = useQuery(DETAILED_ITEM_STATISTICS, {
		partialRefetch: true,
		pollInterval: 30000
	});

	const [refreshLoading, setRefreshLoading] = useState(false);

	const columns = useMemo(() => [
		{
			name: "Location",
			selector: "item.location.location_name",
			sortable: true,
			grow: 2

		},
		{
			name: "Item",
			selector: "item.item_name",
			sortable: true,
			grow: 2
		},
		{
			name: "Total Available",
			selector: "item.totalAvailable",
			sortable: true,
			center: true
		},
		{
			name: "Demand",
			selector: "totalDemand",
			sortable: true,
			center: true
		},
		{
			name: "Qty Approved",
			selector: "totalApproved",
			sortable: true,
			center: true
		},
		{
			name: "Qty Fulfilled",
			selector: "totalFulfilled",
			sortable: true,
			center: true
		},
		{
			name: "Qty Not Fulfilled",
			selector: "totalNotFulfilled",
			sortable: true,
			center: true
		},
		{
			name: "Qty Returned",
			selector: "totalReturned",
			sortable: true,
			center: true
		},
		{
			name: "Qty Lost/Damaged",
			selector: "totalLostDamaged",
			sortable: true,
			center: true
		}
	], []);

	const totalRequests = loading ? 0 : data.itemStatistics.reduce((prev: number, item: ItemWithStatistics) =>
		prev + item.detailedQuantities.total, 0);

	function sumQtys(itemData: ItemWithStatistics, statuses: string[]) {
		return statuses.reduce((accumulator: number, status: string) => itemData.detailedQuantities[status] + accumulator, 0);
	}


	const calculatedData = loading || totalRequests == 0 ? [] : data.itemStatistics.map((itemData: ItemWithStatistics) => {
		console.log(sumQtys(itemData, [FULFILLED, RETURNED]));
		return {
			...itemData,
			percentAllRequests: `${itemData.detailedQuantities.total / totalRequests * 100}%`,
			totalDemand: `${itemData.detailedQuantities.total} (${(itemData.detailedQuantities.total / itemData.item.totalAvailable * 100).toPrecision(3)}%)`,
			totalFulfilled: `${sumQtys(itemData, [FULFILLED, RETURNED])} (${(sumQtys(itemData, [FULFILLED, RETURNED]) / itemData.item.totalAvailable * 100).toPrecision(3)}%)`,
			totalApproved: `${itemData.detailedQuantities.APPROVED + itemData.detailedQuantities.FULFILLED + itemData.detailedQuantities.RETURNED} (${((itemData.detailedQuantities.APPROVED + itemData.detailedQuantities.FULFILLED + itemData.detailedQuantities.RETURNED) / itemData.item.totalAvailable * 100).toPrecision(3)}%)`,
			totalNotFulfilled: `${itemData.detailedQuantities.ABANDONED + itemData.detailedQuantities.CANCELLED + itemData.detailedQuantities.DENIED}`,
			totalReturned: `${itemData.detailedQuantities.RETURNED} (${(itemData.detailedQuantities.RETURNED / itemData.item.totalAvailable * 100).toPrecision(3)}%)`,
			totalLostDamaged: `${itemData.detailedQuantities.LOST + itemData.detailedQuantities.DAMAGED} (${((itemData.detailedQuantities.LOST + itemData.detailedQuantities.DAMAGED) / itemData.item.totalAvailable * 100).toPrecision(3)}%)`,

		}
	});

	async function callRefetch() {
		setRefreshLoading(true);
		await refetch();
		setRefreshLoading(false);
	}

	if (error) {
		return <>
			<Header content={"Item Demand Report"} size={"huge"}/>
			<Message negative>
				<Message.Header>Error displaying report</Message.Header>
				<p>Something is preventing us from showing this report: {error.message}</p>
			</Message>
		</>;
	}

	const columnDefs = [
		ColumnDef("Demand", "The total quantity of this item that has ever been requested"),
		ColumnDef("Qty Approved", "The total quantity of this item in requests with status approved, fulfilled, or returned"),
		ColumnDef("Qty Fulfilled", "The total quantity of this item in requests with status fulfilled or returned"),
		ColumnDef("Qty Not Fulfilled", "The total quantity of this item that was requested but not given out, indicated by a request status of abandoned, cancelled, or denied/declined"),
		ColumnDef("Qty Returned", "The total quantity of this item in requests with status returned.  Note that some items"),
		ColumnDef("Qty Not Fulfilled", "The total quantity of this item in requests with status lost or damaged")

	];

	return (
		<>
			<Header content={"Item Demand Report"} size={"huge"}/>
			<Message>
				<p><Icon name={"info circle"}/> Data refreshes automatically every 30 seconds.</p>
				<Button size={"tiny"} primary
				        loading={loading || refreshLoading}
				        disabled={loading || refreshLoading}
				        onClick={callRefetch}>Refresh now</Button>
			</Message>
			<Message>
				<Message.Header>About this report</Message.Header>
				<Message.Content>
					<List>
						<List.Item>For accurate information, ensure that each item's Total Available value
							is correct.</List.Item>
						<List.Item>
							<Table compact celled>
								<Table.Header>
									<Table.Row>
										<Table.HeaderCell content={"Column"}/>
										<Table.HeaderCell content={"Definition"}/>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{columnDefs.map((elem) => <Table.Row key={elem.column}>
										<Table.Cell content={elem.column}/>
										<Table.Cell content={elem.def}/>
									</Table.Row>)}
								</Table.Body>
							</Table>
						</List.Item>
					</List>
				</Message.Content>

			</Message>

			<DataTable columns={columns}
			           data={calculatedData || []}
			           dense
			           defaultSortField={"item.location.location_name"}
			           fixedHeader
			           pagination
			           paginationComponentOptions={{
				           selectAllRowsItem: true
			           }}
			           paginationRowsPerPageOptions={[25, 50, 100]}
			           progressPending={loading}
			           noHeader
			           striped
			           progressComponent={<LoadingSpinner active content={"Crunching the numbers..."}/>}
			/>
		</>
	);
}

export default ItemDemandReport;
