import React, {useMemo} from 'react';
import {useQuery} from "@apollo/react-hooks";
import {DETAILED_ITEM_STATISTICS} from "../../util/graphql/Queries";
import {Header, Icon, Message} from "semantic-ui-react";
import DataTable from "react-data-table-component";
import LoadingSpinner from "../../util/LoadingSpinner";
import {ItemWithStatistics} from "../../../types/Hardware";

function ItemDemandReport(props: {}) {
	const {data, loading, error} = useQuery(DETAILED_ITEM_STATISTICS, {
		partialRefetch: true,
		pollInterval: 30000
	});

	const columns = useMemo(() => [
		{
			name: "Location",
			selector: "item.location.location_name",
			sortable: true,
			grow: 5

		},
		{
			name: "Item",
			selector: "item.item_name",
			sortable: true,
			grow: 6
		},
		{
			name: "Total",
			selector: "detailedQuantities.total",
			sortable: true,
			center: true
		},
		{
			name: "% All",
			selector: "percentAllRequests",
			sortable: true,
			center: true
		},
		{
			name: "Total Avail.",
			selector: "item.totalAvailable",
			sortable: true,
			center: true
		},
		{
			name: "% Inventory",
			selector: "totalRequestedPercent",
			sortable: true,
			center: true
		}
	], []);

	const totalRequests = loading ? 0 : data.itemStatistics.reduce((prev: number,item: ItemWithStatistics) =>
		prev + item.detailedQuantities.total, 0);

	console.log(totalRequests)
	const calculatedData = loading || totalRequests == 0 ? [] : data.itemStatistics.map((itemData: ItemWithStatistics) => {
		return {
			...itemData,
			percentAllRequests: `${itemData.detailedQuantities.total / totalRequests * 100}%`,
			totalRequestedPercent: `${(itemData.detailedQuantities.total / itemData.item.totalAvailable * 100).toFixed(2)}%`
		}
	});


	if (error) {
		return <>
			<Header content={"Item Demand Report"} size={"huge"} />
			<Message negative>
				<Message.Header>Error displaying report</Message.Header>
				<p>Something is preventing us from showing this report: {error.message}</p>
			</Message>
		</>;
	}

	return (
		<>
			<Header content={"Item Demand Report"} size={"huge"} />
			<Message><Icon name={"info circle"}/> Data refreshes automatically every 30 seconds.</Message>
			<DataTable columns={columns}
			           data={calculatedData || []}
			           dense
			           defaultSortField={"item.location.location_name"}
			           fixedHeader
			           pagination
			           paginationComponentOptions={{
				           selectAllRowsItem: true
			           }}
			           paginationRowsPerPageOptions={[25,50,100]}
			           progressPending={loading}
			           noHeader
			           striped
			           progressComponent={<LoadingSpinner active content={"Crunching the numbers..."} />}
			/>
		</>
	);
}

export default ItemDemandReport;
