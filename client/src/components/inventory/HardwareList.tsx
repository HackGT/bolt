import React from 'react';
import HardwareItem from "./HardwareItem";
import {Icon, Item, Message, Grid, Header} from "semantic-ui-react";
import PlaceholderItem from "./PlaceholderItem";
import {RequestedItem} from "../inventory/HardwareItem"

const sampleData = [
    {
        name: "Arduino Uno",
        description: "Potato potato let's call the whole thing off",
        qtyRemaining: 20,
        totalQty: 30,
        maxReqQty: 1,
        returnRequired: true,
        owner: "The Hive",
        category: "Microcontrollers",
        id: "541"
    },
    {
        name: "Mango",
        description: "The one and only Hardware Queen(TM)",
        qtyRemaining: 0,
        totalQty: 1,
        maxReqQty: 1,
        returnRequired: true,
        owner: "Mango",
        category: "People?",
        id: "3432"
    },
    {
        name: "Raspberry Pi 3",
        description: "We heard you like fruit so we put a fruit in ya computer",
        qtyRemaining: 20,
        totalQty: 30,
        maxReqQty: 1,
        returnRequired: true,
        owner: "HackGT",
        category: "Microcontrollers",
        id: "4642"
    },
    {
        name: "10 Ohm Resistors",
        description: "Not 9, not 11, 10 Ohms.  The perfect amount",
        qtyRemaining: 1000,
        totalQty: 1000,
        maxReqQty: 10,
        returnRequired: false,
        owner: "",
        category: "Resistors",
        id: "46234"
    },
];

export class HardwareList extends React.Component<{ requestsEnabled: boolean, handleAddItem: (item: RequestedItem) => void, qtyUpdate: RequestedItem | null}, { loading: boolean }> {

    constructor(props: { requestsEnabled: boolean, handleAddItem: (item: RequestedItem) => void, qtyUpdate: RequestedItem | null}) {
        super(props);
        this.state = {
            loading: true
        };
        this.dataCallback = this.dataCallback.bind(this);
    }

    dataCallback() {
        this.setState({
            loading: false
        });
    }

    componentDidMount(): void {
        setTimeout(this.dataCallback, 3000);
    }

    render() {
        const noRequestsMessage = !this.props.requestsEnabled ? (<Message
            title="View-only inventory"
            warning icon>
            <Icon name='clock outline'/>
            Hardware checkout requests can be made after March 19, 2019, at 5:04 PM.
        </Message>) : '';

        sampleData.sort((a, b) => {
            return a.category.toLocaleLowerCase().localeCompare(b.category.toLocaleLowerCase()) || a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
        });
        const normalContent = (<Item.Group>
            {sampleData.map((item) => (
                <HardwareItem name={item.name}
                              description={item.description}
                              requestsEnabled={this.props.requestsEnabled}
                              qtyRemaining={item.qtyRemaining}
                              totalQty={item.totalQty}
                              maxReqQty={item.maxReqQty}
                              category={item.category}
                              key={item.id}
                              id={item.id}
                              addItem={this.props.handleAddItem} // prop that invokes the handleAddItem method of parent container to update its state
                              qtyUpdate={this.props.qtyUpdate} // this prop is the object whose request has been cancelled
                />))}
        </Item.Group>);
        const loading = (<Item.Group>
            <PlaceholderItem/>
            <PlaceholderItem/>
            <PlaceholderItem/>
        </Item.Group>);

        return (
                <div>
                        <Header>Inventory</Header>
                        {noRequestsMessage}
                        {this.state.loading ? loading : normalContent}
                </div>
        )
    }
}

export default HardwareList;
