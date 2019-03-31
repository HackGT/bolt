import React, {Component} from 'react';
import {Grid} from "semantic-ui-react";
import RequestManagementBoard from "./RequestManagement/RequestManagementBoard";
import {RequestedItem, ItemStatus} from "./inventory/HardwareItem"

const boardStyle = {
    height: "40rem",
    overflowY: "scroll",
    background: "#eaeaea",
    overflowX: "hidden",
    padding: "15px "
}

const cardStyle = {
    padding: "10px"
}

/*
export interface RequestedItem {
    id: number,
    user: string,
    name: string,
    qtyRequested: number,
    category: string,
    status: ItemStatus,
    cancelled: boolean
}
*/
const sampleItems: RequestedItem[] = [
    {
        id: 1,
        user: "Beardell",
        name: "Arduino UNO",
        qtyRequested: 3,
        category: "Microcontrollers",
        status: ItemStatus.SUBMITTED,
        cancelled: false
    },
    {
        id: 2,
        user: "Obunga",
        name: "Raspberry PI",
        qtyRequested: 2,
        category: "Microcontrollers",
        status: ItemStatus.SUBMITTED,
        cancelled: false
    },
    {
        id: 3,
        user: "Obunga",
        name: "10 Ohm Resistors",
        qtyRequested: 5,
        category: "Resistors",
        status: ItemStatus.SUBMITTED,
        cancelled: false
    },
    {
        id: 4,
        user: "Ant Man",
        name: "10 Ohm Resistors",
        qtyRequested: 40,
        category: "Resistors",
        status: ItemStatus.SUBMITTED,
        cancelled: false
    },
    {
        id: 5,
        user: "Waluigi",
        name: "Mango",
        qtyRequested: 1,
        category: "People?",
        status: ItemStatus.SUBMITTED,
        cancelled: false
    }
]

class RequestManagementContainer extends Component {
    render() {
        return (
            <Grid>
                <Grid.Row columns={3}>
                    <RequestManagementBoard
                        title="Submitted"
                        boardStyle={boardStyle}
                        items={sampleItems}
                    />
                    <RequestManagementBoard
                        title="Ready to Prepare"
                        boardStyle={boardStyle}
                        items={[] as RequestedItem[]}
                    />
                    <RequestManagementBoard
                        title="Ready for Pickup"
                        boardStyle={boardStyle}
                        items={[] as RequestedItem[]}
                    />
                </Grid.Row>
            </Grid>
        )
    }
}

export default RequestManagementContainer;
