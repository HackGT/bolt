import React, {Component} from "react";
import {Grid} from "semantic-ui-react";
import RequestManagementBoard from "./RequestManagement/RequestManagementBoard";
import {ItemStatus, RequestedItem} from "./inventory/HardwareItem";

const cardStyle = {
    padding: "10px"
};
export interface UserItemList {
    user: string;
    items: any[];
}

// export interface NoUserItemList {
//     id: number,
//     name: string,
//     qtyRequested: number,
//     category: string,
//     status: ItemStatus,
//     cancelled: boolean,
// }

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
        status: ItemStatus.APPROVED,
        cancelled: false
    },
    {
        id: 6,
        user: "Obunga",
        name: "Raspberry PI",
        qtyRequested: 3,
        category: "Microcontrollers",
        status: ItemStatus.SUBMITTED,
        cancelled: false
    },
];
interface RequestManagementContainerState {
    items: RequestedItem[];
}

class RequestManagementContainer extends Component<{}, RequestManagementContainerState> {
    constructor(props: any) {
        super(props);
        this.state = {
            items: sampleItems
        };
    }

    public handleApprove = (id: number) => {
        console.log("handling approve");
        const index = sampleItems.findIndex((item) => {
            return item.id === id;
        });
        sampleItems[index].status = ItemStatus.APPROVED;
        this.setState({
            items: sampleItems
        });
    }

    public handleDecline = (id: number) => {
        console.log("handling decline");
    }

    public handleReady = (user: string) => {
        for (let i = 0; i < sampleItems.length; i++) {
            if (sampleItems[i].user === user) {
                sampleItems[i].status = ItemStatus.READY;
            }
        }

        this.setState({
            items: sampleItems
        });
    }

    public handleDone = (user: string) => {
        for (let i = 0; i < sampleItems.length; i++) {
            if (sampleItems[i].user === user) {
                sampleItems[i].status = ItemStatus.FULFILLED;
            }
        }

        this.setState({
            items: sampleItems
        });
    }

    public handleCross = (user: string) => {

        for (let i = 0; i < sampleItems.length; i++) {
            if (sampleItems[i].user === user) {
                sampleItems[i].status = ItemStatus.SUBMITTED;
            }
        }

        this.setState({
            items: sampleItems
        });
    }

    public handlePrep = (user: string) => {

        for (let i = 0; i < sampleItems.length; i++) {
            if (sampleItems[i].user === user) {
                sampleItems[i].status = ItemStatus.APPROVED;
            }
        }

        this.setState({
            items: sampleItems
        });
    }


    public render() {
        this.getItems(ItemStatus.SUBMITTED);
        return (
            <Grid>
                <Grid.Row columns={3}>
                    <RequestManagementBoard
                        title="Submitted"
                        items={this.getItems(ItemStatus.SUBMITTED)}
                        sortedItems={[]}
                        sortByUsers={false}
                        backToPrep={false}
                        handleApprove={this.handleApprove}
                        handleDecline={this.handleDecline}
                        handleReady={this.handleReady}
                        handleCross={this.handleCross}
                        handlePrep={this.handlePrep}
                        handleDone={this.handleDone}
                    />
                    <RequestManagementBoard
                        title="Ready to Prepare"
                        items={[] as RequestedItem[]}
                        sortedItems={this.getItemsForEachUser(ItemStatus.APPROVED)}
                        sortByUsers={true}
                        backToPrep={false}
                        handleApprove={this.handleApprove}
                        handleDecline={this.handleDecline}
                        handleReady={this.handleReady}
                        handleCross={this.handleCross}
                        handlePrep={this.handlePrep}
                        handleDone={this.handleDone}
                    />
                    <RequestManagementBoard
                        title="Ready for Pickup"
                        items={[] as RequestedItem[]}
                        sortedItems={this.getItemsForEachUser(ItemStatus.READY)}
                        sortByUsers={true}
                        backToPrep={true}
                        handleApprove={this.handleApprove}
                        handleDecline={this.handleDecline}
                        handleReady={this.handleReady}
                        handleCross={this.handleCross}
                        handlePrep={this.handlePrep}
                        handleDone={this.handleDone}
                    />
                </Grid.Row>
            </Grid>
        );
    }

    public getItems(status: ItemStatus) {
        return sampleItems.filter(item => {
            return item.status === status;
        });
    }

    public getItemsForEachUser(status: ItemStatus) {
        const itemsList = sampleItems;
        const newItemsList: UserItemList[] = [];

        itemsList.forEach(outerItem => {
            if (outerItem.status === status) {
                let flag = false;
                for (let i = 0; i < newItemsList.length; i++) {
                    if (newItemsList[i].user === outerItem.user) {
                        newItemsList[i].items.push({
                            id: outerItem.id,
                            name: outerItem.name,
                            qtyRequested: outerItem.qtyRequested,
                            category: outerItem.category,
                            status: outerItem.status,
                            cancelled: outerItem.cancelled,
                        });
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    newItemsList.push({
                        user: outerItem.user,
                        items: [
                            {
                                id: outerItem.id,
                                name: outerItem.name,
                                qtyRequested: outerItem.qtyRequested,
                                category: outerItem.category,
                                status: outerItem.status,
                                cancelled: outerItem.cancelled,
                            }
                        ]
                    });
                }
            }
        });
        return newItemsList;
    }
}

export default RequestManagementContainer;
